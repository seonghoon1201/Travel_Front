import React, { useEffect, useState } from 'react';
import useUserStore from '../../store/userStore';
import { fetchMyDiaries } from '../../api/user/userContentApi';
import TravelDiary from '../../components/traveldiary/TravelDiary';
import { useNavigate } from 'react-router-dom';
import { Pencil } from 'lucide-react';

const firstImageOf = (item) => {
  if (Array.isArray(item.imageUrls) && item.imageUrls.length > 0) {
    return String(item.imageUrls[0]).trim();
  }
  if (typeof item.imageUrl === 'string' && item.imageUrl.trim() !== '') {
    return item.imageUrl.trim();
  }
  return '';
};

const MyDiarySection = () => {
  const [diaries, setDiaries] = useState([]);
  const accessToken = useUserStore((state) => state.accessToken);
  const navigate = useNavigate();

  useEffect(() => {
    const loadDiaries = async () => {
      try {
        const data = await fetchMyDiaries(accessToken);
        const myNickname = useUserStore.getState().nickname;

        const filtered = (Array.isArray(data) ? data : [])
          .filter((d) => d.userNickname === myNickname)
          .map((d) => ({
            boardId: d.boardId,
            title: d.title,
            userNickname: d.userNickname,
            userProfileImage: d.userProfileImage,
            content: d.content,
            createdAt: d.createdAt,
            imageUrl: firstImageOf(d), // 첫 번째 이미지만
          }));

        setDiaries(filtered);
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
      <p className="text-sm font-semibold text-gray-600 mb-3 m-2">내 여행 일기</p>

      {diaries.length === 0 ? (
        <p className="text-gray-400 text-sm">작성한 여행일기가 없습니다.</p>
      ) : (
        <div className="space-y-4 mb-6">
          {diaries.map((diary) => (
            <TravelDiary
              key={diary.boardId}
              id={diary.boardId}
              title={diary.title}
              userNickname={diary.userNickname}
              userProfileImage={diary.userProfileImage}
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
