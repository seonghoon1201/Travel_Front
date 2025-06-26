// src/components/common/FavoriteButton.jsx
import React from 'react';
import { Heart, HeartOff } from 'lucide-react';

/**
 * 즐겨찾기 버튼 컴포넌트
 * @param {Object} props
 * @param {boolean} props.isActive - 즐겨찾기 여부
 * @param {Function} props.toggleFavorite - 즐겨찾기 토글 함수
 */
const FavoriteButton = ({ isActive, toggleFavorite }) => {
  return (
    <button
      onClick={toggleFavorite}
      className="absolute top-2 right-2 p-1 rounded-full bg-white/70 hover:bg-white"
    >
      {isActive ? (
        <Heart fill="red" color="red" size={18} />
      ) : (
        <HeartOff size={18} color="gray" />
      )}
    </button>
  );
};

export default FavoriteButton;
