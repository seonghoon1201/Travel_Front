import React from 'react';
import { useNavigate } from 'react-router-dom';

import { CalendarDays } from 'lucide-react';
import BackHeader from '../../components/header/BackHeader';
import DefaultLayout from '../../layouts/DefaultLayout';

const WriteTravelDiary = () => {
  const navigate = useNavigate();
  return (
    <DefaultLayout>
      <BackHeader />

      <div className="p-4">
        <div className="bg-white rounded-xl shadow-md p-4 space-y-3">
          {/* 제목 */}
          <div>
            <h2 className="text-center text-lg font-bold">제목을 입력하세요</h2>
            <p className="text-center text-sm text-gray-400 mt-1">
              #코멘트를 작성하세요
            </p>
          </div>

          {/* 내용 입력 */}
          <textarea
            rows={5}
            placeholder="내용을 입력하세요."
            className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          />

          {/* 일정 보기 버튼 */}
          <div className="text-right">
            <button className="flex items-center gap-1 text-sm text-white bg-sky-300 px-3 py-1.5 rounded-full">
              <CalendarDays className="w-4 h-4" />
              일정 보기
            </button>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default WriteTravelDiary;
