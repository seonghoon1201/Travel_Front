import React, { useState } from 'react';
import { DatePicker, Input, Select, message } from 'antd';
import 'antd/dist/reset.css';
import DefaultLayout from '../../layouts/DefaultLayout';
import PrimaryButton from '../../components/common/PrimaryButton';
import BackHeader from '../../components/header/BackHeader';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import usePlanStore from '../../store/planStore';

const { RangePicker } = DatePicker;

const PlanDatePage = () => {
  const [dates, setDates] = useState(null);

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

  const handleNext = () => {
    if (!dates || dates.length !== 2)
      return message.warning('여행 시작일과 종료일을 모두 선택해 주세요.');
    const [start, end] = dates;
    if (end.isBefore(start, 'day'))
      return message.warning('종료일은 시작일 이후로 선택해 주세요.');
    if (!departurePlace) return message.warning('출발 장소를 입력해 주세요.');
    if (!hour || !minute) return message.warning('출발 시각을 선택해 주세요.');

    let h = parseInt(hour, 10);
    if (ampm === 'PM' && h !== 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    const timeString = `${String(h).padStart(2, '0')}:${minute}`;

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
      <div className="w-full max-w-sm mx-auto pb-28">
        <BackHeader title="여행 기간 선택" />
        <div className="px-4">
          <RangePicker
            className="w-full"
            format="YYYY-MM-DD"
            value={dates}
            onChange={setDates}
            /* antd v5: 팝업 클래스 */
            classNames={{ popup: 'one-month-range' }}
            /* 패널 표시 월 제어 (항상 왼쪽 패널 기준으로 본문/라벨 맞춤) */
            pickerValue={pickerValue}
            onPickerValueChange={(next) => {
              if (Array.isArray(next) && next[0]) setPickerValue(next);
            }}
            /* 열릴 때마다 현재 달로 강제 리셋 */
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
            /* 커스텀 헤더: 라벨은 '왼쪽 패널(=보이는 달)' 기준 */
            panelRender={(panelNode) => (
              <div>
                <div className="flex items-center justify-between px-3 py-2">
                  <button
                    type="button"
                    onClick={() =>
                      setPickerValue(([l, r]) => [
                        l.subtract(1, 'month'),
                        r.subtract(1, 'month'),
                      ])
                    }
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    ← 이전달
                  </button>

                  <div className="text-sm font-medium">
                    {pickerValue?.[0]?.format?.('YYYY MMM')}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setPickerValue(([l, r]) => [
                        l.add(1, 'month'),
                        r.add(1, 'month'),
                      ])
                    }
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    다음달 →
                  </button>
                </div>
                {panelNode}
              </div>
            )}
            /* 팝업 위치 안정화(선택) */
            getPopupContainer={(trigger) => trigger.parentNode}
          />

          <Input
            className="mt-4"
            placeholder="출발 장소를 입력하세요 (예: 서울역)"
            value={departurePlace}
            onChange={(e) => setDeparturePlace(e.target.value)}
          />

          <div className="mt-2 flex gap-2">
            <Select
              value={ampm}
              onChange={setAmpm}
              className="w-1/3"
              options={[
                { value: 'AM', label: '오전' },
                { value: 'PM', label: '오후' },
              ]}
            />
            <Select
              value={hour}
              onChange={setHour}
              className="w-1/3"
              placeholder="시"
              options={Array.from({ length: 12 }, (_, i) => ({
                value: String(i + 1).padStart(2, '0'),
                label: `${i + 1}시`,
              }))}
            />
            <Select
              value={minute}
              onChange={setMinute}
              className="w-1/3"
              placeholder="분"
              options={['00', '10', '20', '30', '40', '50'].map((m) => ({
                value: m,
                label: `${m}분`,
              }))}
            />
          </div>
        </div>
      </div>

      {/* 하단 고정 버튼 바 */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur border-t">
        <div className="mx-auto max-w-sm px-4 py-3">
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
