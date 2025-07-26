import React, { useEffect, useState } from 'react';
import CreateScheduleCard from './CreateScheduleCard';
import MyTravelItem from './MyTravelItem';

import useUserStore from '../../store/userStore';
import { fetchMyTravel } from '../../api/user/userContentApi';

const MyTravelSection = () => {
  const [upcomingTrips, setUpcomingTrips] = useState([]);
  const [pastTrips, setPastTrips] = useState([]);
  const accessToken = useUserStore((state) => state.accessToken);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchMyTravel(accessToken);

        // 오늘 날짜
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 여행 분류 (미래, 과거)
        const upcoming = [];
        const past = [];

        data.forEach((trip) => {
          const start = new Date(trip.startDate);
          start.setHours(0, 0, 0, 0);

          if (start >= today) {
            upcoming.push(trip);
          } else {
            past.push(trip);
          }
        });

        setUpcomingTrips(upcoming);
        setPastTrips(past);
      } catch (error) {
        console.error('내 여행 불러오기 실패:', error);
      }
    };

    loadData();
  }, [accessToken]);

  return (
    <div className="bg-white">
      <div className="px-4 pt-2 m-2">
        <p className="text-sm font-semibold text-gray-600 mb-3 m-2">
          다가오는 여행
        </p>
        {upcomingTrips.length === 0 ? (
          <p className="text-gray-400 text-sm">예정된 여행이 없습니다.</p>
        ) : (
          upcomingTrips.map((trip) => (
            <MyTravelItem
              key={trip.scheduleId}
              title={trip.scheduleName}
              dateRange={`${trip.startDate} ~ ${trip.endDate}`}
              companionCount={trip.groupName ? 1 : 0} // 동행자 수 필드 없으면 groupName 여부로 처리
              imageUrl={trip.imageUrl || '/default-travel.jpg'}
            />
          ))
        )}

        <p className="text-sm font-semibold text-gray-600 mt-4 mb-3 m-2">
          지난 여행
        </p>
        {pastTrips.length === 0 ? (
          <p className="text-gray-400 text-sm">지난 여행 기록이 없습니다.</p>
        ) : (
          pastTrips.map((trip) => (
            <MyTravelItem
              key={trip.scheduleId}
              title={trip.scheduleName}
              dateRange={`${trip.startDate} ~ ${trip.endDate}`}
              companionCount={trip.groupName ? 1 : 0}
              imageUrl={trip.imageUrl || '/default-travel.jpg'}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default MyTravelSection;
