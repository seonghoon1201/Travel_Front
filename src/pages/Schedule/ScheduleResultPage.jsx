import React, { useMemo, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DefaultLayout from '../../layouts/DefaultLayout';
import BackHeader from '../../components/header/BackHeader';
import PrimaryButton from '../../components/common/PrimaryButton';
import DayScheduleSection from '../../components/schedule/DayScheduleSection';
import EditModal from '../../components/schedule/EditModal';
import KakaoMap from '../../components/map/KakaoMap';
import useScheduleStore from '../../store/scheduleStore';
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
        scheduleStore.setDetail(res);
      } catch (e) {
        console.error('[ScheduleResult] reload fail', e?.response?.data || e);
        message.error('일정 정보를 불러오지 못했어요.');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scheduleId]);

  // days 변환
  const days = scheduleStore.getDays();
  const selectedMarkers = useMemo(() => {
    if (!days[selectedDayIndex]) return [];
    return days[selectedDayIndex].plans
      .filter((p) => typeof p.lat === 'number' && typeof p.lng === 'number')
      .map((p) => ({ lat: p.lat, lng: p.lng, dayIndex: selectedDayIndex }));
  }, [days, selectedDayIndex]);

  const title = detail?.scheduleName || '여행 일정';
  const dateRange =
    detail?.startDate && detail?.endDate
      ? `${detail.startDate} ~ ${detail.endDate}`
      : '';

  return (
    <DefaultLayout>
      <div className="w-full max-w-sm mx-auto px-4">
        <BackHeader />

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
          <KakaoMap markers={selectedMarkers} useCustomOverlay={true} />
        </div>

        {/* 선택한 날짜 일정 */}
        {days[selectedDayIndex] && (
          <DayScheduleSection
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
