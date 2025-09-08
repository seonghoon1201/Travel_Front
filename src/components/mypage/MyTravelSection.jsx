import React, { useEffect, useState, useCallback } from 'react';
import MyTravelItem from './MyTravelItem';

import useUserStore from '../../store/userStore';
import { fetchMyTravel } from '../../api/user/userContentApi';
import { useNavigate } from 'react-router-dom';

const MyTravelSection = () => {
  const [upcomingTrips, setUpcomingTrips] = useState([]);
  const [pastTrips, setPastTrips] = useState([]);
  const accessToken = useUserStore((state) => state.accessToken);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchMyTravel(accessToken);

        const list = Array.isArray(data) ? data : data?.schedules || [];

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcoming = [];
        const past = [];

        list.forEach((trip) => {
          const start = new Date(trip.startDate);
          start.setHours(0, 0, 0, 0);
          (start >= today ? upcoming : past).push(trip);
        });

        setUpcomingTrips(upcoming);
        setPastTrips(past);
      } catch (error) {
        console.error('내 여행 불러오기 실패:', error);
      }
    };

    if (accessToken) loadData();
  }, [accessToken]);

  // ✅ useCallback으로 메모이제이션
  const handleClickTrip = useCallback(
    (scheduleId) => {
      navigate(`/schedule/view/${scheduleId}`);
    },
    [navigate]
  );

  return (
    <div className="px-4 pt-2 m-2 sm:px-6 md:px-8">
      <p className="text-sm font-semibold text-gray-600 mb-3 pt-2">
        다가오는 여행
      </p>
      {upcomingTrips.length === 0 ? (
        <p className="text-gray-400 text-sm">예정된 여행이 없습니다.</p>
      ) : (
        upcomingTrips.map((trip) => (
          <MyTravelItem
            key={trip.scheduleId}
            scheduleId={trip.scheduleId}
            title={trip.scheduleName}
            dateRange={`${trip.startDate} ~ ${trip.endDate}`}
            companionCount={trip.groupName ? 1 : 0}
            imageUrl={trip.imageUrl || '/default-travel.jpg'}
            onClick={handleClickTrip} // ✅ 안정된 함수 전달
          />
        ))
      )}

      <p className="text-sm font-semibold text-gray-600 mt-4 mb-3 pt-10">
        지난 여행
      </p>
      {pastTrips.length === 0 ? (
        <p className="text-gray-400 text-sm">지난 여행 기록이 없습니다.</p>
      ) : (
        pastTrips.map((trip) => (
          <MyTravelItem
            key={trip.scheduleId}
            scheduleId={trip.scheduleId}
            title={trip.scheduleName}
            dateRange={`${trip.startDate} ~ ${trip.endDate}`}
            companionCount={trip.groupName ? 1 : 0}
            imageUrl={trip.imageUrl || '/default-travel.jpg'}
            onClick={handleClickTrip} // ✅ 동일하게 처리
          />
        ))
      )}
    </div>
  );
};

export default MyTravelSection;
