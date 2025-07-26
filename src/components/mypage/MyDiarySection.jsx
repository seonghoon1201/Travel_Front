import React, { useEffect, useState } from 'react';
import useUserStore from '../../store/userStore';
import { fetchMyDiaries } from '../../api/user/userContentApi';
import TravelDiary from '../../components/traveldiary/TravelDiary';

const MyDiarySection = () => {
  const [diaries, setDiaries] = useState([]);
  const accessToken = useUserStore((state) => state.accessToken);

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

  return (
    <div className="bg-white px-4 pt-2 m-2">
      <p className="text-sm font-semibold text-gray-600 mb-3 m-2">
        내 여행 일기
      </p>
      {diaries.length === 0 ? (
        <p className="text-gray-400 text-sm">작성한 여행일기가 없습니다.</p>
      ) : (
        diaries.map((diary) => (
          <TravelDiary
            key={diary.boardId}
            title={diary.title}
            content={diary.content}
            createdAt={diary.createdAt}
            imageUrl={diary.imageUrl}
          />
        ))
      )}
    </div>
  );
};

export default MyDiarySection;
