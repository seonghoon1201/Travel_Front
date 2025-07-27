import React, { useEffect, useState } from 'react';
import useUserStore from '../../store/userStore';
import { fetchMyDiaries } from '../../api/user/userContentApi';
import TravelDiary from '../../components/traveldiary/TravelDiary';
import { useNavigate } from 'react-router-dom';
import { Pencil } from 'lucide-react';

const MyDiarySection = () => {
  const [diaries, setDiaries] = useState([]);
  const accessToken = useUserStore((state) => state.accessToken);
  const navigate = useNavigate();

  useEffect(() => {
    const loadDiaries = async () => {
      try {
        const data = await fetchMyDiaries(accessToken);
        setDiaries(data);
      } catch (error) {
        console.error('내 여행일기 불러오기 실패:', error);
      }
    };

    loadDiaries();
  }, [accessToken]);

  const handleWriteDiary = () => {
    navigate('/write/travel/diary');
  };

  return (
    <div className="bg-white px-4 pt-2 m-2 relative min-h-[200px]">
      <p className="text-sm font-semibold text-gray-600 mb-3 m-2">
        내 여행 일기
      </p>

      {diaries.length === 0 ? (
        <p className="text-gray-400 text-sm">작성한 여행일기가 없습니다.</p>
      ) : (
        <div className="space-y-4 mb-6">
          {' '}
          {/* 리스트 사이 간격 및 하단 여백 */}
          {diaries.map((diary) => (
            <TravelDiary
              key={diary.boardId}
              title={diary.title}
              userNickname={diary.userNickname}
              content={diary.content}
              createdAt={diary.createdAt}
              imageUrl={diary.imageUrl}
            />
          ))}
        </div>
      )}

      {/* 여행일기 쓰러가기 버튼 */}
      <button
        onClick={handleWriteDiary}
        className="fixed bottom-6 right-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-4 shadow-lg transition-colors"
      >
        <Pencil className="w-5 h-5" />
      </button>
    </div>
  );
};

export default MyDiarySection;
