import React from 'react';

const ImageSlider = ({ images }) => {
  if (!images || images.length === 0) return null;

  // 1장일 경우
  if (images.length === 1) {
    return (
      <div className="w-full h-64 rounded-lg overflow-hidden">
        <img
          src={images[0]}
          alt="여행 사진"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // 2장일 경우
  if (images.length === 2) {
    return (
      <div className="flex gap-1 h-64 rounded-lg overflow-hidden">
        <div className="flex-1">
          <img
            src={images[0]}
            alt="여행 사진 1"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1">
          <img
            src={images[1]}
            alt="여행 사진 2"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    );
  }

  // 3장일 경우
  if (images.length >= 3) {
    return (
      <div className="flex gap-1 h-64 rounded-lg overflow-hidden">
        {/* 왼쪽 큰 이미지 */}
        <div className="flex-1">
          <img
            src={images[0]}
            alt="여행 사진 1"
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* 오른쪽 작은 이미지 2개 */}
        <div className="flex-1 flex flex-col gap-1">
          <div className="flex-1">
            <img
              src={images[1]}
              alt="여행 사진 2"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <img
              src={images[2]}
              alt="여행 사진 3"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ImageSlider;