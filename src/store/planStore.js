// src/store/planStore.js
import { create } from 'zustand';

const usePlanStore = create((set, get) => ({
  // ---- 기본 상태 ----
  locationIds: [],
  startDate: null, // 'YYYY-MM-DD'
  endDate: null, // 'YYYY-MM-DD'
  companion: '',
  styles: [], // UI상 다중 선택일 수 있음
  transport: '',
  invitees: [],
  people: 1,
  budget: 0,
  cartItems: [], // [{ contentId, cost }, ...] 형태 권장
  departurePlace: '', // => API: startPlace
  departureTime: '', // => API: startTime ('HH:mm')

  // ---- 백엔드 바디 매칭용 신규 필드 ----
  scheduleName: '', // API: scheduleName
  groupId: '', // API: groupId (없으면 빈 문자열/undefined로 전송 가능)
  groupName: '',
  invitees: [],
  scheduleType: 'GROUP', // API: scheduleType ('GROUP' | 'SOLO')
  scheduleStyle: '', // API: scheduleStyle (단일값)

  // 즐겨찾기 (localStorage 연동)
  favorites: JSON.parse(localStorage.getItem('favorites') || '[]'),

  toggleFavorite: (id) =>
    set((state) => {
      const newFavorites = state.favorites.includes(id)
        ? state.favorites.filter((fid) => fid !== id)
        : [...state.favorites, id];
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
      return { favorites: newFavorites };
    }),
  isFavorite: (id) => get().favorites.includes(id),

  // ---- 업데이트 액션 ----
  setLocationIds: (ids) => set({ locationIds: ids }),
  setDates: ({ start, end }) => set({ startDate: start, endDate: end }),
  setCompanion: (value) => set({ companion: value }),
  setStyles: (values) => set({ styles: values }),
  setTransport: (value) => set({ transport: value }),
  setInvitees: (list) => set({ invitees: list }),
  setPeople: (value) => set({ people: value }),
  setBudget: (value) => set({ budget: value }),
  setCartItems: (items) => set({ cartItems: items }),
  addToCart: (item) =>
    set((state) => ({ cartItems: [...state.cartItems, item] })),
  setDeparturePlace: (value) => set({ departurePlace: value }),
  setDepartureTime: (value) => set({ departureTime: value }),

  // ---- 신규 액션 (백엔드 바디 필드) ----
  setScheduleName: (v) => set({ scheduleName: v }),
  setGroupId: (v) => set({ groupId: v }),
  setGroupName: (v) => set({ groupName: v }),
  setInvitees: (list) => set({ invitees: list }),
  setScheduleType: (v) => set({ scheduleType: v }), // 'GROUP' | 'SOLO'
  setScheduleStyle: (v) => set({ scheduleStyle: v }), // 단일값

  // ---- 최종 페이로드 생성 헬퍼 ----
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

    // cartItems → scheduleItem 매핑 유연 처리
    // contentId 키가 없을 경우 id/slug 등 다른 키를 우선순위로 매핑
    const toContentId = (it) =>
      it?.contentId ??
      it?.id ??
      it?.contentID ??
      it?.content_id ??
      it?.slug ??
      String(it);

    const scheduleItem = (Array.isArray(s.cartItems) ? s.cartItems : []).map(
      (it) => ({
        contentId: toContentId(it),
        cost: Number(it?.cost ?? 0),
      })
    );

    return {
      scheduleName: s.scheduleName,
      startDate: s.startDate,
      endDate: s.endDate,
      budget: Number(s.budget ?? 0),
      groupId: s.groupId || undefined, // 비어있으면 undefined로
      scheduleType: s.scheduleType, // 'GROUP' or 'SOLO'
      // 단일값이 우선. 비어있으면 styles[0]을 백업으로 사용
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
      scheduleType: 'GROUP',
      scheduleStyle: '',
    }),
}));

export default usePlanStore;
