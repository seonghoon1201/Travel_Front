import React from 'react';

const CreateScheduleCard = ({ onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white m-4 p-4 rounded-lg shadow-sm flex items-center gap-3 border border-gray-200 cursor-pointer"
    >
      <div className="text-blue-400 text-xl font-bold">＋</div>
      <div>
        <p className="font-medium">여행 일정 만들기</p>
        <p className="text-xs text-gray-400">새로운 여행을 만들어보세요</p>
      </div>
    </div>
  );
};

export default CreateScheduleCard;
