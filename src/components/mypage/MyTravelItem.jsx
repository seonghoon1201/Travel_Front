import React, { useState } from 'react';
import { Ellipsis, Trash2, CalendarSync } from 'lucide-react';

const MyTravelItem = ({
  title,
  dateRange,
  companionCount,
  imageUrl, //이건 여행 일정 중 첫번째 장소 사진 받아와야할듯!
  onEdit,
  onDelete,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div className="flex items-start pl-2 gap-2 py-2 relative">
      <img src={imageUrl} alt="trip" className="w-14 h-14 rounded-md" />
      <div className="flex-1">
        <p className="font-bold">{title} 여행</p>
        <p className="text-sm text-gray-500">
          {dateRange}, {companionCount}명과 함께
        </p>
      </div>

      <button className="text-lg" onClick={handleToggle}>
        <Ellipsis />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 flex gap-2 bg-white shadow-md rounded px-2 py-1 border z-10">
          <button onClick={onEdit}>
            <CalendarSync className="text-gray-600" />
          </button>
          <button onClick={onDelete}>
            <Trash2 className="text-red-500" />
          </button>
        </div>
      )}
    </div>
  );
};

export default MyTravelItem;
