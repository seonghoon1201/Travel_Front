import React, { useRef, useState } from 'react';
import { Carousel } from 'antd';

export default function ImageSlider({ images = [] }) {
  const list = Array.isArray(images)
    ? images.filter((u) => typeof u === 'string' && u.trim() !== '')
    : [];

  const [index, setIndex] = useState(0);
  const carouselRef = useRef(null);

  if (list.length === 0) return null;

  const onErr = (e) => { e.currentTarget.src = '/image_placeholder.png'; };
  const goPrev = () => carouselRef.current?.prev();
  const goNext = () => carouselRef.current?.next();

  const Arrow = ({ type, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      className="absolute top-1/2 -translate-y-1/2 z-30 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center pointer-events-auto"
      aria-label={type === 'prev' ? '이전' : '다음'}
      style={type === 'prev' ? { left: 8 } : { right: 8 }}
    >
      {type === 'prev' ? '‹' : '›'}
    </button>
  );

  const showControls = list.length > 1;

  return (
    <div className="relative w-full h-[220px] rounded-md overflow-hidden">
      <Carousel
        ref={carouselRef}
        dots={showControls}
        draggable={showControls}
        swipeToSlide={showControls}
        afterChange={(i) => setIndex(i)}
      >
        {list.map((src, idx) => (
          <div key={idx} className="w-full h-[220px]">
            <img
              src={src}
              alt=""
              onError={onErr}
              className="w-full h-[220px] object-cover block"
            />
          </div>
        ))}
      </Carousel>

      {showControls && (
        <>
          <Arrow type="prev" onClick={goPrev} />
          <Arrow type="next" onClick={goNext} />
        </>
      )}

      <div className="absolute right-2 bottom-2 px-2 py-0.5 text-xs bg-black/60 text-white rounded z-30">
        {index + 1}/{list.length}
      </div>
    </div>
  );
}
