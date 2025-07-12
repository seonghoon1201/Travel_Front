import React from 'react';
import { useNavigate } from 'react-router-dom';

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
  const handleClick = () => {
    navigate(`/place/detail/${contentId}`);
  };

  return (
    <div className="flex bg-white rounded-xl overflow-hidden shadow pt-6 pb-6 pr-3 pl-3 gap-5 mb-3" onClick={handleClick}>
      <div className="w-24 h-24 flex-shrink-0">
        <img
          src={imageUrl}
          alt={`${location} 이미지`}
          className="w-full h-full object-cover rounded-md"
        />
      </div>

      {/* 관광지 정보*/}
      <div className="flex flex-col justify-between flex-1">
        <p className="font-semibold">{destination}</p>
        <p className="text-xs text-gray-500">이용문의 : {tel}</p>
        <p className="text-xs text-gray-500">
          이용 시간 : {opentime} ~ {closetime}
        </p>
        <div>
          <span className="text-xs text-gray-500">
            {location} | {category}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PlaceList;
