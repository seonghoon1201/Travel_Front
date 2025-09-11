import React from 'react';
import { X, CalendarDays, MapPin } from 'lucide-react';
import PrimaryButton from '../common/PrimaryButton';

const DaySelectorModal = ({ 
  isOpen, 
  onClose, 
  scheduleInfo, 
  days = [],
  onDaySelect 
}) => {
  if (!isOpen) return null;

  // 날짜 계산 함수
  const calculateDate = (startDate, dayIndex) => {
    if (!startDate) return `Day ${dayIndex + 1}`;
    try {
      const start = new Date(startDate);
      const targetDate = new Date(start);
      targetDate.setDate(start.getDate() + dayIndex);
      return targetDate.toLocaleDateString('ko-KR', { 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return `Day ${dayIndex + 1}`;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-sm shadow-2xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-blue-500" />
            <h2 className="pt-2 text-lg font-semibold">날짜별 일정 보기</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 스케줄 정보 */}
        {scheduleInfo && (
          <div className="p-4 bg-gray-50 border-b">
            <h3 className="font-medium text-gray-800">{scheduleInfo.scheduleName}</h3>
            <p className="text-sm text-gray-500 ">
              {scheduleInfo.startDate} ~ {scheduleInfo.endDate}
            </p>
          </div>
        )}

        {/* 날짜 선택 리스트 */}
        <div className="max-h-80 overflow-y-auto">
          {days.length > 0 ? (
            days.map((day, index) => (
              <button
                key={index}
                onClick={() => {
                  onDaySelect(index);
                  onClose();
                }}
                className="w-full p-4 text-left hover:bg-gray-50 border-b border-gray-100 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold">
                        {index + 1}
                      </div>
                      <div className="flex items-center gap-2 text-gray-700 text-sm">
                        <span className="font-medium">Day {index + 1}</span>
                        <span className="text-gray-500">{calculateDate(scheduleInfo?.startDate, index)}</span>
                      </div>

                    </div>
                    
                    {/* 해당 날짜의 장소 개수 */}
                    {day.plans && day.plans.length > 0 && (
                      <div className="mt-2 ml-11">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <MapPin className="w-3 h-3" />
                          <span>{day.plans.length}개 장소</span>
                        </div>
                        {/* 첫 번째 장소 미리보기 */}
                        {day.plans[0] && (
                          <p className="text-xs text-gray-400 mt-1 truncate">
                            {day.plans[0].title || day.plans[0].name}
                            {day.plans.length > 1 && ` 외 ${day.plans.length - 1}곳`}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-gray-400">
                    →
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              <CalendarDays className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p>일정 정보가 없습니다</p>
            </div>
          )}
        </div>

        {/* 전체 일정 보기 버튼 */}
        <div className="p-4 border-t bg-gray-50">
          <PrimaryButton
            onClick={() => {
              onDaySelect('all'); 
              onClose();
            }}
           
          >
            전체 일정 보기
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};

export default DaySelectorModal;