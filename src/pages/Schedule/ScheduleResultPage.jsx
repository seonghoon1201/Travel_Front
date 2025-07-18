import React, { useState } from 'react';
import { Edit } from 'lucide-react';
import PrimaryButton from '../../components/common/PrimaryButton';
import DefaultLayout from '../../layouts/DefaultLayout';
import BackHeader from '../../components/header/BackHeader';
import DayScheduleSection from '../../components/schedule/DayScheduleSection';
import EditModal from '../../components/schedule/EditModal';
import KakaoMap from '../../components/map/KakaoMap';

const ScheduleResultPage = () => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  const schedule = {
    title: '제주도 여행',
    dateRange: '2025.07.02 - 2025.07.05',
    organizer: '친구와 | 액티비티',
    // 사실 여기에 category 추가해야함, 더미값이라 넘길게요 그때 색상 추가하던가 하시죠
    days: [
      {
        date: '7.2/수',
        plans: [
          {
            id: 1,
            name: '아쿠아플라넷 제주',
            distance: '10km',
            memo: '',
            lat: 33.4497,
            lng: 126.9206,
          },
          {
            id: 2,
            name: '고기국수 문도령',
            distance: '',
            memo: '고기국수 8000원\n4개 시키기',
            lat: 33.4513,
            lng: 126.9215,
          },
        ],
      },
      {
        date: '7.3/목',
        plans: [
          {
            id: 3,
            name: '성산일출봉 해양공원',
            distance: '15km',
            memo: '',
            lat: 33.4583,
            lng: 126.9425,
          },
        ],
      },
      {
        date: '7.4/금',
        plans: [
          {
            id: 4,
            name: '성산일출봉 해양공원',
            distance: '15km',
            memo: '',
            lat: 33.4583,
            lng: 126.9425,
          },
        ],
      },
      {
        date: '7.4/금',
        plans: [
          {
            id: 5,
            name: '성산일출봉 해양공원',
            distance: '16km',
            memo: '',
            lat: 30.4583,
            lng: 126.9425,
          },
        ],
      },
    ],
  };

  // 선택된 날짜의 장소들을 마커로 변환
  const selectedMarkers = schedule.days[selectedDayIndex].plans
    .filter((p) => p.lat && p.lng)
    .map((p) => ({
      lat: p.lat,
      lng: p.lng,
      dayIndex: selectedDayIndex,
    }));

  return (
    <DefaultLayout>
      <BackHeader />

      {/* Header */}
      <div className="flex justify-between items-center mb-1">
        <h1 className="text-xl font-bold">{schedule.title}</h1>
        <button
          onClick={() => setShowEditModal(true)}
          className="text-sm text-gray-400"
        >
          편집
        </button>
      </div>
      <p className="text-sm text-gray-500 mt-1">{schedule.dateRange}</p>
      <p className="text-sm text-gray-500">{schedule.organizer}</p>

      <div className="flex items-center gap-2 mb-4">
        {/* 고정된 일행 버튼 */}
        <div className="flex-shrink-0">
          <PrimaryButton className="px-3 py-1 text-sm whitespace-nowrap">
            함께하는 일행
          </PrimaryButton>
        </div>

        {/* 가로 스크롤 가능한 Day 버튼 */}
        <div className="flex-1 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 w-max">
            {schedule.days.map((day, idx) => (
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

      {/* 선택한 날짜의 일정만 보여줌 */}
      <DayScheduleSection
        day={schedule.days[selectedDayIndex]}
        dayIndex={selectedDayIndex}
      />

      {/* 편집 모달 */}
      {showEditModal && <EditModal onClose={() => setShowEditModal(false)} />}
      {showEditModal && <EditModal onClose={() => setShowEditModal(false)} />}
    </DefaultLayout>
  );
};

export default ScheduleResultPage;
