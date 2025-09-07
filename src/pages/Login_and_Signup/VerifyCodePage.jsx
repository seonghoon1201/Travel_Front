import React, { useState } from 'react';
import { KeyRound } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { verifyAuthCode } from '../../api';
import BackHeader from '../../components/header/BackHeader';
import PrimaryButton from '../../components/common/PrimaryButton';
import DefaultLayout from '../../layouts/DefaultLayout';

const VerifyCodePage = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const location = useLocation();
  const email = location.state?.email;

  const handleSubmit = async () => {
    if (!code) {
      alert('인증 코드를 입력해주세요.');
      return;
    }

    try {
      await verifyAuthCode({ token: code.trim() });

      alert('인증이 완료되었습니다.');
      navigate('/reset-password', { state: { email } });
    } catch (error) {
      console.error('인증 실패:', error);
      alert(error?.response?.data?.message || '인증 코드가 유효하지 않습니다.');
    }
  };

  return (
    <DefaultLayout>
      <BackHeader title="비밀번호 찾기" />

      <div className="text-center mt-6 mb-6">
        <h2 className="text-lg font-bold mb-2">인증 코드 입력</h2>
        <p className="text-sm text-gray-600">
          입력하신 이메일 주소로 인증코드를 전송했습니다.
          <br />
          인증코드를 입력하여 본인 확인을 완료해주세요.
        </p>
      </div>

      <div className="w-full max-w-md mx-auto px-4">
        <div className="mb-4 relative">
          <input
            type="text"
            placeholder="인증코드를 입력해 주세요."
            className="w-full px-10 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>

        <PrimaryButton onClick={handleSubmit}>다음</PrimaryButton>
      </div>
    </DefaultLayout>
  );
};

export default VerifyCodePage;
