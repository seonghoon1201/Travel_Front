// src/pages/Plan/PlanDatePage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { DatePicker, Input, Select, message } from 'antd';
import 'antd/dist/reset.css';
import DefaultLayout from '../../layouts/DefaultLayout';
import PrimaryButton from '../../components/common/PrimaryButton';
import BackHeader from '../../components/header/BackHeader';
import { useNavigate, useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import usePlanStore from '../../store/planStore';
import {
  Calendar as CalendarIcon,
  MapPin,
  Navigation,
  Clock,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';

const { RangePicker } = DatePicker;
const FALLBACK = '/assets/logo.jpg';

const PlanDatePage = () => {
  const location = useLocation();
  const {
    ldongRegnCd,
    ldongSignguCd,
    city,
    imageUrl: cityImageFromState,
  } = location.state || {};

  const [dates, setDates] = useState(null);

  // 오늘 00:00
  const todayStart = dayjs().startOf('day');

  // 패널 표시 월 (왼쪽/오른쪽)
  const [pickerValue, setPickerValue] = useState([
    dayjs().startOf('month'),
    dayjs().add(1, 'month').startOf('month'),
  ]);
  const [open, setOpen] = useState(false);

  const [departurePlace, setDeparturePlace] = useState('');
  const [hour, setHour] = useState('');
  const [minute, setMinute] = useState('');
  const [ampm, setAmpm] = useState('AM');

  const navigate = useNavigate();
  const setDatesInStore = usePlanStore((s) => s.setDates);
  const setDeparturePlaceInStore = usePlanStore((s) => s.setDeparturePlace);
  const setDepartureTimeInStore = usePlanStore((s) => s.setDepartureTime);
  const setLocationCodes = usePlanStore((s) => s.setLocationCodes);
  const setSelectedRegionMeta = usePlanStore((s) => s.setSelectedRegionMeta);
  const selectedRegionImage = usePlanStore((s) => s.selectedRegionImage);

  // hero 이미지: store값 > state값 > fallback
  const heroUrl = useMemo(
    () => selectedRegionImage || cityImageFromState || FALLBACK,
    [selectedRegionImage, cityImageFromState]
  );

  // state에서 받은 지역 정보 저장
  useEffect(() => {
    if (ldongRegnCd && ldongSignguCd) {
      setLocationCodes([{ ldongRegnCd, ldongSignguCd }]);
    }
    if (city) {
      setSelectedRegionMeta({
        name: city,
        imageUrl: cityImageFromState || selectedRegionImage || '',
      });
    }
  }, [
    ldongRegnCd,
    ldongSignguCd,
    city,
    cityImageFromState,
    selectedRegionImage,
    setLocationCodes,
    setSelectedRegionMeta,
  ]);

  const canGoPrevMonth = pickerValue?.[0]?.isAfter(todayStart, 'month');

  const handleReset = () => {
    setDates(null);
    setDeparturePlace('');
    setHour('');
    setMinute('');
    setAmpm('AM');
  };

  const handleNext = () => {
    if (!dates || dates.length !== 2)
      return message.warning('여행 시작일과 종료일을 모두 선택해 주세요.');

    const [start, end] = dates;

    if (start.isBefore(todayStart, 'day') || end.isBefore(todayStart, 'day')) {
      return message.warning('오늘 이전 날짜는 선택할 수 없습니다.');
    }
    if (end.isBefore(start, 'day'))
      return message.warning('종료일은 시작일 이후로 선택해 주세요.');
    if (!departurePlace.trim())
      return message.warning('출발 장소를 입력해 주세요.');
    if (!hour || !minute) return message.warning('출발 시각을 선택해 주세요.');

    let h = parseInt(hour, 10);
    if (ampm === 'PM' && h !== 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    const timeString = `${String(h).padStart(2, '0')}:${minute}`;

    setDatesInStore({
      start: dayjs(dates[0]).format('YYYY-MM-DD'),
      end: dayjs(dates[1]).format('YYYY-MM-DD'),
    });
    setDeparturePlaceInStore(departurePlace.trim());
    setDepartureTimeInStore(timeString);

    navigate('/plan/style');
  };

  const dateText =
    dates?.length === 2
      ? `${dayjs(dates[0]).format('YYYY.MM.DD')} ~ ${dayjs(dates[1]).format(
          'YYYY.MM.DD'
        )}`
      : '일정을 선택해 주세요';

  return (
    <DefaultLayout>
      <div className="w-full mx-auto pb-28">
        <BackHeader title="여행 기간 선택" />

        {/* ===== Hero with region image ===== */}
        <div className="px-4 sm:px-6 md:px-8">
          <div className="mt-2 rounded-2xl overflow-hidden border shadow-sm relative">
            <div
              className="h-40 sm:h-48 md:h-56 w-full"
              style={{
                backgroundImage: `url('${heroUrl}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
            <div className="absolute top-3 left-4 right-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-white" />
                <span className="text-white font-semibold text-xl sm:text-base">
                  {city || '여행지 미선택'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1 text-xs font-medium text-white/90 hover:text-white bg-black/30 hover:bg-black/40 px-2 py-1 rounded-full"
                title="초기화"
              >
                <RotateCcw className="w-4 h-4" />
                초기화
              </button>
            </div>
            <div className="absolute bottom-3 left-4 right-4 flex items-center gap-2 text-white/95 text-xs sm:text-sm">
              <CalendarIcon className="w-4 h-4" />
              <span>{dateText}</span>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 md:px-8 mt-5 space-y-5">
          {/* === 여행 기간 카드 === */}
          <div className="p-4 rounded-2xl border bg-white shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <CalendarIcon className="w-4 h-4 text-gray-600 mb-3.5" />
              <p className="text-sm font-semibold text-gray-800">여행 기간</p>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              오늘(포함) 이후 날짜만 선택할 수 있어요.
            </p>

            <RangePicker
              className="w-full rounded-lg"
              inputReadOnly
              allowClear
              format="YYYY-MM-DD"
              value={dates}
              onChange={setDates}
              disabledDate={(current) =>
                !!current && current.startOf('day').isBefore(todayStart)
              }
              classNames={{ popup: 'one-month-range' }}
              pickerValue={pickerValue}
              onPickerValueChange={(next) => {
                if (Array.isArray(next) && next[0]) setPickerValue(next);
              }}
              open={open}
              onOpenChange={(isOpen) => {
                setOpen(isOpen);
                if (isOpen) {
                  const now = dayjs();
                  setPickerValue([
                    now.startOf('month'),
                    now.add(1, 'month').startOf('month'),
                  ]);
                }
              }}
              panelRender={(panelNode) => (
                <div className="p-4 bg-white rounded-xl shadow-md border border-gray-200">
                  {/* 상단 헤더 */}
                  <div className="flex items-center justify-between mb-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (!canGoPrevMonth) return;
                        setPickerValue(([l, r]) => [
                          l.subtract(1, 'month'),
                          r.subtract(1, 'month'),
                        ]);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                        canGoPrevMonth
                          ? 'text-gray-700 hover:bg-gray-100'
                          : 'text-gray-300 cursor-not-allowed'
                      }`}
                      disabled={!canGoPrevMonth}
                    >
                      ← 이전달
                    </button>

                    <div className="text-base font-semibold text-gray-800">
                      {pickerValue?.[0]?.format?.('YYYY년 M월')}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setPickerValue(([l, r]) => [
                          l.add(1, 'month'),
                          r.add(1, 'month'),
                        ])
                      }
                      className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
                    >
                      다음달 →
                    </button>
                  </div>

                  {/* 달력 패널 */}
                  <div className="border-t pt-3">{panelNode}</div>
                </div>
              )}
              getPopupContainer={(trigger) => trigger.parentNode}
            />
          </div>

          {/* === 이동 정보 카드 === */}
          <div className="p-4 rounded-2xl border bg-white shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Navigation className="w-4 h-4 text-gray-600 mb-3" />
              <p className="text-sm font-semibold text-gray-800">이동 정보</p>
            </div>

            <div className="flex items-center gap-4">
              {/* 출발 */}
              <div className="flex items-center gap-2 flex-1">
                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                  출발
                </span>
                <Input
                  placeholder="예: 서울역"
                  value={departurePlace}
                  onChange={(e) => setDeparturePlace(e.target.value)}
                  className="flex-1"
                />
              </div>

              {/* 도착 */}
              <div className="flex items-center gap-2 flex-1">
                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                  도착
                </span>
                <div className="text-base font-semibold text-blue-600 truncate">
                  {city || '여행지 선택됨'}
                </div>
              </div>
            </div>

            <p className="mt-2 text-[11px] text-gray-400">
              정확한 출발지를 입력하면 추천 동선이 더 좋아져요.
            </p>
          </div>

          {/* ===== 출발 시간 카드 ===== */}
          <div className="p-4 rounded-2xl border bg-white shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-gray-600" />
              <div className="text-gray-800 text-sm font-semibold">
                출발 시간
              </div>
            </div>
            <div className="flex gap-2">
              <Select
                value={ampm}
                onChange={setAmpm}
                className="flex-1"
                options={[
                  { value: 'AM', label: '오전' },
                  { value: 'PM', label: '오후' },
                ]}
              />
              <Select
                value={hour}
                onChange={setHour}
                className="flex-1"
                placeholder="시"
                options={Array.from({ length: 12 }, (_, i) => ({
                  value: String(i + 1).padStart(2, '0'),
                  label: `${i + 1}시`,
                }))}
              />
              <Select
                value={minute}
                onChange={setMinute}
                className="flex-1"
                placeholder="분"
                options={['00', '10', '20', '30', '40', '50'].map((m) => ({
                  value: m,
                  label: `${m}분`,
                }))}
              />
            </div>
            <p className="mt-1 text-[11px] text-gray-400">
              예: 오전 9시 30분 → (오전 / 09 / 30)
            </p>
          </div>
        </div>
      </div>

      {/* 하단 고정 버튼 바 */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur border-t footer-safe">
        <div className="mx-auto w-full px-4 sm:px-6 md:px-8 py-3">
          <PrimaryButton onClick={handleNext} className="w-full">
            <span className="inline-flex items-center justify-center gap-2">
              {dates?.length === 2 ? (
                <>
                  <CalendarIcon className="w-4 h-4" />
                  {dateText}
                </>
              ) : (
                <>
                  <CalendarIcon className="w-4 h-4" />
                  일정을 선택해 주세요
                </>
              )}
            </span>
          </PrimaryButton>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default PlanDatePage;
