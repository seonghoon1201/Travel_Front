// src/store/planStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import useCartStore from './cartStore'; // 새 일정 세션 시작에서 카트 초기화

const usePlanStore = create(
  persist(
    (set, get) => ({
      // ---- 플로우 상태 ----
      inPlanFlow: false, // /plan/* 안에 있는지 여부
      planSessionId: null, // 새 일정 시작 시 구분용(필요하면 사용)

      // ---- 기본 상태 ----
      locationIds: [], // 지역 id 배열
      locationCodes: [], // [{ ldongRegnCd, ldongSignguCd }] 배열
      startDate: null, // 'YYYY-MM-DD'
      endDate: null, // 'YYYY-MM-DD'
      companion: '',
      styles: [], // 다중 선택 가능
      transport: '',
      invitees: [],
      people: 1,
      budget: 0,

      // 선택 지역 메타
      selectedRegionName: '',
      selectedRegionImage: '',

      // (구) planStore.cartItems — 호환을 위해 남겨두지만 실제로는 cartStore 사용
      cartItems: [],

      departurePlace: '', // => API: startPlace
      departureTime: '', // => API: startTime ('HH:mm')

      // ---- 백엔드 바디 매칭 ----
      scheduleName: '',
      groupId: '',
      groupName: '',
      scheduleType: 'GROUP', // 'GROUP' | 'SOLO'
      scheduleStyle: '', // 단일값

      // 즐겨찾기
      favorites: [],

      // ---- 액션 ----
      toggleFavorite: (id) =>
        set((state) => {
          const exists = state.favorites.includes(id);
          return {
            favorites: exists
              ? state.favorites.filter((fid) => fid !== id)
              : [...state.favorites, id],
          };
        }),
      isFavorite: (id) => get().favorites.includes(id),

      setLocationIds: (ids) => set({ locationIds: ids }),

      // 다양한 키로 들어올 수 있는 코드를 ldong* 로 정규화해서 저장
      setLocationCodes: (codes) =>
        set({
          locationCodes: (Array.isArray(codes) ? codes : []).map((o = {}) => {
            const regn = o.ldongRegnCd ?? o.lDongRegnCd ?? '';
            const sign = o.ldongSignguCd ?? o.lDongSignguCd ?? '';
            return {
              ldongRegnCd:
                regn !== null && regn !== undefined ? String(regn) : '',
              ldongSignguCd:
                sign !== null && sign !== undefined ? String(sign) : '',
            };
          }),
        }),

      setDates: ({ start, end }) => set({ startDate: start, endDate: end }),
      setCompanion: (v) => set({ companion: v }),
      setStyles: (values) => set({ styles: values }),
      setTransport: (v) => set({ transport: v }),
      setInvitees: (list) => set({ invitees: list }),
      setPeople: (v) => set({ people: Math.max(1, Number(v) || 1) }),
      setBudget: (v) => {
        const next = Math.max(0, Number.isFinite(+v) ? +v : 0);
        console.log('[planStore.setBudget] input:', v, '→ saved:', next);
        set({ budget: next });
      },

      // (구) 로컬 카트 — 호환 유지용
      setCartItems: (items) => set({ cartItems: items }),
      addToCart: (item) =>
        set((state) => ({ cartItems: [...state.cartItems, item] })),

      setDeparturePlace: (v) => set({ departurePlace: v }),
      setDepartureTime: (v) => set({ departureTime: v }),

      setScheduleName: (v) => set({ scheduleName: v }),
      setGroupId: (v) => set({ groupId: v }),
      setGroupName: (v) => set({ groupName: v }),
      setScheduleType: (v) => set({ scheduleType: v }),
      setScheduleStyle: (v) => set({ scheduleStyle: v }),

      setSelectedRegionMeta: ({ name, imageUrl }) =>
        set({
          selectedRegionName: String(name || ''),
          selectedRegionImage: String(imageUrl || ''),
        }),

      // ✅ 플랜 시작(플로우 진입 표시)
      beginPlanFlow: () => set({ inPlanFlow: true, planSessionId: Date.now() }),

      // ❌ 자동 초기화 금지: /plan/* 벗어나도 여기서는 비우지 않음
      //    (자세히 보기 등 외부 라우트로 이동해도 플로우 유지)
      endPlanFlow: () => set({ inPlanFlow: false }),

      // ✅ 세션 시작: 카트/입력값을 비우되, 지역정보는 유지
      startNewPlanSession: async () => {
        await useCartStore
          .getState()
          .resetForNewPlan()
          .catch(() => {});
        set((state) => ({
          // 지역은 유지
          locationIds: state.locationIds,
          locationCodes: state.locationCodes,
          // 나머지 입력값 초기화
          startDate: null,
          endDate: null,
          companion: '',
          styles: [],
          transport: '',
          invitees: [],
          people: 1,
          budget: 0,
          cartItems: [],
          departurePlace: '',
          departureTime: '',
          scheduleName: '',
          groupId: '',
          groupName: '',
          scheduleType: 'GROUP',
          scheduleStyle: '',
          selectedRegionName: state.selectedRegionName, // 지역은 유지하고 싶으면 그대로
          selectedRegionImage: state.selectedRegionImage,
          // favorites는 그대로 둠
        }));
      },

      // ✅ 플랜 "완료": 일정 생성 성공 직후 호출 → 모든 것 정리
      finishPlanning: async () => {
        await useCartStore
          .getState()
          .resetForNewPlan()
          .catch(() => {});
        set({
          locationIds: [],
          locationCodes: [],
          startDate: null,
          endDate: null,
          companion: '',
          styles: [],
          transport: '',
          invitees: [],
          people: 1,
          budget: 0,
          cartItems: [],
          departurePlace: '',
          departureTime: '',
          scheduleName: '',
          groupId: '',
          groupName: '',
          scheduleType: 'GROUP',
          scheduleStyle: '',
          favorites: [],
          selectedRegionName: '',
          selectedRegionImage: '',
        });
        try {
          localStorage.removeItem('plan-store-v3');
        } catch {}
      },

      // ✅ 플랜 "취소": 사용자가 명시적으로 새로 시작을 선택했을 때
      cancelPlanning: async () => {
        await useCartStore
          .getState()
          .resetForNewPlan()
          .catch(() => {});
        set({
          inPlanFlow: false,
          planSessionId: null,
          locationIds: [],
          locationCodes: [],
          startDate: null,
          endDate: null,
          companion: '',
          styles: [],
          transport: '',
          invitees: [],
          people: 1,
          budget: 0,
          cartItems: [],
          departurePlace: '',
          departureTime: '',
          scheduleName: '',
          groupId: '',
          groupName: '',
          scheduleType: 'GROUP',
          scheduleStyle: '',
          favorites: [],
          selectedRegionName: '',
          selectedRegionImage: '',
        });
        try {
          localStorage.removeItem('plan-store-v3');
        } catch {}
      },

      // ---- 최종 페이로드 생성 ----
      /**
       * 백엔드 /schedule/create 등에 보낼 바디 생성
       * 스키마:
       * {
       *   scheduleName, startDate, endDate, budget, groupId,
       *   scheduleType, scheduleStyle, startPlace, startTime,
       *   scheduleItem: [{ contentId, cost }]
       * }
       */
      getSchedulePayload: () => {
        const s = get();

        // 카트 항목은 cartStore(items)를 우선 사용, 없으면 (구) planStore.cartItems 사용
        const cartItemsFromCartStore = useCartStore.getState().items || [];
        const sourceItems =
          cartItemsFromCartStore.length > 0
            ? cartItemsFromCartStore
            : Array.isArray(s.cartItems)
            ? s.cartItems
            : [];

        const toContentId = (it) =>
          it?.contentId ??
          it?.id ??
          it?.contentID ??
          it?.content_id ??
          it?.slug ??
          String(it);

        const scheduleItem = sourceItems.map((it) => ({
          contentId: String(toContentId(it)),
          cost: Number(it?.cost ?? it?.price ?? 0),
        }));

        // ✅ 여행 일수 × 5개 한도 적용 (안전장치)
        const calcDays = (start, end) => {
          if (!start || !end) return null;
          const sd = new Date(String(start));
          const ed = new Date(String(end));
          if (Number.isNaN(sd.getTime()) || Number.isNaN(ed.getTime()))
            return null;
          const diff = Math.floor((ed - sd) / 86400000) + 1; // inclusive
          return diff > 0 ? diff : null;
        };
        const days = calcDays(s.startDate, s.endDate);
        const maxItems = days ? days * 5 : null;
        const scheduleItemCapped = maxItems
          ? scheduleItem.slice(0, maxItems)
          : scheduleItem;

        return {
          scheduleName: s.scheduleName,
          startDate: s.startDate,
          endDate: s.endDate,
          budget: Number(s.budget ?? 0),
          groupId: s.groupId || undefined, // 비어있으면 undefined
          scheduleType: s.scheduleType,
          // 단일값 우선, 비어있으면 styles[0]
          scheduleStyle:
            s.scheduleStyle || (Array.isArray(s.styles) ? s.styles[0] : ''),
          startPlace: s.departurePlace,
          startTime: s.departureTime, // 'HH:mm'
          scheduleItem: scheduleItemCapped,
        };
      },

      // ---- 전체 초기화 ----
      reset: () =>
        set({
          locationIds: [],
          locationCodes: [],
          startDate: null,
          endDate: null,
          companion: '',
          styles: [],
          transport: '',
          invitees: [],
          people: 1,
          budget: 0,
          cartItems: [],
          departurePlace: '',
          departureTime: '',
          scheduleName: '',
          groupId: '',
          groupName: '',
          scheduleType: 'GROUP',
          scheduleStyle: '',
          favorites: [],
          selectedRegionName: '',
          selectedRegionImage: '',
        }),

      // ✅ 영구 저장(세션)까지 완전 삭제 — 로그아웃 등에서 호출
      clearPersisted: () => {
        set({
          inPlanFlow: false,
          planSessionId: null,
          locationIds: [],
          locationCodes: [],
          startDate: null,
          endDate: null,
          companion: '',
          styles: [],
          transport: '',
          invitees: [],
          people: 1,
          budget: 0,
          cartItems: [],
          departurePlace: '',
          departureTime: '',
          scheduleName: '',
          groupId: '',
          groupName: '',
          scheduleType: 'GROUP',
          scheduleStyle: '',
          favorites: [],
          selectedRegionName: '',
          selectedRegionImage: '',
        });
        try {
          localStorage.removeItem('plan-store-v3');
        } catch {}
      },
    }),
    {
      name: 'plan-store-v3',
      version: 3,
      storage: createJSONStorage(() => localStorage),

      // 꼭 필요한 필드만 저장
      partialize: (s) => ({
        inPlanFlow: s.inPlanFlow,
        planSessionId: s.planSessionId,
        locationIds: s.locationIds,
        locationCodes: s.locationCodes,
        startDate: s.startDate,
        endDate: s.endDate,
        companion: s.companion,
        styles: s.styles,
        transport: s.transport,
        invitees: s.invitees,
        people: s.people,
        budget: s.budget,
        departurePlace: s.departurePlace,
        departureTime: s.departureTime,
        scheduleName: s.scheduleName,
        groupId: s.groupId,
        groupName: s.groupName,
        scheduleType: s.scheduleType,
        scheduleStyle: s.scheduleStyle,
        favorites: s.favorites,
        selectedRegionName: s.selectedRegionName,
        selectedRegionImage: s.selectedRegionImage,
      }),

      // 과거 키 마이그레이션
      migrate: (persistedState, _version) => {
        const s = { ...(persistedState || {}) };
        if (Array.isArray(s.locationCodes)) {
          s.locationCodes = s.locationCodes.map((o = {}) => ({
            ldongRegnCd: String(
              o.ldongRegnCd ??
                o.ldongRegnCd ??
                o.lDongRegnCd ??
                o.ldongRegnCd ??
                ''
            ),
            ldongSignguCd: String(
              o.ldongSignguCd ??
                o.ldongSignguCd ??
                o.lDongSignguCd ??
                o.ldongSignguCd ??
                ''
            ),
          }));
        }
        return s;
      },
    }
  )
);

export default usePlanStore;
