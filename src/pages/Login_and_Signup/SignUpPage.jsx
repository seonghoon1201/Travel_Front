import React, { useState } from 'react';
import PrimaryButton from '../../components/common/PrimaryButton';
import profileDefault from '../../assets/profile_default.png';
import BackHeader from '../../components/header/BackHeader';
import { Eye, EyeOff } from 'lucide-react';

const SignUpPage = () => {
  const [terms, setTerms] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [allChecked, setAllChecked] = useState(false);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleAllAgreeChange = () => {
    const next = !allChecked;
    setAllChecked(next);
    setTerms(next);
    setPrivacy(next);
    setMarketing(next);
  };

  const passwordsMatch = confirmPassword && password === confirmPassword;
  const passwordsMismatch = confirmPassword && password !== confirmPassword;

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
    }
  };

  return (
    <div className="bg-background min-h-screen w-full flex justify-center px-4">
      <div className="w-full max-w-sm py-6 overflow-y-auto">
        <BackHeader title="회원가입" />
        <p className="font-noonnu font-semibold mb-4 text-center">
          반갑습니다!
        </p>

        <div className="font-pretendard">
          <div className="flex justify-center mb-4">
            <div className="flex flex-col items-center">
              <img
                src={profileImage || profileDefault}
                alt="기본 프로필"
                className="w-20 h-20 rounded-full bg-white object-cover"
              />
              <label className="text-blue-500 mt-1 text-sm cursor-pointer">
                업로드
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <form>
            <label className="block text-sm font-medium mb-1">
              이메일 <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="email"
                placeholder="이메일을 입력해 주세요."
                className="border w-full px-3 py-2 rounded text-sm"
              />
              <button
                type="button"
                className="text-sm border px-3 py-2 rounded text-blue-500 whitespace-nowrap"
              >
                인증코드
              </button>
            </div>

            <label className="block text-sm font-medium mb-1">
              인증코드 입력 <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="인증코드를 입력해 주세요."
                className="border w-full px-3 py-2 rounded text-sm"
              />
              <button
                type="button"
                className="text-sm border px-3 py-2 rounded text-blue-500 whitespace-nowrap"
              >
                인증하기
              </button>
            </div>

            <label className="block text-sm font-medium mb-1">
              비밀번호 <span className="text-red-500">*</span>
            </label>
            <div className="relative mb-3">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="비밀번호를 입력해 주세요."
                className="border w-full px-3 py-2 rounded text-sm pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            <label className="block text-sm font-medium mb-1">
              비밀번호 확인 <span className="text-red-500">*</span>
            </label>
            <div className="relative mb-1">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="비밀번호를 다시 입력해 주세요."
                className="border w-full px-3 py-2 rounded text-sm pr-10"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {passwordsMismatch && (
              <p className="text-sm text-red-500">
                비밀번호가 일치하지 않습니다.
              </p>
            )}
            {passwordsMatch && (
              <p className="text-sm text-green-600">비밀번호가 일치합니다!</p>
            )}

            <label className="block text-sm font-medium mt-4 mb-1">
              이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="이름을 입력해 주세요."
              className="border w-full px-3 py-2 rounded text-sm mb-3"
            />

            <label className="block text-sm font-medium mb-1">
              닉네임 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="닉네임을 입력해 주세요."
              className="border w-full px-3 py-2 rounded text-sm mb-5"
            />

            <div className="border-t border-gray-200 my-4" />

            <div className="text-sm font-medium mb-2">이용 약관</div>

            <div className="mb-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={handleAllAgreeChange}
                />
                모두 동의합니다
              </label>
            </div>

            <div className="space-y-2 text-sm pl-5">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={terms}
                  onChange={(e) => setTerms(e.target.checked)}
                />
                [필수] 이용약관{' '}
                <span className="text-blue-500 cursor-pointer">[보기]</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={privacy}
                  onChange={(e) => setPrivacy(e.target.checked)}
                />
                [필수] 개인정보 수집 이용 동의{' '}
                <span className="text-blue-500 cursor-pointer">[보기]</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={marketing}
                  onChange={(e) => setMarketing(e.target.checked)}
                />
                [선택] 마케팅 정보 수신 동의
              </label>
            </div>

            <div className="mt-6">
              <PrimaryButton type="submit">여담 가입하기</PrimaryButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
