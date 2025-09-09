import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import MyTravelItem from './MyTravelItem';
import useUserStore from '../../store/userStore';
import { fetchMyTravel } from '../../api/user/userContentApi';
import { deleteSchedule } from '../../api/schedule/schedule'; 
import groupApi from '../../api/group/group';
import { useToast } from '../../utils/useToast';

const MyTravelSection = () => {
  const [upcomingTrips, setUpcomingTrips] = useState([]);
  const [pastTrips, setPastTrips] = useState([]);
  const accessToken = useUserStore((state) => state.accessToken);
  const { showSuccess, showError, showInfo, showWarning } = useToast();


  const navigate = useNavigate();

  const loadData = async () => {
    try {
      const data = await fetchMyTravel(accessToken);
      const list = Array.isArray(data) ? data : data?.schedules || [];

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const upcoming = [];
      const past = [];

      for (const trip of list) {
        const start = new Date(trip.startDate);
        start.setHours(0, 0, 0, 0);

        // 그룹 인원 수 가져오기
        let companionCount = 1;
        if (trip.groupId) {
          try {
            const res = await groupApi.count(trip.groupId);
            companionCount = res;
          } catch (err) {
            console.error(`그룹 인원 수 불러오기 실패 (${trip.groupId}):`, err);
          }
        }

        const safeImage =
          (trip.regionImage && String(trip.regionImage).trim()) ||
          (trip.imageUrl && String(trip.imageUrl).trim()) ||
          '/default-travel.jpg';

        const enrichedTrip = {
          ...trip,
          companionCount,
          imageUrl: safeImage,
        };

        if (start >= today) {
          upcoming.push(enrichedTrip);
        } else {
          past.push(enrichedTrip);
        }
      }

      setUpcomingTrips(upcoming);
      setPastTrips(past);
    } catch (error) {
      console.error('내 여행 불러오기 실패:', error);
    }
  };

  useEffect(() => {
    if (accessToken) loadData();
  }, [accessToken]);

  const handleClickTrip = useCallback(
    (scheduleId) => {
      navigate(`/schedule/view/${scheduleId}`);
    },
    [navigate]
  );

  const handleDeleteTrip = useCallback(async (scheduleId) => {
    if (!window.confirm('정말 이 일정을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await deleteSchedule(scheduleId);
      await loadData();
      
      showSuccess('일정이 삭제되었습니다.');
    } catch (error) {
      console.error('일정 삭제 실패:', error);
      showWarning('일정 삭제에 실패했습니다.');
    }
  }, [accessToken]);

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
            companionCount={trip.companionCount}
            imageUrl={trip.imageUrl}
            onClick={() => handleClickTrip(trip.scheduleId)}
            onDelete={handleDeleteTrip} 
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
            companionCount={trip.companionCount}
            imageUrl={trip.imageUrl}
            onClick={() => handleClickTrip(trip.scheduleId)}
            onDelete={handleDeleteTrip} 
          />
        ))
      )}
    </div>
  );
};

export default MyTravelSection;