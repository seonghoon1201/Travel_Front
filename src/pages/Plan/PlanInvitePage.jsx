// src/pages/Plan/PlanInvitePage.jsx
import React from 'react';
import DefaultLayout from '../../layouts/DefaultLayout';
import BackHeader from '../../components/header/BackHeader';
import PrimaryButton from '../../components/common/PrimaryButton';
import { useNavigate } from 'react-router-dom';

const PlanInvitePage = () => {
  const navigate = useNavigate();

  const handleNext = () => {
    navigate('/plan/budget');
  };

  return (
    <DefaultLayout>
      <div className="w-full mx-auto pb-28">
        <BackHeader title="친구 초대" />
        <div className="px-4 sm:px-6 md:px-8">
          <div className="mt-6">
            {/* 안내 메시지 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800 mb-6">
              현재 단계에서는 친구를 초대할 수 없습니다.
              <br />
              일정을 모두 작성한 후에 초대 기능을 사용할 수 있습니다.
            </div>
          </div>

          {/* 다음 단계 버튼 */}
          <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur border-t">
            <div className="mx-auto w-full px-4 sm:px-6 md:px-8 py-3">
              <PrimaryButton onClick={handleNext} className="w-full">
                예산 설정하러 가기
              </PrimaryButton>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default PlanInvitePage;
