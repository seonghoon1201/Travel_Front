import React from 'react';

const TravelDiary = ({
  title = '여행 제목',
  nickname = '닉네임',
  period = '3박 4일',
  tags = [],
  imageUrl = '',
}) => {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md w-full max-w-md">
      {imageUrl && (
        <img src={imageUrl} alt={title} className="w-full h-40 object-cover" />
      )}

      <div className="p-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-gray-600">
          {nickname}의 일정 · {period}
        </p>
        <div className="mt-2 text-sm text-gray-400 space-x-1">
          {tags.map((tag, index) => (
            <span key={index}>#{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TravelDiary;
