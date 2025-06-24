import React from 'react';
import { Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BackHeader from '../../components/header/BackHeader';
import PrimaryButton from '../../components/common/PrimaryButton';
import logo from '../../assets/logo.png';

const FindPasswordPage = () => {
  const navigate = useNavigate();

  const handleNext = () => {
    // TODO: 이메일 인증 코드 전송 로직 연결 예정
    navigate('/find-password/verify');
  };

  return (
    <div className="bg-background min-h-screen w-full flex flex-col items-center px-4">
      <div className="w-full max-w-sm py-6">
        <BackHeader />

        <div className="flex flex-col items-center mt-4">
          <img src={logo} alt="여담 로고" className="w-48 h-auto" />
          <p className="text-sm text-gray-700 mb-6 text-center">
            비밀번호를 찾고자 하는 이메일을 입력해주세요
          </p>
        </div>

        <div className="mb-4 relative">
          <input
            type="email"
            placeholder="이메일을 입력해 주세요."
            className="w-full px-10 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>

        <PrimaryButton onClick={handleNext}>다음</PrimaryButton>
      </div>
    </div>
  );
};

export default FindPasswordPage;
