import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';

import MyTravelItem from './MyTravelItem';
import useUserStore from '../../store/userStore';
import { fetchMyTravel } from '../../api/user/userContentApi';
import {
  deleteSchedule,
  getParticipantCount,
} from '../../api/schedule/schedule';
import ConfirmModal from '../modal/ConfirmModal';

const MyTravelSection = () => {
  const [upcomingTrips, setUpcomingTrips] = useState([]);
  const [pastTrips, setPastTrips] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const accessToken = useUserStore((state) => state.accessToken);
  const [messageApi, contextHolder] = message.useMessage();
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

        // 새로운 API를 사용하여 스케줄 참여자 수 가져오기
        let companionCount = 1;
        if (trip.scheduleId) {
          try {
            const res = await getParticipantCount(trip.scheduleId);
            companionCount = res;
          } catch (err) {
            console.error(
              `스케줄 참여자 수 불러오기 실패 (${trip.scheduleId}):`,
              err
            );
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
      messageApi.error('내 여행 목록을 불러오지 못했습니다.');
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

  //  삭제 버튼 눌렀을 때 모달 오픈
  const handleDeleteTrip = useCallback((scheduleId) => {
    setDeleteTarget(scheduleId);
    setShowConfirm(true);
  }, []);

  //  모달에서 "삭제" 눌렀을 때 실행
  const confirmDeleteTrip = async () => {
    if (!deleteTarget) return;
    try {
      // ✅ 토큰 같이 전달
      await deleteSchedule(deleteTarget, accessToken);
      await loadData();
      messageApi.success('일정이 삭제되었습니다.');
    } catch (error) {
      console.error('일정 삭제 실패:', error);
      messageApi.warning('일정 삭제에 실패했습니다.');
    } finally {
      setShowConfirm(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="px-4 pt-2 m-2 sm:px-6 md:px-8">
      {contextHolder}

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

      {/*  삭제 확인 모달 */}
      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmDeleteTrip}
        title="일정 삭제"
        message="정말 이 일정을 삭제하시겠습니까?"
        confirmText="삭제"
        cancelText="취소"
        confirmButtonClass="bg-red-500 hover:bg-red-600"
      />
    </div>
  );
};

export default MyTravelSection;
