// src/pages/plan/ScheduleAutoPage.jsx
import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DefaultLayout from '../../layouts/DefaultLayout';
import BackHeader from '../../components/header/BackHeader';
import { message, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import usePlanStore from '../../store/planStore';
import useCartStore from '../../store/cartStore';
import useScheduleStore from '../../store/scheduleStore';
import {
  createSchedule,
  optimizeSchedule,
  getSchedule,
  getRegions,
} from '../../api';

// 지역 표시 이름 찾기
async function resolveRegionLabel(locationIds, cartItems) {
  try {
    const regions = await getRegions();
    const pickedId = String(locationIds?.[0] ?? '');
    const match = Array.isArray(regions)
      ? regions.find((r) => String(r.regionId) === pickedId)
      : null;
    if (match) {
      const candidateKeys = [
        'regionName',
        'name',
        'sigunguName',
        'sigungu',
        'sigunguname',
        'sggNm',
        'signguNm',
        'addrName',
        'title',
      ];
      for (const k of candidateKeys) {
        const v = match?.[k];
        if (v && String(v).trim()) return String(v).trim();
      }
    }
  } catch (_) {}

  const counts = new Map();
  const re = /([가-힣]+(?:시|군|구))/;
  (cartItems || []).forEach((it) => {
    const txt = String(it?.address || '').trim();
    const m = txt.match(re);
    if (m && m[1]) {
      const key = m[1];
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  });
  if (counts.size) {
    let best = '';
    let max = -1;
    for (const [k, v] of counts.entries()) {
      if (v > max) {
        best = k;
        max = v;
      }
    }
    if (best) return best;
  }

  const firstId = String(locationIds?.[0] ?? '').trim();
  if (firstId && isNaN(Number(firstId))) return firstId;
  return '여행';
}

// 최적화 완료 감지: dayNumber & order 존재 시 완료
async function waitUntilOptimized(id, { tries = 20, interval = 1200 } = {}) {
  for (let i = 0; i < tries; i++) {
    const detail = await getSchedule(id);
    const items = Array.isArray(detail?.scheduleItems)
      ? detail.scheduleItems
      : [];
    const optimized = items.some(
      (it) => Number(it?.dayNumber) > 0 && Number.isFinite(Number(it?.order))
    );
    if (optimized) return detail;
    await new Promise((r) => setTimeout(r, interval));
  }
  return await getSchedule(id);
}

const toHHmm = (v) => {
  const s = String(v || '').trim();
  if (!s) return '09:00';
  const m = s.match(/^(\d{1,2}):?(\d{2})/);
  if (!m) return '09:00';
  const hh = String(Math.min(23, Number(m[1] || 9))).padStart(2, '0');
  const mm = String(Math.min(59, Number(m[2] || 0))).padStart(2, '0');
  return `${hh}:${mm}`;
};

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

const ScheduleAutoPage = () => {
  const ranRef = useRef(false);
  const navigate = useNavigate();
  const scheduleStore = useScheduleStore();

  const getSchedulePayload = usePlanStore((s) => s.getSchedulePayload);
  const locationIds = usePlanStore((s) => s.locationIds);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    (async () => {
      try {
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

        const base = getSchedulePayload();
        if (!base?.startDate || !base?.endDate) {
          message.error(
            '여행 날짜가 설정되지 않았어요. 날짜를 먼저 선택해 주세요.'
          );
          navigate(-1);
          return;
        }

        const regionLabel = await resolveRegionLabel(locationIds, cartItems);
        const scheduleName =
          (base.scheduleName && String(base.scheduleName).trim()) ||
          `${regionLabel} 여행`;

        const style = String(
          base.scheduleStyle ||
            (Array.isArray(base.styles) ? base.styles[0] : '') ||
            '쇼핑'
        ).trim();

        const startPlace = String(
          base.startPlace || base.departurePlace || '서울역'
        );
        const startTime = toHHmm(
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
          scheduleStyle: style,
          startPlace,
          startTime, // 'HH:mm'
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
        const detail = await waitUntilOptimized(scheduleId);

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
  }, [getSchedulePayload, locationIds, navigate, scheduleStore]);

  const indicator = <LoadingOutlined style={{ fontSize: 32 }} spin />;

  return (
    <DefaultLayout>
      <div className="w-full max-w-sm mx-auto px-4">
        <BackHeader title="일정 짜는 중..." />
        <div className="py-16">
          <div className="flex flex-col items-center justify-center text-center">
            <Spin indicator={indicator} size="large" className="mb-2" />
            <div className="mt-1 text-base font-semibold">
              일정을 최적화하고 있어요...
            </div>
            <div className="mt-3 text-sm text-gray-500">
              잠시만 기다려 주세요
            </div>
            <div className="mt-6 text-[12px] text-gray-400">
              장바구니를 기반으로 이동 동선과 순서를 정리하고 있어요.
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default ScheduleAutoPage;
