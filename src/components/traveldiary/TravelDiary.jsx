import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';

const TravelDiary = ({
  id,
  boardId,
  title,
  userNickname,
  period,
  tags = [],
  imageUrl,
  variant = 'default',
  count = 0,
  hideCount = false, // 🔥 새로 추가된 props
}) => {
  const navigate = useNavigate();

  const diaryId = id ?? boardId ?? crypto.randomUUID();
  const handleClick = () => navigate(`/board/travel/diary/${diaryId}`);

  const isCompact = variant === 'compact';
  const coverH = isCompact ? 'h-[120px]' : 'h-40';

  return (
    <div
      onClick={handleClick}
      className={`bg-white rounded-xl overflow-hidden shadow-md cursor-pointer ${
        isCompact ? 'w-[160px] min-w-[160px]' : 'w-full'
      }`}
    >
      {/* 이미지 + 조회수 뱃지 */}
      <div className={`relative w-full ${coverH}`}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover block"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gray-300 flex items-center justify-center text-sm text-gray-500">
            No Image
          </div>
        )}

        {/* 🔥 조회수 표시 - hideCount가 false일 때만 표시 */}
        {!hideCount && (
          <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {count}
          </div>
        )}
      </div>

      {/* 본문 */}
      <div className={`p-4`}>
        <div className="flex items-center gap-2 mb-1">
          <h2 className={`font-semibold ${isCompact ? 'truncate' : ''}`}>
            {title}
          </h2>
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