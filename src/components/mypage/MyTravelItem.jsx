import React, { useState } from 'react';
import { Ellipsis, Trash2 } from 'lucide-react';

const MyTravelItem = ({
  scheduleId,
  title,
  dateRange,
  companionCount,
  imageUrl, 
  onClick, 
  onEdit,
  onDelete,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = (e) => {
    e.stopPropagation(); 
    setIsOpen((prev) => !prev);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    setIsOpen(false);
    onEdit?.(scheduleId);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setIsOpen(false);
    onDelete?.(scheduleId);
  };

  return (
    <div
      onClick={() => onClick?.(scheduleId)}  
      className="flex items-start pl-2 gap-2 py-2 relative cursor-pointer hover:bg-gray-50 rounded-md"
    >
      <img
        src={imageUrl}
        alt="trip"
        className="w-14 h-14 rounded-md object-cover flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="font-bold truncate">{title} 여행</p>
        <p className="text-sm text-gray-500 truncate">
          {dateRange},{' '}
          {companionCount <= 1
            ? '나 홀로 여행'
            : `${companionCount}명과 함께`}
        </p>
      </div>

      {/* 메뉴 버튼 */}
      <button
        className="text-lg p-1 rounded hover:bg-gray-100"
        onClick={handleToggle}
      >
        <Ellipsis />
      </button>

      {isOpen && (
        <div
          className="absolute right-2 top-10 flex gap-3 bg-white shadow-md rounded px-3 py-2 border z-10"
          onClick={(e) => e.stopPropagation()} 
        >
          <button
            onClick={handleDelete}
            className="p-1 hover:bg-gray-100 rounded"
            title="일정 삭제"
          >
            <Trash2 className="text-red-500 w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default MyTravelItem;
