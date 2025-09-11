import React, { useState, useEffect } from 'react';
import { DatePicker, Input, Select, message } from 'antd';
import 'antd/dist/reset.css';
import DefaultLayout from '../../layouts/DefaultLayout';
import PrimaryButton from '../../components/common/PrimaryButton';
import BackHeader from '../../components/header/BackHeader';
import { useNavigate, useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import usePlanStore from '../../store/planStore';

const { RangePicker } = DatePicker;

const PlanDatePage = () => {
  const location = useLocation();
  const { ldongRegnCd, ldongSignguCd, city } = location.state || {};

  const [dates, setDates] = useState(null);

  // 오늘 00:00 기준 (이전 날짜 비활성화에 사용)
  const todayStart = dayjs().startOf('day');

  // 패널 표시 월 (왼쪽/오른쪽)
  const [pickerValue, setPickerValue] = useState([
    dayjs().startOf('month'),
    dayjs().add(1, 'month').startOf('month'),
  ]);
  // 열림 상태 관리: 열릴 때마다 현재 달로 리셋
  const [open, setOpen] = useState(false);

  const [departurePlace, setDeparturePlace] = useState('');
  const [hour, setHour] = useState('');
  const [minute, setMinute] = useState('');
  const [ampm, setAmpm] = useState('AM');

  const navigate = useNavigate();
  const setDatesInStore = usePlanStore((state) => state.setDates);
  const setDeparturePlaceInStore = usePlanStore(
    (state) => state.setDeparturePlace
  );
  const setDepartureTimeInStore = usePlanStore(
    (state) => state.setDepartureTime
  );
  const setLocationCodes = usePlanStore((state) => state.setLocationCodes);
  const setSelectedRegionMeta = usePlanStore(
    (state) => state.setSelectedRegionMeta
  );

  //  state에서 받은 지역 정보 planStore에 저장
  useEffect(() => {
    if (ldongRegnCd && ldongSignguCd) {
      setLocationCodes([{ ldongRegnCd, ldongSignguCd }]);
    }
    if (city) {
      setSelectedRegionMeta({ name: city, imageUrl: '' });
    }
  }, [ldongRegnCd, ldongSignguCd, city, setLocationCodes, setSelectedRegionMeta]);

  // 왼쪽 패널이 현재 달보다 이전으로 넘어가지 않도록
  const canGoPrevMonth = pickerValue?.[0]?.isAfter(todayStart, 'month');

  const handleNext = () => {
    if (!dates || dates.length !== 2)
      return message.warning('여행 시작일과 종료일을 모두 선택해 주세요.');

    const [start, end] = dates;

    // 안전장치: 과거 날짜 막기
    if (start.isBefore(todayStart, 'day') || end.isBefore(todayStart, 'day')) {
      return message.warning('오늘 이전 날짜는 선택할 수 없습니다.');
    }

    if (end.isBefore(start, 'day'))
      return message.warning('종료일은 시작일 이후로 선택해 주세요.');
    if (!departurePlace) return message.warning('출발 장소를 입력해 주세요.');
    if (!hour || !minute) return message.warning('출발 시각을 선택해 주세요.');

    let h = parseInt(hour, 10);
    if (ampm === 'PM' && h !== 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    const timeString = `${String(h).padStart(2, '0')}:${minute}`;

    // store에 날짜, 장소, 출발시간 저장
    setDatesInStore({
      start: dayjs(dates[0]).format('YYYY-MM-DD'),
      end: dayjs(dates[1]).format('YYYY-MM-DD'),
    });
    setDeparturePlaceInStore(departurePlace);
    setDepartureTimeInStore(timeString);

    navigate('/plan/style');
  };

   return (
    <DefaultLayout>
      <div className="w-full mx-auto pb-28">
        <BackHeader title="여행 기간 선택" />
        <div className="px-4 sm:px-6 md:px-8 ">
          <RangePicker
            className="w-full rounded-lg border-gray-300 shadow-sm"
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


           {/* 출발/도착 */}
          <div className="grid grid-cols-2 gap-3 mb-4 mt-4 ">
            <div className="p-4 rounded-xl border bg-white shadow-sm">
              <div className="text-gray-600 text-sm font-medium mb-1">출발</div>
              <Input
                placeholder="예: 서울역"
                value={departurePlace}
                onChange={(e) => setDeparturePlace(e.target.value)}
                className=" text-gray-800"
              />
            </div>
            <div className="p-4 rounded-xl border bg-white shadow-sm">
              <div className="text-gray-600 text-sm font-medium mb-1">도착</div>
              <div className="text-base font-semibold text-blue-500">
                {city || '여행지 선택됨'}
              </div>
            </div>
          </div>

          {/* 출발 시간 */}
          <div className="p-4 rounded-xl border bg-white shadow-sm">
            <div className="text-gray-600 text-sm font-medium mb-2">출발 시간</div>
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
          </div>
        </div>
      </div>

      {/* 하단 고정 버튼 바 */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur border-t">
        <div className="mx-auto w-full px-4 sm:px-6 md:px-8 py-3">
          <PrimaryButton onClick={handleNext} className="w-full">
            {dates?.length === 2
              ? `${dayjs(dates[0]).format('YYYY.MM.DD')} ~ ${dayjs(
                  dates[1]
                ).format('YYYY.MM.DD')}`
              : '일정을 선택해 주세요'}
          </PrimaryButton>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default PlanDatePage;