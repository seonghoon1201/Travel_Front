// src/pages/schedule/ScheduleViewPage.jsx
import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DefaultLayout from '../../layouts/DefaultLayout';
import BackHeader from '../../components/header/BackHeader';
import DayScheduleSection from '../../components/schedule/DayScheduleSection';
import EditModal from '../../components/schedule/EditModal';
import KakaoMap from '../../components/map/KakaoMap';
import useScheduleStore from '../../store/scheduleStore';
import usePlanStore from '../../store/planStore';
import { getSchedule } from '../../api';
import { message, Progress, Flex, Spin } from 'antd';
import useUserStore from '../../store/userStore';

const toNum = (v) => (typeof v === 'number' ? v : Number(v));

const ScheduleViewPage = () => {
  const { scheduleId } = useParams();
  const navigate = useNavigate();

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [mapLoading, setMapLoading] = useState(true);

  const detail = useScheduleStore((s) => s.detail);
  const setDetail = useScheduleStore((s) => s.setDetail);
  const setPlaceIndex = useScheduleStore((s) => s.setPlaceIndex);
  const getDays = useScheduleStore((s) => s.getDays);

  const planBudget = usePlanStore((s) => s.budget ?? 0);
  const budget = detail?.budget ?? planBudget;

  const meId = useUserStore((s) => s.userId);

  // 참여자 파싱
  const participants = useMemo(() => {
    const arr = Array.isArray(detail?.users) ? detail.users : [];
    return arr.map((u) => ({
      id: String(u.userId || ''),
      name: u.userName || '참여자',
      avatar: u.userProfileImage || '',
    }));
  }, [detail?.users]);

  // 본인 제외한 ‘다른 사람’들
  const otherMembers = useMemo(
    () =>
      participants.filter((p) => p.id && meId && String(p.id) !== String(meId)),
    [participants, meId]
  );

  // 아바타 스택 UI
  const AvatarStack = ({ people, max = 3 }) => {
    if (!people?.length) return null;
    // 화면을 밀지 않도록 요약(최대 max) + 나머지는 +N
    const shown = people.slice(0, max);
    const rest = people.length - shown.length;

    return (
      <div className="flex items-center">
        <div className="flex -space-x-2">
          {shown.map((p, idx) => (
            <div
              key={p.id || idx}
              className="inline-flex h-7 w-7 rounded-full ring-2 ring-white overflow-hidden bg-gray-200 shrink-0"
              title={p.name}
            >
              {p.avatar ? (
                <img
                  src={p.avatar}
                  alt={p.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-[10px] text-gray-600">
                  {p.name?.[0] || '유'}
                </div>
              )}
            </div>
          ))}
          {rest > 0 && (
            <div
              className="inline-flex h-7 w-7 rounded-full ring-2 ring-white bg-gray-300 text-gray-700 text-[11px] items-center justify-center shrink-0"
              title={`외 ${rest}명`}
            >
              +{rest}
            </div>
          )}
        </div>
      </div>
    );
  };

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

      // 백엔드 latitude/longitude 우선 사용
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

  // 현재 Day의 '원본 리스트'(좌표 유무 상관없이) – 마커 준비 상태 판별용
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

  // 권한: 백엔드 editable 필드 기준
  const canEdit = detail?.editable === true;
  const isPublicView = detail?.editable === false;

  // ✅ regionImage (또는 아이템 이미지)로 히어로 배너 구성
  const heroUrl = useMemo(() => {
    const byDetail =
      detail?.regionImage || detail?.imageUrl || detail?.thumbnail;
    const byItems = (detail?.scheduleItems || [])
      .map((it) => it.imageUrl || it.firstImage || it.firstimage)
      .find(Boolean);
    return byDetail || byItems || null;
  }, [detail]);

  const selectedMarkers = useMemo(() => {
    const list = selectedList;

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
  }, [selectedList]);

  // 지도 표시 준비가 되었는지 판정: 모두 좌표가 준비되면 즉시, 아니면 1.5초 후 강제 표시
  useEffect(() => {
    setMapLoading(true);
    const expected = selectedList.length;
    const readyAll = expected === 0 || selectedMarkers.length === expected;

    if (readyAll) {
      setMapLoading(false);
      return;
    }

    // 좌표가 일부 비어 있어도 무한 로딩 방지를 위해 1.5초 뒤엔 표시
    const t = setTimeout(() => setMapLoading(false), 1500);
    return () => clearTimeout(t);
  }, [selectedList, selectedMarkers, selectedDayIndex]);

  const path = useMemo(
    () => selectedMarkers.map((m) => ({ lat: m.lat, lng: m.lng })),
    [selectedMarkers]
  );

  const title = detail?.scheduleName || '여행 일정';
  const dateRange =
    detail?.startDate && detail?.endDate
      ? `${detail.startDate} ~ ${detail.endDate}`
      : '';

  // src/pages/schedule/ScheduleViewPage.jsx
  // ...상단 import/상태/로직 동일

  return (
    <DefaultLayout>
      <BackHeader />
      <div className="w-full mx-auto pb-16">
        {/* === Hero === */}
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

              {/* ⬆️ 상단 오버레이: 제목 + 날짜 (맨 위) */}
              <div className="absolute top-4 left-5 right-4">
                <h1 className="text-white font-extrabold text-xl sm:text-xl drop-shadow">
                  {title}
                </h1>
                <p className="text-white/90 text-xs sm:text-sm mt-1">
                  {dateRange}
                </p>
              </div>

              {/* ⬇️ 하단 오버레이: 참여자/버튼 (맨 아래, 오른쪽 정렬) */}
              <div className="absolute bottom-3 left-4 right-4">
                {canEdit ? (
                  <div className="min-w-0 flex flex-wrap items-center justify-end gap-2">
                    {participants?.length > 0 && (
                      <div className="flex items-center gap-2">
                        <AvatarStack people={participants} />
                        <span className="text-white text-xs bg-black/40 px-2 py-0.5 rounded-full shrink-0">
                          총 {participants.length}명
                        </span>
                      </div>
                    )}

                    <button
                      onClick={() => navigate(`/schedule/invite/${scheduleId}`)}
                      aria-label="일정 초대하기"
                      className="
                px-3 py-1 rounded-full text-xs sm:text-sm font-semibold
                bg-primary text-white
                active:opacity-90 active:translate-y-[0.5px]
                focus:outline-none focus:ring-2 focus:ring-white/40
                shadow-sm whitespace-nowrap shrink-0
              "
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <span className="text-[15px] leading-none">🤝</span>
                        <span>초대하기</span>
                      </span>
                    </button>

                    <button
                      onClick={() => setShowEditModal(true)}
                      className="
                px-3 py-1 rounded-full text-xs sm:text-sm
                bg-white/90 text-gray-700
                active:bg-white
                focus:outline-none focus:ring-2 focus:ring-white/50
                shadow-sm whitespace-nowrap shrink-0
              "
                    >
                      편집
                    </button>
                  </div>
                ) : (
                  <span className="shrink-0 text-[11px] sm:text-xs px-2 py-1 rounded-full bg-white/90 text-red-600 shadow">
                    읽기 전용
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 공개 보기 뱃지 */}
          {isPublicView && (
            <div className="mt-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                공개 일정 (읽기 전용)
              </span>
            </div>
          )}
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

        {/* === Day 버튼 (초대 버튼은 히어로로 이동했음) === */}
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

        {/* === 지도 (모든 핀 준비될 때까지 로딩) === */}
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
              canEdit={canEdit}
            />
          ) : (
            <div className="rounded-xl border bg-gray-50 text-gray-500 text-sm p-6 text-center">
              표시할 일정이 없습니다.
            </div>
          )}
        </div>

        {/* 편집 모달 */}
        {showEditModal && canEdit && (
          <EditModal onClose={() => setShowEditModal(false)} />
        )}
      </div>
    </DefaultLayout>
  );
};

export default ScheduleViewPage;
