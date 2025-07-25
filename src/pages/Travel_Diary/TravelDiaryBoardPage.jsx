import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PencilLine } from 'lucide-react';

import BackHeader from '../../components/header/BackHeader';
import SearchBar from '../../components/common/SearchBar';
import TravelDiary from '../../components/traveldiary/TravelDiary';
import DefaultLayout from '../../layouts/DefaultLayout';

const TravelDiaryBoardPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // 예시 더미 데이터
  const diaries = [
    {
      id: 1,
      title: '6월의 제주',
      nickname: '닉네임',
      period: '3박 4일',
      tags: ['제주', '6월', '여박여행'],
      imageUrl: '',
    },
    {
      id: 2,
      title: '여름 바다 여행',
      nickname: '닉네임',
      period: '2박 3일',
      tags: ['여름', '바다', '힐링'],
      imageUrl: 'https://source.unsplash.com/featured/?beach',
    },
  ];

  // 검색 필터링
  const filteredDiaries = diaries.filter((diary) =>
    diary.title.includes(searchTerm)
  );

  return (
    <DefaultLayout>
      <div className="w-full max-w-sm mx-auto">
        <BackHeader />

        {/* 검색창 */}
        <div className="w-full mb-4 pr-[1rem] pl-[1rem] ">
          <SearchBar
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* 상단 제목 + 글쓰기 */}
        <div className="flex items-center justify-between pr-[1.4rem] pl-[1.4rem] ">
          <h3 className="text-lg font-semibold">국내 실시간 여행일기</h3>
          <button
            className="text-sm text-gray-500 flex items-center gap-1"
            onClick={() => navigate('/write/travel/diary')}
          >
            <PencilLine className="w-3 h-3" />
            여행 일기 쓰러가기
          </button>
        </div>

        {/* 여행일기 리스트 */}
        <div className="space-y-4 px-[1.4rem] pb-[2rem]">
          {filteredDiaries.map((diary) => (
            <TravelDiary
              key={diary.id}
              id={diary.id}
              title={diary.title}
              nickname={diary.nickname}
              period={diary.period}
              tags={diary.tags}
              imageUrl={diary.imageUrl}
            />
          ))}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default TravelDiaryBoardPage;
