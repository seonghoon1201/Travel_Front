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
const { Option } = Select;

const PlanDatePage = () => {
  const [dates, setDates] = useState([]);
  const [departurePlace, setDeparturePlace] = useState('');
  const [hour, setHour] = useState('');
  const [minute, setMinute] = useState('');
  const [ampm, setAmpm] = useState('AM');

  const navigate = useNavigate();
  const setDatesInStore = usePlanStore((state) => state.setDates);
  const setDeparturePlaceInStore = usePlanStore((state) => state.setDeparturePlace);
  const setDepartureTimeInStore = usePlanStore((state) => state.setDepartureTime);

  const handleNext = () => {
    if (!dates || dates.length !== 2 || !dates[0] || !dates[1]) {
      return message.warning('여행 시작일과 종료일을 모두 선택해 주세요.');
    }
    if (!departurePlace) {
      return message.warning('출발 장소를 입력해 주세요.');
    }
    if (!hour || !minute) {
      return message.warning('출발 시각을 선택해 주세요.');
    }

    // 시간 변환: AM/PM → 24시간
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
      <div className="w-full max-w-sm mx-auto">
        <BackHeader title="여행 기간 선택" />

        <RangePicker
          className="w-full"
          format="YYYY-MM-DD"
          onChange={(value) => setDates(value)}
          value={dates}
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

        <PrimaryButton onClick={handleNext} className="mt-6 w-full">
          {dates?.length === 2
            ? `${dayjs(dates[0]).format('YYYY.MM.DD')} ~ ${dayjs(dates[1]).format('YYYY.MM.DD')}`
            : '일정을 선택해 주세요'}
        </PrimaryButton>
      </div>
    </DefaultLayout>
  );
};

export default PlanDatePage;
