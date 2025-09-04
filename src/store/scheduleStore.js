import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useScheduleStore = create(
  persist(
    (set, get) => ({
      detail: null,
      placeIndex: {},

      setDetail: (detail) => set({ detail }),
      setPlaceIndex: (index) => set({ placeIndex: index }),
      clear: () => set({ detail: null, placeIndex: {} }),

      getDays: () => {
        const { detail, placeIndex } = get();
        const items = Array.isArray(detail?.scheduleItems)
          ? detail.scheduleItems
          : [];
        if (!items.length) return [];

        // 총 일수 계산
        const hasRange = detail?.startDate && detail?.endDate;
        const totalDays = (() => {
          if (!hasRange) return null;
          try {
            const s = new Date(String(detail.startDate));
            const e = new Date(String(detail.endDate));
            const diff = Math.floor((e - s) / 86400000) + 1;
            return diff > 0 ? diff : null;
          } catch {
            return null;
          }
        })();

        // Day 컨테이너
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

        const pushPlan = (dayIdxZeroBased, it) => {
          const key = String(it.contentId ?? it.placeId ?? '');
          const enrich = placeIndex[key] || {};
          // ✅ enrich 우선 → 백엔드 title이 ID여도 보기 좋은 이름 우선
          const fallbackName = enrich.title || enrich.name || it.title || key;
          const ord = Number(it.order ?? 0);

          const plan = {
            id: it.scheduleItemId || `${key}-${Number.isFinite(ord) ? ord : 0}`,
            name: fallbackName,
            title: fallbackName,
            memo: it.memo || '',
            cost: Number(it.cost ?? 0),
            startTime: null,
            endTime: null,
            lat: enrich.lat,
            lng: enrich.lng,
            address: enrich.address,
            imageUrl: enrich.imageUrl,
            placeId: key,
            contentId: key,
            order: ord,
            tema: it.tema ?? it.theme ?? it.category ?? null,
            regionName:
              it.regionName ??
              it.sigunguName ??
              it.sigungu ??
              it.region ??
              null,
          };

          if (daysArr.length) {
            const idx = Math.max(
              0,
              Math.min(daysArr.length - 1, dayIdxZeroBased)
            );
            daysArr[idx].plans.push(plan);
          } else {
            dynamicByDay.set(
              dayIdxZeroBased,
              (dynamicByDay.get(dayIdxZeroBased) || []).concat(plan)
            );
          }
        };

        const dynamicByDay = new Map();

        // 분배
        for (const it of items) {
          const dayNum = Number(it.dayNumber);
          const safeDay = Number.isFinite(dayNum) && dayNum > 0 ? dayNum : 1;
          const zeroBased = safeDay - 1;
          pushPlan(zeroBased, it);
        }

        // ✅ order만으로 정렬
        const sortPlans = (arr) =>
          arr.sort((a, b) => {
            const ao = Number.isFinite(a.order)
              ? a.order
              : Number.POSITIVE_INFINITY;
            const bo = Number.isFinite(b.order)
              ? b.order
              : Number.POSITIVE_INFINITY;
            if (ao !== bo) return ao - bo;
            return String(a.name || '').localeCompare(String(b.name || ''));
          });

        if (daysArr.length) {
          daysArr.forEach((d) => {
            d.plans = sortPlans(d.plans);
          });
          return daysArr;
        }

        const dayKeys = [...dynamicByDay.keys()].sort((a, b) => a - b);
        return dayKeys.map((k) => ({
          date: `Day ${k + 1}`,
          plans: sortPlans(dynamicByDay.get(k)),
        }));
      },
    }),
    {
      name: 'schedule-detail',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (s) => ({ detail: s.detail, placeIndex: s.placeIndex }),
    }
  )
);

export default useScheduleStore;
