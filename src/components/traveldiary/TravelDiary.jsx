import React from 'react';

const TravelDiary = ({ title, nickname, period, tags = [], imageUrl, variant = "default" }) => {
  //UI compact 모드일 경우 작은 카드 스타일로 렌더링
  const isCompact = variant === "compact"; 
  
  return (
    <div
      className={`bg-white rounded-xl overflow-hidden shadow-md ${
        isCompact ? 'w-[160px] min-w-[160px]' : 'w-full max-w-md'
      }`}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={title}
          className={`${isCompact ? 'h-[120px]' : 'h-40'} w-full object-cover`}
        />
      ) : (
        <div
          className={`${isCompact ? 'h-[120px]' : 'h-40'} bg-gray-300 w-full`}
        />
      )}

      <div className="p-2">
        <h2 className={`text-sm font-semibold ${isCompact ? 'truncate' : ''}`}>
          {title}
        </h2>
        {!isCompact && (
          <>
            <p className="text-sm text-gray-600">
              {nickname}의 일정 · {period}
            </p>
            <div className="mt-2 text-xs text-gray-400 space-x-1">
              {tags.map((tag, index) => (
                <span key={index}>#{tag}</span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
export default TravelDiary;