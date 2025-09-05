import React, { useMemo } from 'react';
import KakaoMap from '../map/KakaoMap';
import DayScheduleSection from './DayScheduleSection';

const ScheduleMapSection = ({ 
  days = [], 
  selectedDayIndex = 0, 
  onDaySelect,
  showDayButtons = true,
  showScheduleList = true,
  mapHeight = "h-48",
  className = ""
}) => {
  // 선택된 날의 마커 데이터
  const selectedMarkers = useMemo(() => {
    if (!days[selectedDayIndex]) return [];
    return days[selectedDayIndex].plans
      .filter((p) => typeof p.lat === 'number' && typeof p.lng === 'number')
      .map((p, i) => ({
        lat: p.lat,
        lng: p.lng,
        order: i + 1,
        title: p.title || p.name || `#${i + 1}`,
      }));
  }, [days, selectedDayIndex]);

  // 폴리라인 경로
  const path = useMemo(
    () => selectedMarkers.map((m) => ({ lat: m.lat, lng: m.lng })),
    [selectedMarkers]
  );

  return (
    <div className={className}>
      {/* Day 선택 버튼들 */}
      {showDayButtons && days.length > 1 && (
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 w-max">
              {days.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => onDaySelect?.(idx)}
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
      )}

      {/* 지도 */}
      <div className={`w-full ${mapHeight} rounded-lg mb-6 overflow-hidden`}>
        <KakaoMap
          markers={selectedMarkers}
          useCustomOverlay={true}
          drawPath={true}
          path={path}
          fitToMarkers={true}
          fitPadding={60}
        />
      </div>

      {/* 선택한 날짜 일정 */}
      {showScheduleList && days[selectedDayIndex] && (
        <DayScheduleSection
          key={selectedDayIndex}
          day={days[selectedDayIndex]}
          dayIndex={selectedDayIndex}
        />
      )}
    </div>
  );
};

export default ScheduleMapSection;