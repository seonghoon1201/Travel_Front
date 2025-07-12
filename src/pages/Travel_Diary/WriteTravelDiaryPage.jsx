import React, { useState } from 'react';
import { CalendarDays, X } from 'lucide-react';

import DefaultLayout from '../../layouts/DefaultLayout';
import BackHeader from '../../components/header/BackHeader';
import PrimaryButton from '../../components/common/PrimaryButton';

const WriteTravelDiary = () => {
  const [tags, setTags] = useState([]);
  const [inputValue, setInputValue] = useState('');

  const addTag = () => {
    const trimmed = inputValue.trim();
    
    // 10개로 제한하기
    if (tags.length >= 10) {
    alert('태그는 최대 10개까지만 추가할 수 있어요!');
    return;
    }
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setInputValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <DefaultLayout >
      <BackHeader />
    
    <div>
      <div className="bg-white rounded-xl shadow-md p-4 space-y-4">
        {/* 제목 입력*/}
        <div>
          <input
            type="text"
            placeholder="제목을 입력하세요"
            className="w-full border border-gray-200 rounded-lg p-2 text-center font-bold text-lg focus:outline-none"
          />
        </div>

        {/* 태그 입력 */}
         <div className="border border-gray-200 rounded-lg p-2 flex flex-wrap gap-2 items-start">
          {tags.map((tag) => (
            <span
              key={tag}
              className="bg-gray-100 px-2 py-1 rounded-full text-sm flex items-center gap-1"
            >
              #{tag}
              <button onClick={() => removeTag(tag)} className="text-gray-400 hover:text-red-400">
                <X size={12} />
              </button>
            </span>
          ))}
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value.replace('#', ''))}
            onKeyDown={handleKeyDown}
            placeholder="#태그를 입력하고 스페이스 또는 엔터"
            className="flex-grow text-sm focus:outline-none"
          />
        </div>

        {/* 내용 입력 */}
        <textarea
          rows={10}
          placeholder="내용을 입력하세요."
          className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
        />

        {/* 이미지 추가 + 일정보기 버튼 */}
        <div className="w-full flex justify-between">
          <button className="flex items-center gap-1 text-sm text-white bg-gray-300 px-3 py-1.5 rounded-full">
            이미지 추가
          </button>

          <button className="flex items-center gap-1 text-sm text-white bg-sky-300 px-3 py-1.5 rounded-full">
            <CalendarDays className="w-4 h-4" />
            일정 보기
          </button>
        </div>
      </div>

      <div className="text-center pt-10">아래에 일정 관련 UI 구현 </div>

      {/* 일정 만들기 버튼 */}
      <div className="w-full mt-6 px-4">
        <PrimaryButton className="w-full py-3 text-sm rounded-xl shadow">
          일정 만들기
        </PrimaryButton>
      </div>
    </div>


    </DefaultLayout>
  );
};

export default WriteTravelDiary;
