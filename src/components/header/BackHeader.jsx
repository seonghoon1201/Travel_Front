import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const BackHeader = ({
  title = '',
  showRightButton = false,
  rightButtonText = '',
  onRightButtonClick = () => {},
}) => {
  const navigate = useNavigate();

  return (
    <header className="flex items-center justify-center px-4 py-3 relative mb-6 mt-6">
      <button onClick={() => navigate(-1)}>
        <ArrowLeft className="w-5 h-5 text-black absolute left-5 top-3" />
      </button>
      <h1 className="font-noonnu text-2xl absolute left-1/2 -translate-x-1/2 font-extrabold">
        {title}
      </h1>
      {/* 오른쪽 버튼 */}
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

export default BackHeader;
