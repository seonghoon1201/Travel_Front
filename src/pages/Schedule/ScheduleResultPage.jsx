import React, { useMemo, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DefaultLayout from '../../layouts/DefaultLayout';
import HomeHeader from '../../components/header/HomeHeader';
import PrimaryButton from '../../components/common/PrimaryButton';
import DayScheduleSection from '../../components/schedule/DayScheduleSection';
import EditModal from '../../components/schedule/EditModal';
import KakaoMap from '../../components/map/KakaoMap';
import useScheduleStore from '../../store/scheduleStore';
import useCartStore from '../../store/cartStore';
import { getSchedule } from '../../api';
import { message } from 'antd';

const ScheduleResultPage = () => {
  const { scheduleId } = useParams();
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const scheduleStore = useScheduleStore();
  const detail = scheduleStore.detail;

  // 새로고침으로 store 비었을 때를 대비해 서버에서 다시 로드
  useEffect(() => {
    (async () => {
      if (detail?.scheduleId === scheduleId || detail?.id === scheduleId)
        return;
      try {
        const res = await getSchedule(scheduleId);
        // 콘솔에 리스폰스 출력
        console.log('[ScheduleResultPage] getSchedule response →', res);

        scheduleStore.setDetail(res);
      } catch (e) {
        console.error('[ScheduleResult] reload fail', e?.response?.data || e);
        message.error('일정 정보를 불러오지 못했어요.');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scheduleId]);
  // ✅ 새로고침 등으로 placeIndex가 비었으면, 카트/서버 응답으로 보강
  useEffect(() => {
    if (!detail || !Array.isArray(detail?.scheduleItems)) return;
    const currentIndex = scheduleStore.placeIndex || {};
    if (Object.keys(currentIndex).length > 0) return; // 이미 있음

    // 1) 카트에서 보강
    const { items: cartItems = [] } = useCartStore.getState();
    const idxFromCart = {};
    cartItems.forEach((it) => {
      const key = String(it.contentId ?? '');
      if (!key) return;
      idxFromCart[key] = {
        name: it.name,
        title: it.name,
        imageUrl: it.imageUrl,
        lat: it?.location?.lat,
        lng: it?.location?.lng,
        address: it.address,
      };
    });

    // 2) 서버 응답으로 최소 이름 보강 (좌표 없으면 이름만)
    const idxMerged = { ...idxFromCart };
    detail.scheduleItems.forEach((it) => {
      const key = String(it.contentId ?? '');
      if (!key) return;
      if (!idxMerged[key]) {
        idxMerged[key] = { name: it.title || key, title: it.title || key };
      }
    });

    scheduleStore.setPlaceIndex(idxMerged);
  }, [detail, scheduleStore]);

  // days 변환
  const days = scheduleStore.getDays();

  // ✅ days 길이 변화에 따른 인덱스 가드
  useEffect(() => {
    if (selectedDayIndex >= days.length) setSelectedDayIndex(0);
  }, [days.length, selectedDayIndex]);

  const selectedMarkers = useMemo(() => {
    if (!days[selectedDayIndex]) return [];
    return days[selectedDayIndex].plans
      .filter((p) => typeof p.lat === 'number' && typeof p.lng === 'number')
      .map((p, i) => ({
        lat: p.lat,
        lng: p.lng,
        order: i + 1,
        title: p.title || `#${i + 1}`,
      }));
  }, [days, selectedDayIndex]);

  // 폴리라인 경로 (LatLng 배열)
  const path = useMemo(() => {
    return selectedMarkers.map((m) => ({ lat: m.lat, lng: m.lng }));
  }, [selectedMarkers]);

  const title = detail?.scheduleName || '여행 일정';
  const dateRange =
    detail?.startDate && detail?.endDate
      ? `${detail.startDate} ~ ${detail.endDate}`
      : '';

  return (
    <DefaultLayout>
      <div className="w-full max-w-sm mx-auto px-4">
        <HomeHeader />

        {/* Header */}
        <div className="flex justify-between items-center mb-1">
          <h1 className="text-xl font-bold">{title}</h1>
          <button
            onClick={() => setShowEditModal(true)}
            className="text-sm text-gray-400"
          >
            편집
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-1">{dateRange}</p>

        <div className="flex items-center gap-2 mb-4">
          <div className="flex-shrink-0">
            <PrimaryButton className="px-3 py-1 text-sm whitespace-nowrap">
              함께하는 일행
            </PrimaryButton>
          </div>

          {/* Day 버튼 */}
          <div className="flex-1 overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 w-max">
              {days.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedDayIndex(idx)}
                  className={`px-3 py-1 rounded-full text-sm border whitespace-nowrap ${
                    selectedDayIndex === idx
                      ? 'border-primary text-primary bg-blue-50'
                      : 'border-gray-300 text-gray-500 bg-white'
                  }`}
                >
                  Day {idx + 1}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 지도 */}
        <div className="w-full h-48 rounded-lg mb-6 overflow-hidden">
          <KakaoMap
            markers={selectedMarkers}
            useCustomOverlay={true}
            drawPath={true} // ← 숫자 순서대로 선 그리기
            path={path} // ← 폴리라인 경로
            fitToMarkers={true} // ← 모든 포인트 보이도록 자동 줌/이동
            fitPadding={60} // ← bounds 여백(px)
          />
        </div>

        {/* 선택한 날짜 일정 */}
        {days[selectedDayIndex] && (
          <DayScheduleSection
            key={selectedDayIndex}
            day={days[selectedDayIndex]}
            dayIndex={selectedDayIndex}
          />
        )}

        {/* 편집 모달 */}
        {showEditModal && <EditModal onClose={() => setShowEditModal(false)} />}
      </div>
    </DefaultLayout>
  );
};

export default ScheduleResultPage;
