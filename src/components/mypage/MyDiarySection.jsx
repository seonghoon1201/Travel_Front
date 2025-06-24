import React from 'react';
import TravelDiary from '../../components/traveldiary/TravelDiary';

const MyDiarySection = () => {
  return (
    <div className="p-4">
      <TravelDiary
        title="6월의 제주"
        nickname="닉네임"
        period="3박 4일"
        tags={['제주', '6월', '여박여행']}
        imageUrl="https://example.com/jeju.jpg"
      />
    </div>
  );
};

export default MyDiarySection;
