import React from 'react';
import { MapPin } from 'lucide-react';
import PrimaryButton from '../../components/common/PrimaryButton';

const ScheduleResultPage = () => {
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
    <div className="bg-[#F9FAFB] min-h-screen px-4 pt-6 font-pretendard">
      {/* Header */}
      <div className="text-left mb-4">
        <h1 className="text-xl font-bold">{schedule.title} <span className="text-sm text-gray-400">편집</span></h1>
        <p className="text-sm text-gray-500 mt-1">{schedule.dateRange}</p>
        <p className="text-sm text-gray-500">{schedule.organizer}</p>
      </div>

      {/* 버튼 */}
      <div className="flex gap-2 mb-4">
        <PrimaryButton text="일정표 함께 일정 짜기" className="flex-1" />
        <PrimaryButton text="일정 초대" className="flex-1 bg-white text-[#5E87EB] border border-[#5E87EB]" />
      </div>

      {/* 지도 영역 */}
      <div className="w-full h-48 bg-gray-200 rounded-lg mb-6 flex items-center justify-center text-gray-500">
        지도 영역
      </div>

      {/* 일자별 일정 */}
      {schedule.days.map((day, index) => (
        <div key={index} className="mb-6">
          <div className="flex items-center mb-2">
            <p className="text-sm text-[#9CA3AF] mr-2">day {index + 1}</p>
            <p className="text-sm font-medium">{day.date}</p>
            <button className="ml-auto text-sm text-[#9CA3AF]">편집</button>
          </div>

          <div className="space-y-3">
            {day.plans.map((plan, idx) => (
              <div key={plan.id} className="relative bg-white rounded-lg border border-[#E5E7EB] px-4 py-3 shadow-sm">
                <div className="absolute -left-4 top-3 w-6 h-6 bg-[#5E87EB] text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {idx + 1}
                </div>
                <div>
                  <p className="font-medium text-sm">{plan.name}</p>
                  {plan.distance && (
                    <p className="text-xs text-[#9CA3AF] mt-1">{plan.distance}</p>
                  )}
                  {plan.memo && (
                    <div className="text-xs text-gray-600 mt-2 whitespace-pre-line">
                      {plan.memo}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ScheduleResultPage;
