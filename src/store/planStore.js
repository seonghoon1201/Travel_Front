import { create } from 'zustand';

const usePlanStore = create((set) => ({
  locationIds: [],          // number[]
  startDate: null,          // string (YYYY-MM-DD)
  endDate: null,            // string (YYYY-MM-DD)
  companion: '',            // string
  styles: [],               // string[]
  transport: '',            // string
  invitees: [],             // string[] (초대된 친구들)

  // 업데이트 함수들
  setLocationIds: (ids) => set({ locationIds: ids }),
  setDates: ({ start, end }) => set({ startDate: start, endDate: end }),
  setCompanion: (value) => set({ companion: value }),
  setStyles: (values) => set({ styles: values }),
  setTransport: (value) => set({ transport: value }),
  setInvitees: (list) => set({ invitees: list }),

  // 전체 초기화 함수
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
