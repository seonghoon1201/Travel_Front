import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const DEFAULT_PLACE_IMG = '/images/default_place.jpg';

const PlaceList = ({
  contentId,
  destination,
  category,
  location,
  opentime,
  closetime,
  tel,
  imageUrl,
}) => {
  const navigate = useNavigate();

  const safeContentId = contentId ?? '';
  const safeTitle = (destination && String(destination).trim()) || '이름 미상';
  const safeLocation = (location && String(location).trim()) || '지역 정보 없음';
  const safeCategory = (category && String(category).trim()) || '기타';
  const safeOpen = (opentime && String(opentime).trim()) || '-';
  const safeClose = (closetime && String(closetime).trim()) || '-';
  const safeTel = (tel && String(tel).trim()) || '-';
  const safeImg = (imageUrl && String(imageUrl).trim()) || DEFAULT_PLACE_IMG;

  const handleClick = useCallback(() => {
    if (!safeContentId) return; 
    navigate(`/place/detail/${safeContentId}`);
  }, [navigate, safeContentId]);

  return (
    <div
      className="flex bg-white rounded-xl overflow-hidden shadow pt-6 pb-6 pr-3 pl-3 gap-5 mb-3 cursor-pointer"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleClick();
      }}
      aria-label={`${safeTitle} 상세보기`}
    >
      {/* 썸네일 */}
      <div className="w-24 h-24 flex-shrink-0">
        <img
          src={safeImg}
          alt={`${safeTitle} 이미지`}
          className="w-full h-full object-cover rounded-md"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = DEFAULT_PLACE_IMG;
          }}
        />
      </div>

      {/* 정보 영역 */}
      <div className="flex flex-col justify-between flex-1 min-w-0">
        <p className="font-semibold truncate">{safeTitle}</p>

        <p className="text-xs text-gray-500">
          이용문의 :{' '}
          {safeTel !== '-' ? (
            <a
              href={`tel:${safeTel.replaceAll(/[^0-9+]/g, '')}`}
              className="underline"
              onClick={(e) => e.stopPropagation()}
            >
              {safeTel}
            </a>
          ) : (
            '-'
          )}
        </p>

        <p className="text-xs text-gray-500">
          이용 시간 : {safeOpen} ~ {safeClose}
        </p>

        <div className="text-xs text-gray-500 truncate">
          {safeLocation} | {safeCategory}
        </div>
      </div>
    </div>
  );
};

export default React.memo(PlaceList);
