import React from 'react';
import { useNavigate } from 'react-router-dom';

const DEFAULT_IMAGE = '/images/default_place.jpg';

const RegionList = ({
  imageUrl,
  city,
  summary,
  locations = [],
  ldongRegnCd = '',
  ldongSignguCd = '',
  onClick,
}) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (onClick) {
      onClick();
      return;
    }
    navigate(`/region/detail/${encodeURIComponent(city)}`, {
      state: {
        ldongRegnCd,
        ldongSignguCd,
        from: 'search',
      },
    });
  };

  const truncateText = (text = '', maxLength = 30) =>
    text.length > maxLength ? text.slice(0, maxLength) + '...' : text;

  return (
    <div
      className="flex bg-white rounded-xl shadow px-4 py-4 gap-4 items-center cursor-pointer hover:bg-gray-50"
      onClick={handleCardClick}
    >
      <div className="w-24 h-24 flex-shrink-0">
        <img
          src={imageUrl || DEFAULT_IMAGE}
          alt={`${city} 이미지`}
          className="w-full h-full object-cover rounded-md"
          onError={(e) => {
            e.currentTarget.src = DEFAULT_IMAGE;
          }}
        />
      </div>

      <div className="flex flex-col justify-between flex-1 min-w-0">
        <p className="text-base font-semibold text-gray-900 truncate">{city}</p>
        <p className="text-sm text-gray-500">{truncateText(summary, 30)}</p>
        {locations.length > 0 && (
          <div className="flex gap-2 mt-2 flex-wrap">
            {locations.slice(0, 5).map((place, idx) => (
              <span
                key={idx}
                className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded"
              >
                {place}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RegionList;
