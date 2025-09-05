import React from 'react';

const BookmarkItem = ({
  destination,
  location,
  address,
  tel,
  imageUrl,
}) => {
  return (
    <div className="flex bg-white rounded-xl overflow-hidden shadow pt-6 pb-6 pr-3 pl-3 gap-5">
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
        <p
          className="text-xs text-gray-500 truncate"
          style={{ maxWidth: '100%' }}
          title={address}
        >
          주소 : {address}
        </p>
        <p className="text-xs text-gray-500">이용문의 : {tel}</p>
      </div>
    </div>
  );
};

export default BookmarkItem;
