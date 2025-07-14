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
      <BackHeader />

      {/* 검색창 */}
      <div className="w-full mb-4">
        <SearchBar
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* 상단 제목 + 글쓰기 */}
      <div className="flex items-center justify-between px-4 py-2">
        <h2 className="text-lg font-semibold">국내 실시간 여행일기</h2>
        <button className="text-sm text-gray-500 flex items-center gap-1"
        onClick={() => navigate('/write/travel/diary')}>
          <PencilLine className="w-4 h-4" />
          여행 일기 쓰러가기
        </button>
      </div>

      {/* 여행일기 리스트 */}
      <div className="space-y-4 px-4 pb-6">
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
    </DefaultLayout>
  );
};

export default TravelDiaryBoardPage;
