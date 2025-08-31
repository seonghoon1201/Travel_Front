import { create } from 'zustand';

const useScheduleStore = create((set, get) => ({
  // 서버 원본 응답 보관
  detail: null,
  // placeId -> 보강 정보 { name, imageUrl, lat, lng, address } (카트/목록에서 수집)
  placeIndex: {},

  setDetail: (detail) => set({ detail }),
  setPlaceIndex: (index) => set({ placeIndex: index }),

  // days 구조로 변환하여 UI에서 바로 쓰게 제공
  getDays: () => {
    const { detail, placeIndex } = get();
    if (!detail?.scheduleItems) return [];

    // dayNumber 그룹 → startTime 정렬
    const byDay = new Map();
    for (const it of detail.scheduleItems) {
      const day = Number(it.dayNumber || 0);
      if (!byDay.has(day)) byDay.set(day, []);
      byDay.get(day).push(it);
    }

    const sortByTime = (a, b) => {
      // 'HH:mm:ss' 기준
      const toNum = (s='00:00:00')=>{
        const [hh='00',mm='00',ss='00'] = String(s).split(':');
        return (+hh)*3600 + (+mm)*60 + (+ss);
      };
      return toNum(a.startTime) - toNum(b.startTime);
    };

    const days = [...byDay.keys()].sort((a,b)=>a-b).map((dNum) => {
      const plans = byDay.get(dNum).sort(sortByTime).map((it) => {
        const enrich = placeIndex[String(it.placeId)] || {};
        return {
          id: it.scheduleItemId || `${it.placeId}-${it.startTime}`,
          name: enrich.name || enrich.title || String(it.placeId),
          memo: it.memo || '',
          cost: it.cost ?? 0,
          startTime: it.startTime,
          endTime: it.endTime,
          lat: enrich.lat,
          lng: enrich.lng,
          address: enrich.address,
          imageUrl: enrich.imageUrl,
          placeId: it.placeId,
        };
      });
      return {
        date: `Day ${dNum}`,
        plans,
      };
    });

    return days;
  },
}));

export default useScheduleStore;
