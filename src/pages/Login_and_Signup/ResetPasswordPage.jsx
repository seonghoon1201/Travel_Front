import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { resetPassword } from '../../api';
import CommonModal from '../../components/modal/CommonModal';
import { LockKeyhole } from 'lucide-react';
import BackHeader from '../../components/header/BackHeader';
import PrimaryButton from '../../components/common/PrimaryButton';
import DefaultLayout from '../../layouts/DefaultLayout';

const ResetPasswordPage = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const handleConfirm = () => {
    setIsModalOpen(false);
    navigate('/login');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      alert('이메일 정보가 없습니다. 처음부터 다시 시도해주세요.');
      navigate('/find-password');
      return;
    }

    if (!newPassword || !confirmPassword) {
      alert('비밀번호를 입력해주세요.');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (newPassword.length < 8 || newPassword.length > 20) {
      alert('비밀번호는 8~20자로 설정해주세요.');
      return;
    }

    try {
      await resetPassword({ email, password: newPassword });

      setIsModalOpen(true);
    } catch (error) {
      console.error('비밀번호 재설정 실패:', error?.response || error);
      alert(
        error?.response?.data?.message ||
          '비밀번호 재설정에 실패했습니다. 다시 시도해주세요.'
      );
    }
  };

  return (
    <DefaultLayout>
      <BackHeader title="비밀번호 재설정" />

      <div className="text-center mt-6 mb-6">
        <h2 className="text-lg font-bold mb-2">비밀번호 재설정</h2>
        <p className="text-sm text-gray-600">
          비밀번호는 8~20자의 영문, 숫자, 특수문자를 포함해야 합니다.
        </p>
      </div>

      <div className="w-full max-w-md mx-auto px-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="password"
              placeholder="비밀번호 입력"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-10 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>

          <div className="relative">
            <input
              type="password"
              placeholder="비밀번호 확인"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-10 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>

          <PrimaryButton type="submit">비밀번호 변경</PrimaryButton>
        </form>
      </div>

      <CommonModal
        isOpen={isModalOpen}
        message={`비밀번호 재설정이 완료되었습니다.\n재로그인을 진행해주세요.`}
        onConfirm={handleConfirm}
      />
    </DefaultLayout>
  );
};

export default ResetPasswordPage;
