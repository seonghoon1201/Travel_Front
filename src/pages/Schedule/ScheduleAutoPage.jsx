// src/pages/Plan/ScheduleAutoPage.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DefaultLayout from '../../layouts/DefaultLayout';
import BackHeader from '../../components/header/BackHeader';
import { message } from 'antd';
import useUserStore from '../../store/userStore';
import usePlanStore from '../../store/planStore';
import useCartStore from '../../store/cartStore';
import useScheduleStore from '../../store/scheduleStore';
import { createSchedule, optimizeSchedule, getSchedule } from '../../api';

// ---- helpers --------------------------------------------------------------
// 'HH:mm' 로 강제
const toHHmm = (v) => {
  const s = String(v || '').trim();
  if (!s) return '09:00';
  const m = s.match(/^(\d{1,2}):?(\d{2})/);
  if (!m) return '09:00';
  const hh = String(Math.min(23, Number(m[1] || 9))).padStart(2, '0');
  const mm = String(Math.min(59, Number(m[2] || 0))).padStart(2, '0');
  return `${hh}:${mm}`;
};

// 빈 값(undefined/null/'')은 키 자체를 제거
const clean = (obj) =>
  JSON.parse(
    JSON.stringify(obj, (_k, v) =>
      v === undefined || v === null || v === '' ? undefined : v
    )
  );

// contentId 기준 중복 제거 + 타입 정규화
const toScheduleItems = (items = []) => {
  const seen = new Set();
  const result = [];
  for (const it of items) {
    const contentId = String(
      it?.contentId ?? it?.id ?? it?.contentID ?? it?.content_id ?? ''
    ).trim();
    if (!contentId || seen.has(contentId)) continue;
    seen.add(contentId);
    const cost = Math.max(0, Math.round(Number(it?.price ?? it?.cost ?? 0)));
    result.push({ contentId, cost });
  }
  return result;
};

function makeTripTitle(locationIds) {
  const head =
    Array.isArray(locationIds) && locationIds[0] ? String(locationIds[0]) : '';
  return head ? `${head} 여행` : '여행 일정';
}

const ScheduleAutoPage = () => {
  const navigate = useNavigate();
  const scheduleStore = useScheduleStore();
  const cartItems = useCartStore((s) => s.items);

  const getSchedulePayload = usePlanStore((s) => s.getSchedulePayload);
  const locationIds = usePlanStore((s) => s.locationIds);
  const myUserId = useUserStore((s) => s.userId);
  const invitees = usePlanStore((s) => s.invitees);

  useEffect(() => {
    (async () => {
      // 카트 비었으면 방어
      if (!cartItems.length) {
        message.warning('장바구니가 비어있어요.');
        navigate(-1);
        return;
      }

      // 결과 페이지 보강용 placeIndex
      const idx = {};
      cartItems.forEach((it) => {
        const pid = String(it.contentId ?? '').trim();
        if (!pid) return;
        idx[pid] = {
          name: it.name,
          title: it.name,
          imageUrl: it.imageUrl,
          lat: it?.location?.lat,
          lng: it?.location?.lng,
          address: it.address,
        };
      });
      scheduleStore.setPlaceIndex(idx);

      try {
        // 1) 스토어 → 기본값 꺼내기
        const base = getSchedulePayload();

        // 2) 필수값 검증
        if (!base?.startDate || !base?.endDate) {
          message.error(
            '여행 날짜가 설정되지 않았어요. 날짜를 먼저 선택해 주세요.'
          );
          navigate(-1);
          return;
        }

        // 3) 스웨거 스키마에 맞춰 재구성
        const scheduleName =
          (base.scheduleName && String(base.scheduleName).trim()) ||
          makeTripTitle(locationIds);

        const hasGroupId = Boolean(base.groupId && String(base.groupId).trim());
        // ✅ 나를 제외한 실제 동행자 수
        const othersCount = Array.isArray(invitees)
          ? invitees.filter((u) => String(u.userId) !== String(myUserId)).length
          : 0;
        const isGroupTrip = hasGroupId && othersCount > 0;
        const scheduleType = isGroupTrip ? 'GROUP' : 'PERSONAL';

        // 스타일(사용자 선택값) 없으면 안전한 기본값
        const style = String(
          base.scheduleStyle ||
            (Array.isArray(base.styles) ? base.styles[0] : '') ||
            '쇼핑'
        ).trim();

        // 출발지/시간 기본값 보정
        const startPlace = String(
          base.startPlace || base.departurePlace || '서울역'
        );
        const startTime = toHHmm(
          base.startTime || base.departureTime || '09:00'
        );

        // 카트 → scheduleItem (중복제거)
        const scheduleItem = toScheduleItems(cartItems);
        if (!scheduleItem.length) {
          message.error(
            '일정에 담을 장소가 없어요. 장소를 장바구니에 추가해 주세요.'
          );
          navigate(-1);
          return;
        }

        // 4) 최종 페이로드 (그룹 아니면 groupId 완전 제거)
        const payload = clean({
          scheduleName,
          startDate: String(base.startDate),
          endDate: String(base.endDate),
          budget: Math.max(0, Math.round(Number(base.budget ?? 0))),
          groupId: isGroupTrip ? String(base.groupId) : undefined,
          scheduleType, // 'GROUP' | 'PERSONAL'
          scheduleStyle: style, // 예: '쇼핑', '힐링' 등
          startPlace,
          startTime, // 'HH:mm'
          scheduleItem, // [{ contentId, cost }]
        });

        // 🔎 콘솔에 "백엔드에 보낼 바디"와 근거 로그 출력
        console.groupCollapsed(
          '%c[schedule/create] Request payload',
          'color:#1677ff'
        );
        console.log('store raw →', {
          scheduleName: base.scheduleName,
          startDate: base.startDate,
          endDate: base.endDate,
          budget: base.budget,
          groupId: base.groupId,
          scheduleStyle: base.scheduleStyle,
          styles: base.styles,
          startPlace: base.startPlace || base.departurePlace,
          startTime: base.startTime || base.departureTime,
          inviteesCount: Array.isArray(invitees) ? invitees.length : 0,
        });
        console.log('computed flags →', {
          hasGroupId,
          othersCount,
          isGroupTrip,
          scheduleType,
        });
        console.log('scheduleItem count:', scheduleItem.length);
        console.log('payload →', payload);
        console.groupEnd();

        // 5) 생성 → 최적화 → 상세
        const created = await createSchedule(payload);
        const scheduleId = created?.scheduleId || created?.id;
        if (!scheduleId) throw new Error('scheduleId가 응답에 없습니다.');

        await optimizeSchedule(scheduleId);
        const detail = await getSchedule(scheduleId);
        scheduleStore.setDetail(detail);

        navigate(`/schedule/result/${scheduleId}`, { replace: true });
      } catch (e) {
        console.error('[ScheduleAutoPage] error', e?.response?.data || e);
        message.error(
          e?.response?.data?.message || '일정 생성/최적화에 실패했어요.'
        );
        navigate(-1);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DefaultLayout>
      <div className="w-full max-w-sm mx-auto px-4">
        <BackHeader title="일정 짜는 중..." />
        <div className="py-16 text-center">
          <div className="animate-pulse text-lg font-semibold">
            일정을 최적화하고 있어요...
          </div>
          <div className="mt-2 text-sm text-gray-500">잠시만 기다려 주세요</div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default ScheduleAutoPage;
