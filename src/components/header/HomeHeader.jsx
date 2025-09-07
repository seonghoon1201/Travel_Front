// src/components/header/HomeHeader.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const HomeHeader = ({
  title = '',
  showRightButton = false,
  rightButtonText = '',
  onRightButtonClick = () => {},
}) => {
  const navigate = useNavigate();

  return (
    <header className="flex items-center px-4 sm:px-6 md:px-8 py-3 mb-6 mt-6">
      {/* 왼쪽: 홈으로 가기 버튼 */}
      <div className="flex-1 flex justify-start">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center justify-center w-10 h-10"
        >
          <ArrowLeft className="w-5 h-5 text-black" />
        </button>
      </div>

      {/* 가운데: 제목 */}
      <div className="flex-1 flex justify-center">
        <h1 className="font-noonnu text-2xl font-extrabold">
          {title}
        </h1>
      </div>

      {/* 오른쪽: 버튼 또는 빈 공간 */}
      <div className="flex-1 flex justify-end">
        {showRightButton && (
          <button
            onClick={onRightButtonClick}
            className="text-sm text-blue-500"
          >
            {rightButtonText}
          </button>
        )}
      </div>
    </header>
  );
};

export default HomeHeader;