import React, { useState }  from 'react';
import { Edit, MapPin } from 'lucide-react';
import PrimaryButton from '../../components/common/PrimaryButton';
import DefaultLayout from '../../layouts/DefaultLayout';
import BackHeader from '../../components/header/BackHeader';
import DayScheduleSection from '../../components/schedule/DayScheduleSection';
import EditModal from '../../components/schedule/EditModal';
import KakaoMap from '../../components/map/KakaoMap';


const ScheduleResultPage = () => {
  // 모달 띄우기
   const [showEditModal, setShowEditModal] = useState(false);


  // 지도 위도경도값 임의로 고정
  const latitude = 33.4497;
  const longitude = 126.9206;

  const schedule = {
    title: '제주도 여행',
    dateRange: '2025.07.02 - 2025.07.05',
    organizer: '친구와 계획 • 에디터',

    days: [
      {
        date: '7.2/수',
        plans: [
          {
            id: 1,
            name: '아쿠아플라넷 제주',
            distance: '10km',
            memo: '',
          },
          {
            id: 2,
            name: '고기국수 문도령',
            distance: '',
            memo: '고기국수 8000원\n4개 시키기',
          },
        ],
      },
      {
        date: '7.3/목',
        plans: [
          {
            id: 3,
            name: '아쿠아플라넷 제주',
            distance: '10km',
            memo: '',
          },
          {
            id: 4,
            name: '고기국수 문도령',
            distance: '',
            memo: '',
          },
        ],
      },
    ],
  };

  return (
    <DefaultLayout >
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

      {/* 버튼 */}
      <div className="flex gap-2 mb-4">
        <PrimaryButton className="flex-1">일정표 함께 일정 짜기</PrimaryButton>
        <PrimaryButton className="flex-1 bg-white text-[#4B5563] border border-[#D1D5DB]">
          일정 초대
        </PrimaryButton>
      </div>

      {/* 지도 영역 */}
      <div className="w-full h-48 rounded-lg mb-6 overflow-hidden">
        <KakaoMap
          markers={[
            { lat: 33.4497, lng: 126.9206, dayIndex: 0 },
            { lat: 33.4513, lng: 126.9215, dayIndex: 0 },
            { lat: 33.4583, lng: 126.9425, dayIndex: 1 },
          ]}
          useCustomOverlay={true}
        />
      </div>

      {/* 날짜별 일정 */}
      {schedule.days.map((day, index) => (
        <DayScheduleSection key={index} day={day} dayIndex={index} />
      ))}

      {/* 모달 열기 */}
       {showEditModal && (
        <EditModal onClose={() => setShowEditModal(false)} />
      )}
    </DefaultLayout>
  );
};

export default ScheduleResultPage;
