/**
 * 현재 카카오 지도 API와는 연동되어 있지 않으며,
 * 텍스트 기반 주소 자동완성 기능만 제공합니다.
 * 향후 카카오 맵 연동 시 도로명 주소 좌표 변환 및 지도 마커 표시 기능 확장 예정입니다.
 */
import { create } from 'zustand';

const usePlanStore = create((set, get) => ({
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

  // 즐겨찾기
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

  // 업데이트 함수
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

  // 초기화
  reset: () =>
    set({
      locationIds: [],
      startDate: null,
      endDate: null,
      companion: '',
      styles: [],
      transport: '',
    }),
}));

export default usePlanStore;
