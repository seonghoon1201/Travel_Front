// src/components/common/ImageCarousel.jsx
import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ImageCarousel = ({ images = [], altPrefix = '업로드 이미지', className = '' }) => {
  const [idx, setIdx] = useState(0);
  const touchStartX = useRef(null);

  if (!images || images.length === 0) return null;

  const go = (next) => {
    if (images.length <= 1) return;
    setIdx((prev) => (prev + next + images.length) % images.length);
  };

  const onKeyDown = (e) => {
    if (images.length <= 1) return;
    if (e.key === 'ArrowRight') go(1);
    if (e.key === 'ArrowLeft') go(-1);
  };

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 40) go(diff < 0 ? 1 : -1);
    touchStartX.current = null;
  };

  return (
    <div
      className={`relative w-full overflow-hidden  rounded-lg ${className}`}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      style={{ touchAction: 'pan-y' }} 
      aria-roledescription="carousel"
      aria-label="이미지 캐러셀"
    >
      {/* 이미지 컨테이너  */}
      <div className="w-full h-80 flex items-center justify-center">
        <img
          src={images[idx]}
          alt={`${altPrefix} ${idx + 1}`}
          className="max-w-full max-h-full object-contain"
          draggable={false}
          style={{ userSelect: 'none' }}
        />
      </div>

      {/* 좌/우 */}
      {images.length > 1 && (
        <>
          <button
            type="button"
            aria-label="이전 이미지"
            onClick={() => go(-1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all z-10"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            aria-label="다음 이미지"
            onClick={() => go(1)}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all z-10"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
            {images.map((_, i) => (
              <button
                key={i}
                aria-label={`${i + 1}번째로 이동`}
                onClick={() => setIdx(i)}
                className={`h-2.5 w-2.5 rounded-full transition-all ${
                i === idx ? 'bg-sky-500 shadow-md' : 'bg-sky-200 hover:bg-sky-400'                }`}
              />
            ))}
          </div>

          {/* 현재 이미지 번호 표시 */}
          <div className="absolute top-4 right-4 bg-black/50 text-white text-sm px-2 py-1 rounded z-10">
            {idx + 1} / {images.length}
          </div>
        </>
      )}
    </div>
  );
};

export default ImageCarousel;