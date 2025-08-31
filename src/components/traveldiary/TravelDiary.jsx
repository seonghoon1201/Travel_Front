import React from 'react';
import profileDefault from '../../assets/profile_default.png';
import { useNavigate } from 'react-router-dom';

const TravelDiary = ({
  id,
  boardId,
  title,
  userProfileImage = '',
  userNickname,
  period,
  tags = [],
  imageUrl,
  variant = 'default',
  showAvatarInCompact = false,
}) => {
  const navigate = useNavigate();

  const diaryId = id ?? boardId ?? crypto.randomUUID();
  const handleClick = () => navigate(`/board/travel/diary/${diaryId}`);

  const isCompact = variant === 'compact';
  const coverH = isCompact ? 'h-[120px]' : 'h-40';

  const safeProfileSrc =
    userProfileImage && String(userProfileImage).trim().length > 0
      ? userProfileImage
      : profileDefault;

  return (
    <div
      onClick={handleClick}
      className={`bg-white rounded-xl overflow-hidden shadow-md cursor-pointer ${
        isCompact ? 'w-[160px] min-w-[160px]' : 'w-full'
      }`}
    >
      <div className={`relative w-full ${coverH}`}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover block"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gray-300" />
        )}

        {(!isCompact || showAvatarInCompact) && (
          <img
            src={safeProfileSrc}
            onError={(e) => {
              if (e.currentTarget.src !== profileDefault) {
                e.currentTarget.src = profileDefault;
              }
            }}
            alt="profile"
            className="absolute -bottom-6 left-4 z-10 w-12 h-12 rounded-full object-cover border-2 border-white shadow bg-gray-200"
            loading="lazy"
          />
        )}
      </div>

      <div className={`p-4 ${!isCompact || showAvatarInCompact ? 'pt-7' : ''}`}>
        <div className="flex items-center gap-2 mb-1">
          <h2 className={`font-semibold ${isCompact ? 'truncate' : ''}`}>{title}</h2>
        </div>

        {!isCompact && (
          <>
            <p className="text-sm text-gray-600">
              {userNickname}의 일정{period ? ` · ${period}` : ''}
            </p>
            {!!tags.length && (
              <div className="mt-2 text-xs text-gray-400 space-x-1">
                {tags.map((tag, idx) => (
                  <span key={idx}>#{tag}</span>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TravelDiary;
