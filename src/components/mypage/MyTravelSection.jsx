import React from 'react';
import CreateScheduleCard from './CreateScheduleCard';
import MyTravelItem from './MyTravelItem';

const MyTravelSection = () => {
  // 임시 여행 데이터 예시
  const upcomingTrips = [
    {
      id: 1,
      title: '강릉·속초',
      dateRange: '2026.1.15 ~ 2026.1.20',
      companionCount: '1',
      imageUrl: '/assets/profile_default.png',
    },
    {
      id: 2,
      title: '부산 ',
      dateRange: '2026.1.25 ~ 2026.1.27',
      companionCount: '5',
      imageUrl: '/assets/profile_default.png',
    },
  ];

  const pastTrips = [
    {
      id: 2,
      title: '경기 광주 ',
      dateRange: '2026.1.15 ~ 2026.1.20',
      companionCount: '1',
      imageUrl: '/assets/sample_trip.jpg',
    },
  ];

  return (
    <div className="bg-white">
      <div className="px-4 pt-2 m-2">
        <p className="text-sm font-semibold text-gray-600 mb-3 m-2">
          다가오는 여행
        </p>
        {upcomingTrips.map((trip) => (
          <MyTravelItem
            key={trip.id}
            title={trip.title}
            dateRange={trip.dateRange}
            companionCount={trip.companionCount}
            imageUrl={trip.imageUrl}
          />
        ))}

        <p className="text-sm font-semibold text-gray-600 mt-4 mb-3 m-2">
          지난 여행
        </p>
        {pastTrips.map((trip) => (
          <MyTravelItem
            key={trip.id}
            title={trip.title}
            dateRange={trip.dateRange}
            companionCount={trip.companionCount}
            imageUrl={trip.imageUrl}
          />
        ))}
      </div>
    </div>
  );
};

export default MyTravelSection;
