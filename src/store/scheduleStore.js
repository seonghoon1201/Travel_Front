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

      /** 여러 아이템을 scheduleItemId 기준으로 부분 업데이트 */
      patchItems: (patches = []) =>
        set((state) => {
          const d = state.detail;
          if (!d || !Array.isArray(d.scheduleItems)) return state;

          const map = new Map(
            d.scheduleItems.map((it) => [String(it.scheduleItemId), it])
          );
          for (const p of patches) {
            const id = String(p.scheduleItemId);
            const prev = map.get(id);
            if (prev) map.set(id, { ...prev, ...p });
          }
          return {
            detail: { ...d, scheduleItems: Array.from(map.values()) },
          };
        }),

      /** 여러 아이템을 scheduleItemId 기준으로 제거 */
      removeItemsById: (ids = []) =>
        set((state) => {
          const d = state.detail;
          if (!d || !Array.isArray(d.scheduleItems)) return state;
          const setIds = new Set(ids.map(String));
          return {
            detail: {
              ...d,
              scheduleItems: d.scheduleItems.filter(
                (it) => !setIds.has(String(it.scheduleItemId))
              ),
            },
          };
        }),

      /** 화면에서 쓰는 days 계산 */
      getDays: () => {
        const { detail, placeIndex } = get();
        const items = Array.isArray(detail?.scheduleItems)
          ? detail.scheduleItems
          : [];
        if (!items.length) return [];

        // 서버가 0-베이스인지 자동 감지
        const itemsZeroBased =
          items.some((x) => Number(x.dayNumber) === 0) ||
          items.some((x) => Number(x.order) === 0);

        const toIndex = (n) => {
          const v = Number(n);
          if (!Number.isFinite(v)) return 0;
          return itemsZeroBased ? Math.max(0, v) : Math.max(0, v - 1);
        };

        // 전체 일수
        const hasRange = detail?.startDate && detail?.endDate;
        const totalDays = (() => {
          if (!hasRange) return null;
          try {
            const s = new Date(String(detail.startDate));
            const e = new Date(String(detail.endDate));
            const diff = Math.floor((e.getTime() - s.getTime()) / 86400000) + 1;
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

        const dynamicByDay = new Map();

        const pushPlan = (dayIdxZeroBased, it) => {
          const key = String(it.contentId ?? it.placeId ?? '');
          const enrich = placeIndex[key] || {};
          const fallbackName = enrich.title || enrich.name || it.title || key;
          const ord = Number(it.order ?? 0);

          const plan = {
            id: it.scheduleItemId || `${key}-${Number.isFinite(ord) ? ord : 0}`,
            contentId: key,
            name: fallbackName,
            title: fallbackName,
            memo: it.memo || '',
            cost: Number(it.cost ?? 0),
            order: ord,
            // 위치 보강
            lat: enrich.lat,
            lng: enrich.lng,
            address: enrich.address,
            imageUrl: enrich.imageUrl,
            // 라우팅/업데이트에 쓰는 Day(항상 UI 1-베이스로 보관)
            dayNumber:
              (Number.isFinite(Number(it.dayNumber))
                ? itemsZeroBased
                  ? Number(it.dayNumber) + 1
                  : Number(it.dayNumber)
                : dayIdxZeroBased + 1) || dayIdxZeroBased + 1,
            // 메타
            tema: it.tema ?? it.theme ?? it.category ?? null,
            regionName:
              it.regionName ??
              it.sigunguName ??
              it.sigungu ??
              it.region ??
              null,
            // 지역 코드(신규 필드)
            ldongRegnCd: it.ldongRegnCd ?? null,
            ldongSigunguCd: it.ldongSigunguCd ?? it.ldongSignguCd ?? null,
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

        // 분배
        for (const it of items) {
          pushPlan(toIndex(it.dayNumber), it);
        }

        // order만으로 정렬 (0/1-베이스 모두 OK)
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
          daysArr.forEach((d) => (d.plans = sortPlans(d.plans)));
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
