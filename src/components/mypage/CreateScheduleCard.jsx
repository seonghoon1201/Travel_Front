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
      className=" p-4 mb-6 rounded-xl bg-[#DDF1FB] border border-blue-100 hover:shadow-md transition cursor-pointer flex items-center gap-4"
    >
      <div className="w-10 aspect-square rounded-full bg-white border border-blue-300 flex items-center justify-center text-xl font-bold shadow-sm">
        <CalendarPlus />
      </div>

      <div>
        <p className="font-jalnongothic text-base  text-blue-500">
          여행 일정 만들기
        </p>
        <p className="-mt-3 font-noonnu text-xs text-gray-500 ">
          복잡한 계획은 이제 그만! 장바구니에 담기만 하면 자동으로 최적 동선을 추천받을 수 있어요.
        </p>
      </div>
    </div>
  );
};

export default CreateScheduleCard;
