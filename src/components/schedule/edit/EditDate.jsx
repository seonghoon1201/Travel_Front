import React, { useState } from 'react';
import { DateRange } from 'react-date-range';
import { ko } from 'date-fns/locale';
import { addDays, format } from 'date-fns';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

const EditDate = ({ currentDates, onClose, onSave }) => {
  const [dateRange, setDateRange] = useState([
    {
      startDate: currentDates?.[0] || new Date(),
      endDate: currentDates?.[1] || addDays(new Date(), 2),
      key: 'selection',
    },
  ]);

  const handleSave = () => {
    const start = dateRange[0].startDate;
    const end = dateRange[0].endDate;
    onSave({
      startDate: format(start, 'yyyy-MM-dd'),
      endDate: format(end, 'yyyy-MM-dd'),
    });
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
            editableDateInputs
            onChange={(item) => setDateRange([item.selection])}
            moveRangeOnFirstSelection={false}
            ranges={dateRange}
            locale={ko}
            className="text-xs"
            rangeColors={['#2563eb']}
          />
        </div>

        <div className="border-t mt-6 flex justify-between text-sm text-gray-500 footer-safe">
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
