import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DefaultLayout from '../../layouts/DefaultLayout';
import BackHeader from '../../components/header/BackHeader';
import { message } from 'antd';
import useUserStore from '../../store/userStore';
import usePlanStore from '../../store/planStore';
import useCartStore from '../../store/cartStore';
import useScheduleStore from '../../store/scheduleStore';
import { createSchedule, optimizeSchedule, getSchedule } from '../../api';

async function waitUntilOptimized(id, { tries = 20, interval = 1200 } = {}) {
  for (let i = 0; i < tries; i++) {
    const detail = await getSchedule(id);
    const items = Array.isArray(detail?.scheduleItems)
      ? detail.scheduleItems
      : [];
    const optimized = items.some(
      (it) => Number(it?.dayNumber) > 0 && it?.startTime && it?.endTime
    );
    if (optimized) return detail;
    await new Promise((r) => setTimeout(r, interval));
  }
  // 타임아웃 시 fallback
  return await getSchedule(id);
}

const toHHmmss = (v) => {
  const s = String(v || '').trim();
  if (!s) return '09:00:00';
  const m = s.match(/^(\d{1,2}):?(\d{2})/);
  if (!m) return '09:00:00';
  const hh = String(Math.min(23, Number(m[1] || 9))).padStart(2, '0');
  const mm = String(Math.min(59, Number(m[2] || 0))).padStart(2, '0');
  return `${hh}:${mm}:00`;
};

const isUuid = (s) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(s || '')
  );

const clean = (obj) =>
  JSON.parse(
    JSON.stringify(obj, (_k, v) =>
      v === undefined || v === null || v === '' ? undefined : v
    )
  );

const toScheduleItems = (items = []) => {
  const seen = new Set();
  const result = [];
  for (const it of items) {
    const raw =
      it?.contentId ?? it?.id ?? it?.contentID ?? it?.content_id ?? '';
    const contentId = String(raw).trim();
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
  const ranRef = useRef(false);
  const navigate = useNavigate();
  const scheduleStore = useScheduleStore();

  const getSchedulePayload = usePlanStore((s) => s.getSchedulePayload);
  const locationIds = usePlanStore((s) => s.locationIds);
  const myUserId = useUserStore((s) => s.userId);
  const invitees = usePlanStore((s) => s.invitees);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    (async () => {
      // 0) 서버 카트 동기화
      try {
        await useCartStore.getState().loadFromServer();
      } catch (e) {
        if (e?.code === 'NO_CART') {
          message.error(
            '장바구니가 준비되지 않았어요. 지역을 먼저 선택해 주세요.'
          );
          navigate(-1);
          return;
        }
      }
      const cartItems = useCartStore.getState().items;
      const cartId = useCartStore.getState().cartId;

      if (!cartId) {
        message.error(
          '카트 정보(cartId)를 찾을 수 없어요. 지역을 다시 선택해 주세요.'
        );
        navigate(-1);
        return;
      }
      if (!cartItems.length) {
        message.warning('장바구니가 비어있어요.');
        navigate(-1);
        return;
      }

      // 결과용 placeIndex
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
        const base = getSchedulePayload();

        if (!base?.startDate || !base?.endDate) {
          message.error(
            '여행 날짜가 설정되지 않았어요. 날짜를 먼저 선택해 주세요.'
          );
          navigate(-1);
          return;
        }

        const scheduleName =
          (base.scheduleName && String(base.scheduleName).trim()) ||
          makeTripTitle(locationIds);

        const meId = String(myUserId || '');
        const othersCount = Array.isArray(invitees)
          ? invitees.filter((u) => String(u?.userId || '') !== meId).length
          : 0;
        const rawGroupId = String(base.groupId || '').trim();
        const safeGroupId = isUuid(rawGroupId) ? rawGroupId : undefined;
        const isGroupTrip = Boolean(safeGroupId) && othersCount > 0;
        const scheduleType = isGroupTrip ? 'GROUP' : 'PERSONAL';

        const style = String(
          base.scheduleStyle ||
            (Array.isArray(base.styles) ? base.styles[0] : '') ||
            '쇼핑'
        ).trim();

        const startPlace = String(
          base.startPlace || base.departurePlace || '서울역'
        );
        const startTime = toHHmmss(
          base.startTime || base.departureTime || '09:00'
        );

        const { items: latestCartItems } = useCartStore.getState();
        const scheduleItem = toScheduleItems(latestCartItems);
        if (!scheduleItem.length) {
          message.error(
            '장바구니 동기화에 실패했어요. 잠시 후 다시 시도해주세요.'
          );
          navigate(-1);
          return;
        }

        const payload = clean({
          scheduleName,
          startDate: String(base.startDate),
          endDate: String(base.endDate),
          budget: Math.max(0, Math.round(Number(base.budget ?? 0))),
          groupId: isGroupTrip ? safeGroupId : undefined,
          scheduleType, // GROUP | PERSONAL
          scheduleStyle: style,
          startPlace,
          startTime, // 'HH:mm:ss'
          cartId,
          scheduleItem,
        });

        console.groupCollapsed(
          '%c[schedule/create] Request payload',
          'color:#1677ff'
        );
        console.log('payload →', payload);
        console.groupEnd();

        const created = await createSchedule(payload);
        const scheduleId = created?.scheduleId || created?.id;
        if (!scheduleId) throw new Error('scheduleId가 응답에 없습니다.');

        await optimizeSchedule(scheduleId);
        // ✅ 최적화 완료까지 짧게 폴링 (백엔드가 즉시 OK를 주므로)
        const detail = await waitUntilOptimized(scheduleId);
        
        
        // 콘솔에 리스폰스 출력
        console.groupCollapsed(
          '%c[schedule/result] Optimized detail',
          'color:#52c41a;font-weight:bold;'
        );
        console.log('scheduleId →', scheduleId);
        console.log('response detail →', detail);
        console.groupEnd();



        scheduleStore.setDetail(detail);
        navigate(`/plan/schedule/result/${scheduleId}`, { replace: true });
      } catch (e) {
        console.error('[ScheduleAutoPage] error', e?.response?.data || e);
        message.error(
          e?.response?.data?.message || '일정 생성/최적화에 실패했어요.'
        );
        navigate(-1);
      }
    })();
  }, [
    getSchedulePayload,
    invitees,
    locationIds,
    myUserId,
    navigate,
    scheduleStore,
  ]);

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
