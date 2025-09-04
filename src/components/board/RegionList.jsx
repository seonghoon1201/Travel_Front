import React from 'react';
import { useNavigate } from 'react-router-dom';

const DEFAULT_IMAGE = '/images/default_place.jpg';

const RegionList = ({
  imageUrl,
  city,
  summary,
  locations = [],
  // ✅ 법정동 코드 추가
  ldongRegnCd = '',
  ldongSignguCd = '',
  // ✅ 필요 시 부모에서 클릭 핸들러 주입
  onClick,
}) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (onClick) {
      onClick();
      return;
    }
    // ✅ 상세로 이동하면서 법정동 코드 state로 전달
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
      {/* 왼쪽 이미지 */}
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

      {/* 오른쪽 콘텐츠 */}
      <div className="flex flex-col justify-between flex-1 min-w-0">
        {/* 시 표기 */}
        <p className="text-base font-semibold text-gray-900 truncate">{city}</p>

        {/* 30자 후 ... 표시 */}
        <p className="text-sm text-gray-500">{truncateText(summary, 30)}</p>

        {/* 관광지 태그 */}
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
