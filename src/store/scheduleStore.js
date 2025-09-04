// src/store/scheduleStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useScheduleStore = create(
  persist(
    (set, get) => ({
      // 서버 원본 응답 보관
      detail: null,
      // placeId -> 보강 정보 { name, imageUrl, lat, lng, address } (카트/목록에서 수집)
      placeIndex: {},

      setDetail: (detail) => set({ detail }),
      setPlaceIndex: (index) => set({ placeIndex: index }),

      // ✅ 필요 시 결과 화면을 벗어날 때 초기화
      clear: () => set({ detail: null, placeIndex: {} }),

      // days 구조로 변환하여 UI에서 바로 쓰게 제공
      getDays: () => {
        const { detail, placeIndex } = get();
        const items = Array.isArray(detail?.scheduleItems)
          ? detail.scheduleItems
          : [];
        if (!items.length) return [];

        // 여행 총 일수 계산 (startDate ~ endDate 있으면)
        const hasRange = detail?.startDate && detail?.endDate;
        const totalDays = (() => {
          if (!hasRange) return null;
          try {
            const s = new Date(String(detail.startDate));
            const e = new Date(String(detail.endDate));
            const diff = Math.floor((e - s) / 86400000) + 1; // inclusive
            return diff > 0 ? diff : null;
          } catch {
            return null;
          }
        })();

        // Day 컨테이너 준비 (날짜 라벨 포함)
        const daysArr = (() => {
          if (!totalDays) return [];
          const start = new Date(String(detail.startDate));
          const list = [];
          for (let i = 0; i < totalDays; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            list.push({
              date: `Day ${i + 1} (${yyyy}-${mm}-${dd})`,
              plans: [],
            });
          }
          return list;
        })();

        // 'HH:mm' 또는 'HH:mm:ss' → 초 변환
        const toSec = (t) => {
          if (!t) return 0;
          const [hh = '00', mm = '00', ss = '00'] = String(t).split(':');
          const H = Number(hh) || 0,
            M = Number(mm) || 0,
            S = Number(ss) || 0;
          return H * 3600 + M * 60 + S;
        };

        // 계획 추가 함수
        const pushPlan = (dayIdxZeroBased, it) => {
          const key = String(it.contentId ?? it.placeId ?? '');
          const enrich = placeIndex[key] || {};
          const fallbackName = it.title || enrich.title || enrich.name || key;
          const plan = {
            id:
              it.scheduleItemId ||
              `${key}-${it.startTime || ''}-${it.endTime || ''}`,
            name: fallbackName,
            memo: it.memo || '',
            cost: Number(it.cost ?? 0),
            startTime: it.startTime || null,
            endTime: it.endTime || null,
            lat: enrich.lat,
            lng: enrich.lng,
            address: enrich.address,
            imageUrl: enrich.imageUrl,
            placeId: key,
            contentId: key,
            order: Number(it.order ?? 0),
            tema: it.tema ?? it.theme ?? it.category ?? null,
            regionName:
              it.regionName ??
              it.sigunguName ??
              it.sigungu ??
              it.region ??
              null,
          };
          if (daysArr.length) {
            // 미리 생성된 Day 배열이 있으면 범위 내로 넣기
            const idx = Math.max(
              0,
              Math.min(daysArr.length - 1, dayIdxZeroBased)
            );
            daysArr[idx].plans.push(plan);
          } else {
            // 총 일수를 모를 때: 동적으로 Map에 추가
            dynamicByDay.set(
              dayIdxZeroBased,
              (dynamicByDay.get(dayIdxZeroBased) || []).concat(plan)
            );
          }
        };

        // 총 일수를 모르면 동적 Map에 저장
        const dynamicByDay = new Map();

        // 아이템 분배
        for (const it of items) {
          const dayNum = Number(it.dayNumber);
          const safeDay = Number.isFinite(dayNum) && dayNum > 0 ? dayNum : 1; // 없으면 1일차
          const zeroBased = safeDay - 1;
          pushPlan(zeroBased, it);
        }

        // 정렬 (startTime → order)
        const sortPlans = (arr) =>
          arr.sort((a, b) => {
            const t = toSec(a.startTime) - toSec(b.startTime);
            return t !== 0 ? t : a.order - b.order;
          });

        if (daysArr.length) {
          daysArr.forEach((d) => {
            d.plans = sortPlans(d.plans);
          });
          return daysArr;
        }

        // 날짜 라벨이 없는 경우: dynamicByDay → Day n
        const dayKeys = [...dynamicByDay.keys()].sort((a, b) => a - b);
        return dayKeys.map((k) => ({
          date: `Day ${k + 1}`,
          plans: sortPlans(dynamicByDay.get(k)),
        }));
      },
    }),
    {
      name: 'schedule-detail', // 세션에 저장
      storage: createJSONStorage(() => sessionStorage),
      partialize: (s) => ({
        detail: s.detail,
        placeIndex: s.placeIndex,
      }),
    }
  )
);

export default useScheduleStore;
