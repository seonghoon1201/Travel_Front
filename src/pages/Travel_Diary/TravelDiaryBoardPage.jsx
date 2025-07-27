import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PencilLine } from 'lucide-react';

import BackHeader from '../../components/header/BackHeader';
import SearchBar from '../../components/common/SearchBar';
import TravelDiary from '../../components/traveldiary/TravelDiary';
import DefaultLayout from '../../layouts/DefaultLayout';
import { getDiary } from '../../api/board/getDiary';

const TravelDiaryBoardPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [diaries, setDiaries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDiaries = async () => {
      const res = await getDiary(0, 20);
      if (res.success) {
        const formatted = res.data.map((item) => ({
          id: item.boardId,
          title: item.title,
          nickname: item.userNickname,
          tags: item.tag ? item.tag.split(',') : [], // 문자열 → 배열 변환
          imageUrl: item.imageUrl || '',
        }));
        setDiaries(formatted);
      }
      setLoading(false);
    };
    fetchDiaries();
  }, []);

  // 검색 필터링
  const filteredDiaries = diaries.filter((diary) =>
    diary.title.includes(searchTerm)
  );

  return (
    <DefaultLayout>
      <div className="w-full max-w-sm mx-auto">
        <BackHeader />

        {/* 검색창 */}
        <div className="w-full mb-4 px-4">
          <SearchBar
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* 상단 제목 + 글쓰기 */}
        <div className="flex items-center justify-between px-6">
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
        <div className="space-y-4 px-6 pb-8">
          {loading ? (
            <p className="text-gray-400 text-sm">로딩 중...</p>
          ) : filteredDiaries.length === 0 ? (
            <p className="text-gray-400 text-sm">여행일기가 없습니다.</p>
          ) : (
            filteredDiaries.map((diary) => (
              <TravelDiary
                key={diary.id}
                id={diary.id}
                title={diary.title}
                nickname={diary.nickname}
                period={diary.period}
                tags={diary.tags}
                imageUrl={diary.imageUrl}
              />
            ))
          )}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default TravelDiaryBoardPage;
