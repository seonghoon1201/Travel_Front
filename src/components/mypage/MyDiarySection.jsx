import React from 'react';
import TravelDiary from '../../components/traveldiary/TravelDiary';

const MyDiarySection = () => {
  //더미값 지우면 문구만 보여지게
  const diaryList = [
    {
      title: '6월의 제주',
      nickname: '재균짱123',
      period: '3박 4일',
      tags: ['제주', '6월', '여박여행'],
      imageUrl: '', // 이미지가 없을 경우 빈 문자열
    },
  ];

  return (
    <div className="p-4">
      {diaryList.length === 0 ? (
        <p className="text-center text-gray-400 mt-8">
          작성된 여행일기가 없습니다.
        </p>
      ) : (
        diaryList.map((diary, idx) => (
          <TravelDiary
            key={idx}
            title={diary.title}
            nickname={diary.nickname}
            period={diary.period}
            tags={diary.tags}
            imageUrl={diary.imageUrl}
          />
        ))
      )}
    </div>
  );
};

export default MyDiarySection;
