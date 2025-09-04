import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ChevronLeft } from 'lucide-react';

const HomeHeader = ({
  title = '',
  showRightButton = false,
  rightButtonText = '',
  onRightButtonClick = () => {},
  onHomeClick, // 필요시 커스텀 핸들러
}) => {
  const navigate = useNavigate();
  const goHome = () => (onHomeClick ? onHomeClick() : navigate('/'));

  return (
    <header className="flex items-center justify-center px-4 py-3 relative mb-6 mt-6">
      <button
        onClick={goHome}
        aria-label="홈으로 가기"
        className="absolute left-5 top-3 inline-flex items-center gap-1 text-black"
      >
        <ChevronLeft className="w-4 h-4" />
        <Home className="w-5 h-5" />
      </button>

      <h1 className="font-noonnu text-2xl absolute left-1/2 -translate-x-1/2 font-extrabold">
        {title}
      </h1>

      <div className="w-5 h-5">
        {showRightButton && (
          <button
            onClick={onRightButtonClick}
            className="absolute right-4 text-sm text-blue-500"
          >
            {rightButtonText}
          </button>
        )}
      </div>
    </header>
  );
};

export default HomeHeader;
