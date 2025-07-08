import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarPlus } from 'lucide-react';

const CreateScheduleCard = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/plan/location');
  };

  return (
    <div
      onClick={handleClick}
      className="m-3 p-4 mb-6 rounded-xl bg-[#DDF1FB] border border-blue-100 hover:shadow-md transition cursor-pointer flex items-center gap-4"
    >
      <div className="w-10 h-10 rounded-full bg-white border border-blue-300 flex items-center justify-center text-xl font-bold shadow-sm">
        <CalendarPlus />
      </div>

      <div>
        <p className="font-jalnongothic text-base  text-blue-500">
          여행 일정 만들기
        </p>
        <p className="-mt-3 font-noonnu text-xs text-gray-500 ">
          친구와 여행 계획부터 경비까지 함께 해보세요!
        </p>
      </div>
    </div>
  );
};

export default CreateScheduleCard;
