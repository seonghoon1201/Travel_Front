import React from 'react';
import { useNavigate } from 'react-router-dom';

const RegionList = ({ imageUrl, city, Province, summary, locations = [] }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/region/detail/${encodeURIComponent(city)}`);
  };
  
  const truncateText = (text, maxLength) => {
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  };

  return (
    <div className="flex bg-white rounded-xl shadow px-4 py-4 gap-4 items-center " onClick={handleClick}>
      {/* 왼쪽 이미지 */}
      <div className="w-24 h-24 flex-shrink-0">
        <img
          src={imageUrl}
          alt={`${city} 이미지`}
          className="w-full h-full object-cover rounded-md"
        />
      </div>

      {/* 오른쪽 콘텐츠 */}
      <div className="flex flex-col justify-between flex-1">
        {/* 시 · 도 표기 */}
        <p className="text-base font-semibold text-gray-900">
          {city} <span className="text-sm text-gray-500">· {Province}</span>
        </p>
        {/* 30자 후 ... 표시 */}
        <p className="text-sm text-gray-500">{truncateText(summary, 30)}</p>

        {/* 관광지 태그 */}
        <div className="flex gap-2 mt-2 flex-wrap">
          {/* 5개까지만 노출 */}
          {locations.slice(0, 5).map((place, idx) => (
            <span
              key={idx}
              className="text-xs bg-gray-200 text-gray-700 px-2 py-1"
            >
              {place}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RegionList;
