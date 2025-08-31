// src/store/planStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import useCartStore from './cartStore'; // getSchedulePayload에서 카트 항목을 참조(우선 사용)

const usePlanStore = create(
  persist(
    (set, get) => ({
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

      // (구) planStore.cartItems — cartStore로 분리했지만, 호환을 위해 필드는 남겨둠
      cartItems: [], // [{ contentId, cost/price }]

      departurePlace: '', // => API: startPlace
      departureTime: '', // => API: startTime ('HH:mm')

      // ---- 백엔드 바디 매칭 ----
      scheduleName: '',
      groupId: '',
      groupName: '',
      scheduleType: 'GROUP', // 'GROUP' | 'SOLO'
      scheduleStyle: '', // 단일값

      // 즐겨찾기 (persist로 자동 저장)
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
            const regn =
              o.ldongRegnCd ??
              o.ldongRegnCd ??
              o.lDongRegnCd ??
              o.ldongRegnCd ??
              '';
            const sign =
              o.ldongSignguCd ??
              o.ldongSignguCd ??
              o.lDongSignguCd ??
              o.ldongSignguCd ??
              '';
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
      setPeople: (v) => set({ people: v }),
      setBudget: (v) => set({ budget: v }),

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
          contentId: toContentId(it),
          cost: Number(it?.cost ?? it?.price ?? 0),
        }));

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
          scheduleItem,
        };
      },

      // ---- 초기화 ----
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
        }),

      // 영구 저장값까지 전부 삭제(로그아웃 등)
      clearPersisted: () => {
        set({}, true);
        try {
          localStorage.removeItem('plan-store-v2');
        } catch {}
      },
    }),
    {
      name: 'plan-store-v2',
      version: 2,
      storage: createJSONStorage(() => localStorage),

      // 꼭 필요한 필드만 저장 (UI 일시상태 등 제외)
      partialize: (s) => ({
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
        // cartItems는 cartStore가 담당(중복 방지)
      }),

      // 과거 키(ldong*/lDong*/ldong*) → 현재 키(ldong*)로 마이그레이션
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
        // 이전에 수동 저장하던 favorites는 무시해도 됨(여기서 persist됨)
        return s;
      },
    }
  )
);

export default usePlanStore;
