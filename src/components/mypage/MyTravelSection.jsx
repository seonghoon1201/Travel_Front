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

  const loadData = useCallback(async () => {
    try {
      const data = await fetchMyTravel(accessToken);
      const list = Array.isArray(data) ? data : data?.schedules || [];

      // 참여자 수/이미지 정제 포함한 병렬 가공
      const enriched = await Promise.all(
        list.map(async (trip) => {
          // 기본 1명, API 응답 안전 처리
          let companionCount = 1;
          if (trip?.scheduleId) {
            try {
              const res = await getParticipantCount(trip.scheduleId);
              companionCount = typeof res === 'number' ? res : res?.count ?? 1;
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

          return {
            ...trip,
            companionCount,
            imageUrl: safeImage,
          };
        })
      );

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const upcoming = [];
      const past = [];

      for (const trip of enriched) {
        const start = new Date(trip.startDate);
        start.setHours(0, 0, 0, 0);
        if (start >= today) upcoming.push(trip);
        else past.push(trip);
      }

      // 정렬: 다가오는(시작일 오름차순), 지난(시작일 내림차순)
      upcoming.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
      past.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

      setUpcomingTrips(upcoming);
      setPastTrips(past);
    } catch (error) {
      console.error('내 여행 불러오기 실패:', error);
      messageApi.error('내 여행 목록을 불러오지 못했습니다.');
    }
  }, [accessToken, messageApi]);

  useEffect(() => {
    if (accessToken) loadData();
  }, [accessToken, loadData]);

  const handleClickTrip = useCallback(
    (scheduleId) => {
      navigate(`/schedule/view/${scheduleId}`);
    },
    [navigate]
  );

  // 삭제 버튼 눌렀을 때 모달 오픈
  const handleDeleteTrip = useCallback((scheduleId) => {
    setDeleteTarget(scheduleId);
    setShowConfirm(true);
  }, []);

  // 모달에서 "삭제" 눌렀을 때 실행
  const confirmDeleteTrip = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await deleteSchedule(deleteTarget); // ✅ 단 한 번만 호출
      await loadData();
      messageApi.success(
        '일정을 나갔습니다. (마지막 참여자라면 일정이 삭제됩니다.)'
      );
    } catch (error) {
      console.error('일정 삭제 실패:', error);
      messageApi.warning('일정 삭제에 실패했습니다.');
    } finally {
      setShowConfirm(false);
      setDeleteTarget(null);
    }
  }, [deleteTarget, loadData, messageApi]);

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
            key={trip.scheduleId ?? `${trip.startDate}-${trip.scheduleName}`}
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
            key={trip.scheduleId ?? `${trip.startDate}-${trip.scheduleName}`}
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

      {/* 삭제 확인 모달 */}
      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmDeleteTrip}
        title="일정 나가기"
        message="이 일정을 나가시겠습니까? (마지막 참여자라면 일정이 삭제됩니다.)"
        confirmText="삭제"
        cancelText="취소"
        confirmButtonClass="bg-red-500 hover:bg-red-600"
      />
    </div>
  );
};

export default MyTravelSection;
