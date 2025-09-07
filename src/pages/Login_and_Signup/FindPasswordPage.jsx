import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { sendAuthCode } from '../../api';
import BackHeader from '../../components/header/BackHeader';
import PrimaryButton from '../../components/common/PrimaryButton';
import logo from '../../assets/logo.png';
import DefaultLayout from '../../layouts/DefaultLayout';

const FindPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [msg, contextHolder] = message.useMessage();

  const handleNext = async () => {
    if (!email) {
      msg.warning('이메일을 입력해 주세요.');
      return;
    }

    try {
      setSending(true);
      const hide = msg.loading('인증 메일 전송 중...', 0);
      await sendAuthCode({ email });
      hide();
      msg.success('인증 코드가 이메일로 전송되었습니다.');
      navigate('/find-password/verify', { state: { email } });
    } catch (error) {
      msg.error(
        error?.response?.data?.message || '이메일 전송 중 오류가 발생했습니다.'
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <DefaultLayout>
      {contextHolder}
      <BackHeader title="비밀번호 찾기" />

      <div className="flex flex-col items-center mt-4">
        <img src={logo} alt="여담 로고" className="w-48 h-auto" />
        <p className="text-sm text-gray-700 mb-6 text-center">
          비밀번호를 찾고자 하는 이메일을 입력해주세요
        </p>
      </div>

      <div className="w-full max-w-md mx-auto px-4">
        {/* 이메일 입력 */}
        <div className="mb-4 relative">
          <input
            type="email"
            placeholder="이메일을 입력해 주세요."
            className="w-full px-10 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={sending}
          />
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>

        <PrimaryButton onClick={handleNext} disabled={sending}>
          {sending ? '전송 중...' : '다음'}
        </PrimaryButton>
      </div>
    </DefaultLayout>
  );
};

export default FindPasswordPage;
