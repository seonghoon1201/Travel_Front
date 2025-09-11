import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DefaultLayout from '../../layouts/DefaultLayout';
import BackHeader from '../../components/header/BackHeader';
import PrimaryButton from '../../components/common/PrimaryButton';
import DayScheduleSection from '../../components/schedule/DayScheduleSection';
import EditModal from '../../components/schedule/EditModal';
import KakaoMap from '../../components/map/KakaoMap';
import useScheduleStore from '../../store/scheduleStore';
import usePlanStore from '../../store/planStore';
import { getSchedule } from '../../api';
import { message, Progress, Flex } from 'antd';

const toNum = (v) => (typeof v === 'number' ? v : Number(v));

const ScheduleViewPage = () => {
  const { scheduleId } = useParams();
  const navigate = useNavigate();

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  const detail = useScheduleStore((s) => s.detail);
  const setDetail = useScheduleStore((s) => s.setDetail);
  const setPlaceIndex = useScheduleStore((s) => s.setPlaceIndex);
  const getDays = useScheduleStore((s) => s.getDays);

  const planBudget = usePlanStore((s) => s.budget ?? 0);
  const budget = detail?.budget ?? planBudget;

  useEffect(() => {
    (async () => {
      if (String(detail?.scheduleId ?? detail?.id) === String(scheduleId))
        return;
      try {
        const res = await getSchedule(scheduleId);
        setDetail(res);
      } catch (e) {
        console.error('[ScheduleViewPage] reload fail', e?.response?.data || e);
        message.error('일정 정보를 불러오지 못했어요.');
      }
    })();
  }, [scheduleId, detail?.scheduleId, detail?.id, setDetail]);

  useEffect(() => {
    if (!detail || !Array.isArray(detail?.scheduleItems)) return;

    const idx = {};
    detail.scheduleItems.forEach((it) => {
      const key = String(it.contentId ?? '');
      if (!key) return;

      // ✅ 백엔드 latitude/longitude 우선 사용
      const lat = toNum(it.latitude ?? it.lat ?? it.mapY);
      const lng = toNum(it.longitude ?? it.lng ?? it.mapX);

      idx[key] = {
        name: it.title || it.name || key,
        title: it.title || it.name || key,
        imageUrl: it.imageUrl || it.firstImage || it.firstimage || '',
        lat: Number.isNaN(lat) ? undefined : lat,
        lng: Number.isNaN(lng) ? undefined : lng,
        address: it.address || it.addr1 || '',
      };
    });

    setPlaceIndex(idx);
  }, [detail, setPlaceIndex]);

  const days = getDays();

  useEffect(() => {
    if (selectedDayIndex >= days.length) setSelectedDayIndex(0);
  }, [days.length, selectedDayIndex]);

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

  // ✅ editable 필드로만 편집 권한 판단
  const canEdit = detail?.editable === true;
  const isPublicView = detail?.editable === false;

  const selectedMarkers = useMemo(() => {
    const d = days[selectedDayIndex];
    let list = d?.plans ?? [];

    if ((!list || list.length === 0) && Array.isArray(detail?.scheduleItems)) {
      list = detail.scheduleItems.filter(
        (it) => Number(it.dayNumber) === selectedDayIndex + 1
      );
    }

    const markers = [];
    (list || []).forEach((p, i) => {
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
  }, [days, detail, selectedDayIndex]);

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
      <BackHeader />
      <div className="w-full mx-auto px-4 sm:px-6 md:px-8 pb-16">
        {/* Header */}
        <div className="flex justify-between items-center mb-1 px-1">
          <h1 className="text-xl font-bold">{title}</h1>
          {canEdit ? (
            <button
              onClick={() => setShowEditModal(true)}
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              편집
            </button>
          ) : (
            <span className="text-xs text-red-500">편집 권한이 없습니다</span>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-1">{dateRange}</p>

        {/* 공개 보기 뱃지 */}
        {isPublicView && (
          <div className="mt-2 mb-1">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
              공개 일정 (읽기 전용)
            </span>
          </div>
        )}

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

        {/* Day 버튼 */}
        <div className="flex items-center gap-2 mb-4 mt-3">
          {canEdit && (
            <div className="flex-shrink-0">
              <PrimaryButton
                className="px-3 py-1 text-sm whitespace-nowrap"
                onClick={() => navigate(`/schedule/invite/${scheduleId}`)}
              >
                초대하기
              </PrimaryButton>
            </div>
          )}
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
            key={`${selectedDayIndex}-${selectedMarkers.length}`}
            markers={selectedMarkers}
            useCustomOverlay
            drawPath
            path={path}
            fitToMarkers
            fitPadding={60}
          />
        </div>

        {/* 선택한 날짜 일정 */}
        {days[selectedDayIndex] && (
          <DayScheduleSection
            key={selectedDayIndex}
            day={days[selectedDayIndex]}
            dayIndex={selectedDayIndex}
            canEdit={canEdit}
          />
        )}

        {/* 편집 모달 */}
        {showEditModal && canEdit && (
          <EditModal onClose={() => setShowEditModal(false)} />
        )}
      </div>
    </DefaultLayout>
  );
};

export default ScheduleViewPage;