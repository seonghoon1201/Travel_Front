// src/components/bookmark/BookmarkItem.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import FavoriteButton from '../common/FavoriteButton';

const BookmarkItem = ({
  contentId,
  destination,
  category,
  location,
  address,
  opentime,
  closetime,
  tel,
  imageUrl,
  isFavorite = false,
  toggleFavorite = () => {},
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/place/detail/${contentId}`);
  };

  return (
    <div
      onClick={handleClick}
      className="relative bg-white rounded-xl shadow overflow-hidden flex cursor-pointer hover:shadow-lg transition"
    >
      {/* 이미지 영역 */}
      <div className="relative w-24 h-24 flex-shrink-0">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={destination}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-[10px] text-gray-500">
            No Image
          </div>
        )}

        {/* 즐겨찾기 버튼 (버튼 클릭시 상세 이동 막음) */}
        <div
          onClick={(e) => e.stopPropagation()}
        >
          <FavoriteButton
            isActive={isFavorite}
            toggleFavorite={() => toggleFavorite(contentId)}
          />
        </div>
      </div>

      {/* 정보 영역 */}
      <div className="flex-1 p-3">
        <h3 className="text-sm font-bold text-gray-800">{destination}</h3>
        <p className="text-xs text-gray-500">{address}</p>
        {tel && <p className="text-xs text-gray-500">☎ {tel}</p>}
        {(opentime || closetime) && (
          <p className="text-xs text-gray-500">
            {opentime} ~ {closetime}
          </p>
        )}
      </div>
    </div>
  );
};

export default BookmarkItem;
