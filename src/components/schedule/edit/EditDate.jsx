import React, { useState } from 'react';
import { Input, Select, message } from 'antd';
import { DateRange } from 'react-date-range';
import { ko } from 'date-fns/locale';
import { addDays, format } from 'date-fns';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

const EditDate = ({
  currentDates,
  currentPlace,
  currentTime,
  onClose,
  onSave,
}) => {
  const [dateRange, setDateRange] = useState([
    {
      startDate: currentDates?.[0] || new Date(),
      endDate: currentDates?.[1] || addDays(new Date(), 3),
      key: 'selection',
    },
  ]);

  const [departurePlace, setDeparturePlace] = useState(currentPlace || '');
  const [ampm, setAmpm] = useState(currentTime?.ampm || 'AM');
  const [hour, setHour] = useState(currentTime?.hour || '');
  const [minute, setMinute] = useState(currentTime?.minute || '');

  const handleSave = () => {
    const start = dateRange[0].startDate;
    const end = dateRange[0].endDate;
    if (!start || !end) return message.warning('날짜를 선택해주세요');
    if (!departurePlace) return message.warning('출발지를 입력해주세요');
    if (!hour || !minute) return message.warning('출발 시간을 선택해주세요');

    let h = parseInt(hour, 10);
    if (ampm === 'PM' && h !== 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;

    onSave({
      start: format(start, 'yyyy-MM-dd'),
      end: format(end, 'yyyy-MM-dd'),
      departurePlace,
      departureTime: `${String(h).padStart(2, '0')}:${minute}`,
    });

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/30"
      onClick={onClose}
    >
      <div
        className="bg-white w-full mx-auto rounded-t-xl px-4 sm:px-6 md:px-8 pt-6 pb-3 overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-sm text-gray-500 mb-4 mt-2">여행 날짜 수정</p>

        <div className="bg-gray-50 p-3 rounded-lg">
          <DateRange
            editableDateInputs={true}
            onChange={(item) => setDateRange([item.selection])}
            moveRangeOnFirstSelection={false}
            ranges={dateRange}
            locale={ko}
            className="text-xs"
            rangeColors={['#2563eb']}
          />
        </div>

        <Input
          placeholder="출발 장소를 입력하세요 (예: 서울역)"
          value={departurePlace}
          onChange={(e) => setDeparturePlace(e.target.value)}
          className="mt-4"
        />

        <div className="flex gap-2 mt-3">
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

        <div className="border-t mt-6 flex justify-between text-sm text-gray-500">
          <button
            onClick={onClose}
            className="w-1/2 py-3 border-r hover:bg-gray-50"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="w-1/2 py-3 text-blue-500 hover:bg-blue-50"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditDate;
