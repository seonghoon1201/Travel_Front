import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PencilLine, ChevronDown } from 'lucide-react';
import { message } from 'antd';

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
  const [sortType, setSortType] = useState('latest'); 
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const [selectOpen, setSelectOpen] = useState(false);
  const [trips, setTrips] = useState([]);

  const [messageApi, contextHolder] = message.useMessage();

  const sortOptions = [
    { value: 'latest', label: '최신순' },
    { value: 'popular', label: '인기순' }
  ];

  useEffect(() => {
    fetchDiaries();
  }, [sortType]);

  const fetchDiaries = async () => {
    setLoading(true);
    try {
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
            createdAt: item.createdAt,
            count: item.count || 0, 
            tags: item.tag ? item.tag.split(',') : [], 
            imageUrl,
          };
        });

        // 클라이언트 사이드에서 정렬 (서버에서 정렬 지원하지 않는 경우)
        const sorted = [...formatted].sort((a, b) => {
          if (sortType === 'latest') {
            return new Date(b.createdAt) - new Date(a.createdAt);
          } else if (sortType === 'popular') {
            return b.count - a.count; // 높은 count가 먼저
          }
          return 0;
        });

        setDiaries(sorted);
      }
    } catch (error) {
      console.error('일기 목록 불러오기 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDiaries = diaries.filter((diary) =>
    diary.title.includes(searchTerm)
  );

  const openScheduleModal = async () => {
    if (!accessToken) {
      messageApi.warning({
        content: (
          <>
            로그인 후 이용 가능합니다. <br />
            오른쪽 상단 메뉴를 눌러 회원가입 또는 로그인 해주세요!
          </>
        ),
        key: 'login-warning',
      });
      return; 
    }

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

  const handleSortChange = (value) => {
    setSortType(value);
    setShowSortDropdown(false);
  };

  return (
    <DefaultLayout>
      {contextHolder}
      <div className="w-full mx-auto">
        <HomeHeader />

        {/* 검색창 */}
        <div className="w-full mb-4 px-4 sm:px-6 md:px-8">
          <SearchBar
            placeholder="일기 제목으로 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* 제목 + 글쓰기 버튼 */}
        <div className="px-4 sm:px-6 md:px-8 flex items-center justify-between pb-1">
          <h2 className="text-lg font-semibold">국내 실시간 여행일기</h2>
          <button
            className="text-sm text-gray-500 flex items-center gap-1"
            onClick={openScheduleModal}
          >
            <PencilLine className="w-3 h-3" />
            여행 일기 쓰러가기
          </button>
        </div>

        {/* 정렬 드롭다운 + 안내 */}
        <div className="flex items-center gap-3 px-4 sm:px-6 md:px-8 pb-4">
          <div className="relative">
            <button
              className="flex items-center gap-1 text-sm text-gray-600 border border-gray-300 rounded-lg px-2.5 py-1 hover:bg-gray-50"
              onClick={() => setShowSortDropdown(!showSortDropdown)}
            >
              {sortOptions.find(option => option.value === sortType)?.label}
              <ChevronDown className="w-4 h-4" />
            </button>
            {showSortDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-24">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                      sortType === option.value ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                    }`}
                    onClick={() => handleSortChange(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <p className="text-xs text-gray-400">최신순/인기순으로 조회해요!</p>
        </div>




        {/* 여행일기 리스트 */}
        <div className="space-y-3 px-4 sm:px-6 md:px-8 pb-6">
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
                count = {diary.count}
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

      {/* 드롭다운 외부 클릭 시 닫기 */}
      {showSortDropdown && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setShowSortDropdown(false)}
        />
      )}
    </DefaultLayout>
  );
};

export default TravelDiaryBoardPage;