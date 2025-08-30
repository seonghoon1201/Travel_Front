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
    // 스와이프 민감도(px)
    if (Math.abs(diff) > 40) go(diff < 0 ? 1 : -1);
    touchStartX.current = null;
  };

  return (
    <div
      className={`relative select-none ${className}`}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      aria-roledescription="carousel"
      aria-label="이미지 캐러셀"
    >
      {/* 이미지 한 장만 보여주되, 인덱스만 바꿔서 동일 사이즈 유지 */}
      <img
        src={images[idx]}
        alt={`${altPrefix} ${idx + 1}`}
        className="rounded-lg w-full max-h-80 object-cover"
        draggable={false}
      />

      {/* 좌/우 화살표 — 다중일 때만 노출 */}
      {images.length > 1 && (
        <>
          <button
            type="button"
            aria-label="이전 이미지"
            onClick={() => go(-1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            aria-label="다음 이미지"
            onClick={() => go(1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* 인디케이터 점 */}
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                aria-label={`${i + 1}번째로 이동`}
                onClick={() => setIdx(i)}
                className={`h-2 w-2 rounded-full ${i === idx ? 'bg-white' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ImageCarousel;
