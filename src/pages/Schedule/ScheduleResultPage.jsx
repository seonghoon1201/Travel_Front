// src/pages/plan/ScheduleResultPage.jsx
import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DefaultLayout from '../../layouts/DefaultLayout';
import HomeHeader from '../../components/header/HomeHeader';
import PrimaryButton from '../../components/common/PrimaryButton';
import DayScheduleSection from '../../components/schedule/DayScheduleSection';
import EditModal from '../../components/schedule/EditModal';
import KakaoMap from '../../components/map/KakaoMap';
import useScheduleStore from '../../store/scheduleStore';
import useCartStore from '../../store/cartStore';
import usePlanStore from '../../store/planStore';
import { getSchedule, deleteSchedule } from '../../api';
import { message, Progress, Flex, Modal } from 'antd';

const ScheduleResultPage = () => {
  const { scheduleId } = useParams();
  const navigate = useNavigate();

  // ✅ zustand: 필요한 조각만 셀렉터로
  const detail = useScheduleStore((s) => s.detail);
  const placeIndex = useScheduleStore((s) => s.placeIndex);
  const setDetail = useScheduleStore((s) => s.setDetail);
  const setPlaceIndex = useScheduleStore((s) => s.setPlaceIndex);
  const clearScheduleStore = useScheduleStore((s) => s.clear);
  const getDays = useScheduleStore((s) => s.getDays);

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

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
        setDetail(res); // ✅ 액션만 의존성에
      } catch (e) {
        console.error('[ScheduleResult] reload fail', e?.response?.data || e);
        message.error('일정 정보를 불러오지 못했어요.');
      }
    })();
    // 의존성: URL의 scheduleId와 setDetail만
  }, [scheduleId, setDetail, detail?.scheduleId, detail?.id]);

  // ✅ placeIndex 보강 (한 번만)
  useEffect(() => {
    if (!detail || !Array.isArray(detail?.scheduleItems)) return;
    if (placeIndex && Object.keys(placeIndex).length > 0) return;

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

    setPlaceIndex(idxMerged);
  }, [detail, placeIndex, setPlaceIndex]);

  // days 변환
  const days = getDays();

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

  // ✅ 선택 Day의 마커
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

  const path = useMemo(
    () => selectedMarkers.map((m) => ({ lat: m.lat, lng: m.lng })),
    [selectedMarkers]
  );

  const title = detail?.scheduleName || '여행 일정';
  const dateRange =
    detail?.startDate && detail?.endDate
      ? `${detail.startDate} ~ ${detail.endDate}`
      : '';

  // 결과 확정(완료)
  const finishAndExit = async () => {
    try {
      await clearScheduleStore();
      await usePlanStore.getState().finishPlanning();
    } finally {
      navigate('/mypage', { replace: true });
    }
  };

  // 일정 다시 짜기 (삭제 → 초기화 → 처음으로)
  const retryPlanWithDelete = () => {
    Modal.confirm({
      title: '일정을 다시 짤까요?',
      content:
        '현재 생성된 일정이 삭제되고 처음부터 다시 만들게 됩니다. 계속하시겠어요?',
      okText: '예, 다시 짜기',
      cancelText: '취소',
      // ✅ 버튼 가독성 고정
      okButtonProps: {
        type: 'primary',
        className:
          '!text-white !bg-primary !border-primary hover:!bg-primary/90 ' +
          'focus:!bg-primary/90 active:!bg-primary',
      },
      cancelButtonProps: {
        className:
          '!text-gray-700 !border-gray-300 hover:!border-gray-400 ' +
          'focus:!border-gray-400',
      },
      async onOk() {
        try {
          const id = String(
            scheduleId || detail?.scheduleId || detail?.id || ''
          );
          if (!id) throw new Error('삭제할 scheduleId를 찾지 못했습니다.');
          await deleteSchedule(id);
          await clearScheduleStore();
          await usePlanStore.getState().cancelPlanning();
          message.success('일정을 삭제했어요. 처음부터 다시 시작합니다.');
          navigate('/plan/location', { replace: true });
        } catch (e) {
          console.error(
            '[ScheduleResultPage] delete failed',
            e?.response?.data || e
          );
          message.error(
            e?.response?.data?.message || '일정 삭제에 실패했어요.'
          );
        }
      },
    });
  };

  return (
    <DefaultLayout>
      <div className="w-full mx-auto px-4 sm:px-6 md:px-8 pb-28">
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

        {/* 하단 고정 버튼 바 */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur border-t">
          <div className="mx-auto w-full px-4 sm:px-6 md:px-8 py-3 flex gap-2">
            <button
              onClick={retryPlanWithDelete}
              className="flex-1 rounded-xl border border-gray-300 py-2 text-sm"
            >
              일정 다시 짜기
            </button>
            <PrimaryButton onClick={finishAndExit} className="flex-1">
              내 일정에 추가하기
            </PrimaryButton>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default ScheduleResultPage;
