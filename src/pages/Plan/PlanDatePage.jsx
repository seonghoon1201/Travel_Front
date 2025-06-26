import React, { useState } from 'react';
import { DatePicker } from 'antd';
import 'antd/dist/reset.css';
import DefaultLayout from '../../layouts/DefaultLayout';
import PrimaryButton from '../../components/common/PrimaryButton';
import BackHeader from '../../components/header/BackHeader';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import usePlanStore from '../../store/planStore';

const { RangePicker } = DatePicker;

const PlanDatePage = () => {
  const [dates, setDates] = useState([]);
  const navigate = useNavigate();

  const setDatesInStore = usePlanStore((state) => state.setDates);

  const handleDateChange = (value) => {
    setDates(value);
  };

    const handleNext = () => {
      if (!dates || dates.length !== 2 || !dates[0] || !dates[1]) {
        alert('여행 시작일과 종료일을 모두 선택해 주세요.');
        return;
      }

      setDatesInStore({
      start: dayjs(dates[0]).format('YYYY-MM-DD'),
      end: dayjs(dates[1]).format('YYYY-MM-DD'),
    });
    
      navigate('/plan/style');
    };

  return (
    <DefaultLayout>
      <div className="w-full max-w-sm mx-auto">
        <BackHeader
          title="여행 기간 선택"/>

        <RangePicker
          className="w-full"
          format="YYYY-MM-DD"
          onChange={handleDateChange}
          value={dates}
        />

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
