import React, { useState } from 'react';
import DefaultLayout from '../../layouts/DefaultLayout';
import BackHeader from '../../components/header/BackHeader';
import PrimaryButton from '../../components/common/PrimaryButton';
import usePlanStore from '../../store/planStore';
import { useNavigate } from 'react-router-dom';

const PlanInvitePage = () => {
  const [friends, setFriends] = useState(['배균']);
  const { locationIds } = usePlanStore(); // 여행지 이름 표시용
  const navigate = useNavigate();

  const handleCopyLink = () => {
    navigator.clipboard.writeText('https://your-travel-app.com/invite-link');
    alert('초대 링크가 복사되었습니다!');
  };

  const handleKakaoInvite = () => {
    alert('카카오톡 초대 기능은 아직 구현되지 않았습니다.');
  };

  const handleNext = () => {
    navigate('/plan/budget');
  };

  return (
    <DefaultLayout>
      <div className="w-full max-w-sm mx-auto">
        <BackHeader title={`${locationIds[0] || '어딘가로'} 여행`} />

        <div className="mt-6">
          <p className="font-semibold text-md text-gray-900">여행 친구 {friends.length}</p>
          <p className="text-sm text-gray-500 mb-4">
            함께 여행을 갈 친구나 가족을 초대해보세요. <br />
            여행 일정을 함께 계획할 수 있습니다.
          </p>

          <div className="flex gap-2 mb-6">
            <button
              onClick={handleKakaoInvite}
              className="flex-1 bg-yellow-300 text-black font-medium py-2 rounded-xl text-sm"
            >
              🗨️ 카카오톡 초대
            </button>
            <button
              onClick={handleCopyLink}
              className="flex-1 bg-blue-100 text-blue-700 font-medium py-2 rounded-xl text-sm"
            >
              🔗 초대 링크 복사
            </button>
          </div>

          <div className="border-t pt-4">
            {friends.map((friend, index) => (
              <div key={index} className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm">
                  {friend.charAt(0)}
                </div>
                <span className="text-sm">{friend}</span>
              </div>
            ))}
          </div>
        </div>

        <PrimaryButton onClick={handleNext} className="mt-10 w-full">
          예산 설정하러 가기
        </PrimaryButton>
      </div>
    </DefaultLayout>
  );
};

export default PlanInvitePage;
