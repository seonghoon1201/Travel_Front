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
      className="flex items-start gap-2 py-2 relative cursor-pointer hover:bg-gray-50 rounded-md"
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="trip"
          className="w-16 h-16 rounded-md object-cover flex-shrink-0"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.style.display = 'none';
            e.currentTarget.insertAdjacentHTML(
              'afterend',
              `<div class="w-14 h-14 flex items-center justify-center bg-gray-200 text-[10px] text-gray-500 rounded-md">
                 No Image
               </div>`
            );
          }}
        />
      ) : (
        <div className="w-16 h-16 flex items-center justify-center bg-gray-200 text-[10px] text-gray-500 rounded-md">
          No Image
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="font-bold truncate">{title} </p>
        <p className="text-sm text-gray-500 truncate">
          {dateRange},{' '}
          {companionCount <= 1 ? '나 홀로 여행' : `${companionCount}명과 함께`}
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
