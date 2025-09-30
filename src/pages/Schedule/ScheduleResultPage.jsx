// src/pages/plan/ScheduleResultPage.jsx
import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DefaultLayout from '../../layouts/DefaultLayout';
import HomeHeader from '../../components/header/HomeHeader';
import PrimaryButton from '../../components/common/PrimaryButton';
import DayScheduleSection from '../../components/schedule/DayScheduleSection';
import KakaoMap from '../../components/map/KakaoMap';
import useScheduleStore from '../../store/scheduleStore';
import useCartStore from '../../store/cartStore';
import usePlanStore from '../../store/planStore';
import { getSchedule, deleteSchedule } from '../../api';
import { message, Progress, Flex, Modal, Spin } from 'antd';

const toNum = (v) => (typeof v === 'number' ? v : Number(v));

const ScheduleResultPage = () => {
  const { scheduleId } = useParams();
  const navigate = useNavigate();

  const detail = useScheduleStore((s) => s.detail);
  const placeIndex = useScheduleStore((s) => s.placeIndex);
  const setDetail = useScheduleStore((s) => s.setDetail);
  const setPlaceIndex = useScheduleStore((s) => s.setPlaceIndex);
  const clearScheduleStore = useScheduleStore((s) => s.clear);
  const getDays = useScheduleStore((s) => s.getDays);

  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [mapLoading, setMapLoading] = useState(true); // 지도 로딩 제어

  const planBudget = usePlanStore((s) => s.budget ?? 0);
  const budget = detail?.budget ?? planBudget;

  // 상세 불러오기
  useEffect(() => {
    (async () => {
      if (String(detail?.scheduleId ?? detail?.id) === String(scheduleId))
        return;
      try {
        const res = await getSchedule(scheduleId);
        setDetail(res);
      } catch (e) {
        console.error(
          '[ScheduleResultPage] reload fail',
          e?.response?.data || e
        );
        message.error('일정 정보를 불러오지 못했어요.');
      }
    })();
  }, [scheduleId, detail?.scheduleId, detail?.id, setDetail]);

  // placeIndex 구성 (카트 + 서버 아이템 병합)
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
        const lat = toNum(it.latitude ?? it.lat ?? it.mapY);
        const lng = toNum(it.longitude ?? it.lng ?? it.mapX);
        idxMerged[key] = {
          name: it.title || key,
          title: it.title || key,
          imageUrl: it.imageUrl || it.firstImage || it.firstimage || '',
          lat: Number.isNaN(lat) ? undefined : lat,
          lng: Number.isNaN(lng) ? undefined : lng,
          address: it.address || it.addr1 || '',
        };
      }
    });

    setPlaceIndex(idxMerged);
  }, [detail, placeIndex, setPlaceIndex]);

  const days = getDays();

  useEffect(() => {
    if (selectedDayIndex >= days.length) setSelectedDayIndex(0);
  }, [days.length, selectedDayIndex]);

  // 예산/비용
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

  // 히어로 이미지 (regionImage 우선)
  const heroUrl = useMemo(() => {
    const byDetail =
      detail?.regionImage || detail?.imageUrl || detail?.thumbnail;
    const byItems = (detail?.scheduleItems || [])
      .map((it) => it.imageUrl || it.firstImage || it.firstimage)
      .find(Boolean);
    return byDetail || byItems || null;
  }, [detail]);

  // 현재 Day의 원본 리스트 (좌표 유무 상관없이)
  const selectedList = useMemo(() => {
    const d = days[selectedDayIndex];
    let list = d?.plans ?? [];
    if ((!list || list.length === 0) && Array.isArray(detail?.scheduleItems)) {
      list = detail.scheduleItems.filter(
        (it) => Number(it.dayNumber) === selectedDayIndex + 1
      );
    }
    return list || [];
  }, [days, detail, selectedDayIndex]);

  // 실제 마커
  const selectedMarkers = useMemo(() => {
    const markers = [];
    (selectedList || []).forEach((p, i) => {
      const lat = toNum(p.lat ?? p.latitude ?? p.mapY);
      const lng = toNum(p.lng ?? p.longitude ?? p.mapX);
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
        markers.push({
          lat,
          lng,
          order: i + 1,
          title: p.title || p.name || `#${i + 1}`,
        });
      }
    });
    return markers;
  }, [selectedList]);

  const path = useMemo(
    () => selectedMarkers.map((m) => ({ lat: m.lat, lng: m.lng })),
    [selectedMarkers]
  );

  // 지도 로딩 컨트롤: 모두 준비되면 즉시, 일부 없어도 1.5초 후엔 표시
  useEffect(() => {
    setMapLoading(true);
    const expected = selectedList.length;
    const readyAll = expected === 0 || selectedMarkers.length === expected;

    if (readyAll) {
      setMapLoading(false);
      return;
    }
    const t = setTimeout(() => setMapLoading(false), 1500);
    return () => clearTimeout(t);
  }, [selectedList, selectedMarkers, selectedDayIndex]);

  const title = detail?.scheduleName || '여행 일정';
  const dateRange =
    detail?.startDate && detail?.endDate
      ? `${detail.startDate} ~ ${detail.endDate}`
      : '';

  // 원래 있던 동작 유지
  const finishAndExit = async () => {
    try {
      message.info({ content: '내 일정에 추가되었어요.', duration: 2, key: 'schedule-added' });
      await clearScheduleStore();
      await usePlanStore.getState().finishPlanning();
    } finally {
      navigate('/mypage', { replace: true });
    }
  };

  const retryPlanWithDelete = () => {
    Modal.confirm({
      title: '일정을 다시 짤까요?',
      content:
        '현재 생성된 일정이 삭제되고 처음부터 다시 만들게 됩니다. 계속하시겠어요?',
      okText: '예, 다시 짜기',
      cancelText: '취소',
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
      <HomeHeader />
      <div className="w-full mx-auto pb-28">
        {/* === Hero (regionImage 배경) === */}
        <div className="px-4 sm:px-6 md:px-8">
          <div className="mt-2 rounded-2xl overflow-hidden border shadow-sm relative">
            <div
              className="h-40 sm:h-48 md:h-56 w-full"
              style={{
                backgroundImage: heroUrl ? `url('${heroUrl}')` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {!heroUrl && (
                <div className="h-full w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
              )}
              <div className="absolute inset-0 bg-black/30" />
              <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <h1 className="text-white font-extrabold text-lg sm:text-xl truncate drop-shadow">
                    {title}
                  </h1>
                  <p className="text-white/90 text-xs sm:text-sm mt-0.5">
                    {dateRange}
                  </p>
                </div>
                {/* 확인 페이지 → 상단 액션 없음 */}
              </div>
            </div>
          </div>
        </div>

        {/* === 예산 진행률 === */}
        <div className="px-4 sm:px-6 md:px-8 mt-3">
          <div className="rounded-2xl border bg-white shadow-sm p-4">
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
              </span>{' '}
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
        </div>

        {/* === Day 버튼 === */}
        <div className="px-4 sm:px-6 md:px-8">
          <div className="flex items-center gap-2 mb-4 mt-3">
            <div className="flex-1 overflow-x-auto scrollbar-hide">
              <div className="flex gap-2 w-max">
                {days.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedDayIndex(idx)}
                    className={`px-3 py-1 rounded-full text-sm border whitespace-nowrap ${
                      selectedDayIndex === idx
                        ? 'border-primary text-primary bg-blue-50'
                        : 'border-gray-300 text-gray-600 bg-white'
                    }`}
                  >
                    Day {idx + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* === 지도 (핀 준비될 때까지 로딩) === */}
        <div className="px-4 sm:px-6 md:px-8">
          <div className="w-full h-56 md:h-64 rounded-xl mb-6 overflow-hidden border shadow-sm flex items-center justify-center">
            {mapLoading ? (
              <Spin />
            ) : selectedMarkers.length > 0 ? (
              <KakaoMap
                key={`${selectedDayIndex}-${selectedMarkers.length}`}
                markers={selectedMarkers}
                useCustomOverlay
                drawPath
                path={path}
                fitToMarkers
                fitPadding={60}
              />
            ) : (
              <div className="text-gray-400 text-sm">
                표시할 위치가 없습니다.
              </div>
            )}
          </div>
        </div>

        {/* === 선택한 날짜 일정 === */}
        <div className="px-4 sm:px-6 md:px-8">
          {days[selectedDayIndex] ? (
            <DayScheduleSection
              key={selectedDayIndex}
              day={days[selectedDayIndex]}
              dayIndex={selectedDayIndex}
              readOnly // 확인용
            />
          ) : (
            <div className="rounded-xl border bg-gray-50 text-gray-500 text-sm p-6 text-center">
              표시할 일정이 없습니다.
            </div>
          )}
        </div>

        {/* === 하단 고정 버튼 바 (원래대로 유지) === */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur border-t footer-safe">
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
