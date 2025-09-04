import React, { useMemo, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DefaultLayout from '../../layouts/DefaultLayout';
import HomeHeader from '../../components/header/HomeHeader';
import PrimaryButton from '../../components/common/PrimaryButton';
import DayScheduleSection from '../../components/schedule/DayScheduleSection';
import EditModal from '../../components/schedule/EditModal';
import KakaoMap from '../../components/map/KakaoMap';
import useScheduleStore from '../../store/scheduleStore';
import useCartStore from '../../store/cartStore';
import usePlanStore from '../../store/planStore';
import { getSchedule } from '../../api';
import { message, Progress, Flex } from 'antd';

const ScheduleResultPage = () => {
  const { scheduleId } = useParams();
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const scheduleStore = useScheduleStore();
  const detail = scheduleStore.detail;

  // ✅ 예산: 응답(detail.budget) 우선, 없으면 PlanStore
  const planBudget = usePlanStore((s) => s.budget ?? 0);
  const budget = detail?.budget ?? planBudget;

  // 새로고침 대비 서버 재로드
  useEffect(() => {
    (async () => {
      if (detail?.scheduleId === scheduleId || detail?.id === scheduleId)
        return;
      try {
        const res = await getSchedule(scheduleId);
        console.log('[ScheduleResultPage] getSchedule response →', res);
        scheduleStore.setDetail(res);
      } catch (e) {
        console.error('[ScheduleResult] reload fail', e?.response?.data || e);
        message.error('일정 정보를 불러오지 못했어요.');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scheduleId]);

  // ✅ placeIndex 보강
  useEffect(() => {
    if (!detail || !Array.isArray(detail?.scheduleItems)) return;
    const currentIndex = scheduleStore.placeIndex || {};
    if (Object.keys(currentIndex).length > 0) return;

    const { items: cartItems = [] } = useCartStore.getState();
    const idxFromCart = {};
    cartItems.forEach((it) => {
      const key = String(it.contentId ?? '');
      if (!key) return;
      idxFromCart[key] = {
        name: it.name,
        title: it.name,
        imageUrl: it.imageUrl,
        lat: it?.location?.lat,
        lng: it?.location?.lng,
        address: it.address,
      };
    });

    const idxMerged = { ...idxFromCart };
    detail.scheduleItems.forEach((it) => {
      const key = String(it.contentId ?? '');
      if (!key) return;
      if (!idxMerged[key]) {
        idxMerged[key] = { name: it.title || key, title: it.title || key };
      }
    });

    scheduleStore.setPlaceIndex(idxMerged);
  }, [detail, scheduleStore]);

  // days 변환
  const days = scheduleStore.getDays();

  // ✅ index 가드
  useEffect(() => {
    if (selectedDayIndex >= days.length) setSelectedDayIndex(0);
  }, [days.length, selectedDayIndex]);

  // ✅ 전체 비용 합계
  const totalCost = useMemo(() => {
    const getCost = (p) => Number(p?.cost ?? p?.price ?? p?.amount ?? 0) || 0;
    try {
      return (days || []).reduce(
        (sum, d) => sum + (d?.plans || []).reduce((s, p) => s + getCost(p), 0),
        0
      );
    } catch {
      return 0;
    }
  }, [days]);

  const remaining = useMemo(
    () => (budget || 0) - (totalCost || 0),
    [budget, totalCost]
  );
  const percentUsed = useMemo(() => {
    if (!budget || budget <= 0) return 0;
    return Math.min(100, (totalCost / budget) * 100);
  }, [budget, totalCost]);

  // ✅ 선택 Day의 마커: 백엔드 order를 그대로 숫자로 표시
  const selectedMarkers = useMemo(() => {
    if (!days[selectedDayIndex]) return [];
    return days[selectedDayIndex].plans
      .filter((p) => typeof p.lat === 'number' && typeof p.lng === 'number')
      .map((p, i) => ({
        lat: p.lat,
        lng: p.lng,
        order: i + 1, // ✅ 당일 리스트 순서대로 1..N
        title: p.title || p.name || `#${i + 1}`,
      }));
  }, [days, selectedDayIndex]);

  // 폴리라인 경로
  const path = useMemo(
    () => selectedMarkers.map((m) => ({ lat: m.lat, lng: m.lng })),
    [selectedMarkers]
  );

  const title = detail?.scheduleName || '여행 일정';
  const dateRange =
    detail?.startDate && detail?.endDate
      ? `${detail.startDate} ~ ${detail.endDate}`
      : '';

  return (
    <DefaultLayout>
      <div className="w-full max-w-sm mx-auto px-4">
        <HomeHeader />

        {/* Header */}
        <div className="flex justify-between items-center mb-1">
          <h1 className="text-xl font-bold">{title}</h1>
          <button
            onClick={() => setShowEditModal(true)}
            className="text-sm text-gray-400"
          >
            편집
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-1">{dateRange}</p>

        {/* 예산 진행률 */}
        <div className="mt-3">
          <p className="text-sm text-center flex justify-center items-center gap-1">
            전체 예산 대비{' '}
            <span
              className={
                remaining < 0
                  ? 'text-red-500 font-bold'
                  : 'text-blue-500 font-bold'
              }
            >
              {Math.abs(remaining).toLocaleString()}원{' '}
              {remaining < 0 ? '초과' : '여유'}
            </span>
            입니다.
          </p>
          <Flex gap="small" vertical className="mt-2">
            <Progress
              percent={percentUsed}
              status={remaining < 0 ? 'exception' : 'active'}
              format={() =>
                `₩${totalCost.toLocaleString()} / ₩${(
                  budget || 0
                ).toLocaleString()}`
              }
            />
          </Flex>
        </div>

        <div className="flex items-center gap-2 mb-4 mt-3">
          <div className="flex-shrink-0">
            <PrimaryButton className="px-3 py-1 text-sm whitespace-nowrap">
              함께하는 일행
            </PrimaryButton>
          </div>

          {/* Day 버튼 */}
          <div className="flex-1 overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 w-max">
              {days.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedDayIndex(idx)}
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

        {/* 지도 */}
        <div className="w-full h-48 rounded-lg mb-6 overflow-hidden">
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
        {days[selectedDayIndex] && (
          <DayScheduleSection
            key={selectedDayIndex}
            day={days[selectedDayIndex]}
            dayIndex={selectedDayIndex}
          />
        )}

        {/* 편집 모달 */}
        {showEditModal && <EditModal onClose={() => setShowEditModal(false)} />}
      </div>
    </DefaultLayout>
  );
};

export default ScheduleResultPage;
