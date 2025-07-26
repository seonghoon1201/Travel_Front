import React from 'react';
import profileDefault from '../../assets/profile_default.png';
import { useNavigate } from 'react-router-dom';

const TravelDiary = ({
  id,
  title,
  userProfileImage = '',
  userNickname,
  period,
  tags = [],
  imageUrl,
  variant = 'default',
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/board/travel/diary/${id}`);
  };

  //UI compact 모드일 경우 작은 카드 스타일로 렌더링
  const isCompact = variant === 'compact';

  return (
    <div
      onClick={handleClick}
      className={`bg-white rounded-xl overflow-hidden shadow-md ${
        isCompact ? 'w-[160px] min-w-[160px]' : 'w-full '
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

      <div className="p-4">
        <div className="flex items-center gap-2 mb-1">
          {/* 프로필 이미지 */}
          {!isCompact && (
            <img
              src={userProfileImage || profileDefault}
              alt="profile"
              className="w-12 h-12 rounded-full object-cover -mt-12"
            />
          )}
          <h2 className={` font-semibold ${isCompact ? 'truncate' : ''}`}>
            {title}
          </h2>
        </div>
        {!isCompact && (
          <>
            <p className="text-sm text-gray-600">
              {userNickname}의 일정 · {period}
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
