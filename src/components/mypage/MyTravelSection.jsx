import React, { useEffect, useState } from 'react';
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

      console.log('API 응답 데이터:', data);

      // 여기서 데이터 구조 확인
      if (Array.isArray(data)) {
        data.forEach((trip, idx) => {
          console.log(`trip[${idx}] keys:`, Object.keys(trip));
        });
      } else {
        console.log('data는 배열이 아님:', data);
      }

      // 오늘 날짜 기준 분류
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const upcoming = [];
      const past = [];

      data.forEach((trip) => {
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

  loadData();
}, [accessToken]);


  const handleClickTrip = (scheduleId) => {
  navigate(`/plan/schedule/result/${scheduleId}`);
};

  return (
      <div className="px-4 pt-2 m-2  sm:px-6 md:px-8">
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
            onClick={() => handleClickTrip(trip.scheduleId)} 
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
              title={trip.scheduleName}
              dateRange={`${trip.startDate} ~ ${trip.endDate}`}
              companionCount={trip.groupName ? 1 : 0}
              imageUrl={trip.imageUrl || '/default-travel.jpg'}
              onClick={() => handleClickTrip(trip.scheduleId)} 
            />
          ))
        )}
      </div>
  
  );
};

export default MyTravelSection;
