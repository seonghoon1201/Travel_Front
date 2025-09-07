import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PencilLine } from 'lucide-react';

import HomeHeader from '../../components/header/HomeHeader';
import SearchBar from '../../components/common/SearchBar';
import TravelDiary from '../../components/traveldiary/TravelDiary';
import DefaultLayout from '../../layouts/DefaultLayout';
import { getDiary } from '../../api';

import useUserStore from '../../store/userStore';
import { fetchMyTravel } from '../../api/user/userContentApi';
import ScheduleSelectModal from '../../components/modal/ScheduleSelectModal';

const TravelDiaryBoardPage = () => {
  const navigate = useNavigate();
  const accessToken = useUserStore((s) => s.accessToken);

  const [searchTerm, setSearchTerm] = useState('');
  const [diaries, setDiaries] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectOpen, setSelectOpen] = useState(false);
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    const fetchDiaries = async () => {
      const res = await getDiary(0, 20);
      if (res.success) {
        const formatted = res.data.map((item) => {
          let imageUrl = '';
          if (Array.isArray(item.imageUrls) && item.imageUrls.length > 0) {
            imageUrl = item.imageUrls[0];
          } else if (typeof item.imageUrl === 'string' && item.imageUrl.trim() !== '') {
            imageUrl = item.imageUrl.trim();
          }

          return {
            id: item.boardId,
            title: item.title,
            userNickname: item.userNickname,
            userProfileImage: item.userProfileImage,
            tags: item.tag ? item.tag.split(',') : [], 
            imageUrl,
          };
        });
        setDiaries(formatted);
      }
      setLoading(false);
    };
    fetchDiaries();
  }, []);

  const filteredDiaries = diaries.filter((diary) =>
    diary.title.includes(searchTerm)
  );

   const openScheduleModal = async () => {
    try {
      const data = await fetchMyTravel(accessToken);
      setTrips(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('내 일정 불러오기 실패:', e);
      setTrips([]);
    }
    setSelectOpen(true);
  };

  const handleConfirmSchedule = (scheduleId) => {
    if (!scheduleId) return;
    navigate(`/write/travel/diary?scheduleId=${scheduleId}`);
  };

  return (
    <DefaultLayout>
      <div className="w-full mx-auto">
        <HomeHeader />

        {/* 검색창 */}
        <div className="w-full mb-4 sm:px-6 md:px-8">
          <SearchBar
            placeholder="일기 제목으로 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* 상단 제목 + 글쓰기 */}
        <div className="flex items-center justify-between  sm:px-6  md:px-8 pb-6">
          <div className="text-medium font-semibold">국내 실시간 여행일기</div>
          <button
            className="text-sm text-gray-500 flex items-center gap-1"
            onClick={openScheduleModal}
          >
            <PencilLine className="w-3 h-3" />
            여행 일기 쓰러가기
          </button>
        </div>

        {/* 여행일기 리스트 */}
        <div className="space-y-3 sm:px-6 md:px-8 pb-6 ">
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
                userNickname={diary.userNickname}
                userProfileImage={diary.userProfileImage}
                period={diary.period}
                tags={diary.tags}
                imageUrl={diary.imageUrl}
              />
            ))
          )}
        </div>
      </div>

        <ScheduleSelectModal
        open={selectOpen}
        onClose={() => setSelectOpen(false)}
        trips={trips}
        selectedId={null}
        onConfirm={handleConfirmSchedule}
      />

    </DefaultLayout>
  );
};

export default TravelDiaryBoardPage;