import React, { useState } from 'react';
import logo from '../../assets/logo.png';
import { useNavigate } from 'react-router-dom';
import { setItem } from '../../utils/localStorage';
import PrimaryButton from '../../components/common/PrimaryButton';
import { loginUser, getKakaoLoginUrl } from '../../api';
import DefaultLayout from '../../layouts/DefaultLayout';
import useUserStore from '../../store/userStore';

const LoginPage = () => {
  const navigate = useNavigate();
  const login = useUserStore((state) => state.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleKakaoLogin = () => {
    // 로컬
    //window.location.href = `${API_BASE_URL}/auth/kakao/login`;
    //  서버
    window.location.href = getKakaoLoginUrl();
  };

  const handleLogin = async () => {
    if (!email || !password) {
      alert('이메일과 비밀번호를 입력해 주세요.');
      return;
    }

    try {
      const data = await loginUser({ email, password });
      const {
        jwtDto: { accessToken, refreshToken },
        userNickname: nickname,
        userProfileImage: profileImageUrl,
        userRole,
      } = data;

      login({ accessToken, refreshToken, nickname, profileImageUrl, userRole }); // store 갱신

      alert('로그인 성공!');
      // console.log(' login 호출 시 전달값:', {
      //   accessToken,
      //   refreshToken,
      //   nickname,
      //   profileImageUrl,
      // });
      console.log('login 호출 완료');
      navigate('/');
    } catch (error) {
      console.error('로그인 실패:', error);

      alert(
        error?.response?.data?.message ||
          '이메일 또는 비밀번호가 올바르지 않습니다.'
      );
    }
  };

  return (
    <DefaultLayout>
      <div className="flex flex-col items-center justify-center w-full min-h-[calc(100vh-96px)] p-[1.2rem] pt-[2.6rem]">
        <img src={logo} alt="여담 로고" className="w-60 mb-6" />

        <div className="w-full max-w-md">
          <div className="text-left mb-3">
            <label className="text-sm text-text font-semibold">이메일</label>
            <input
              type="email"
              placeholder="이메일을 입력해 주세요."
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="text-left mb-5">
            <label className="text-sm text-text font-semibold">비밀번호</label>
            <input
              type="password"
              placeholder="비밀번호를 입력해 주세요."
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <PrimaryButton onClick={handleLogin}>로그인</PrimaryButton>

          <button
            className="w-full mt-3 py-2.5 rounded-xl bg-yellow-300 text-sm font-semibold text-black hover:brightness-95 transition flex items-center justify-center gap-2"
            onClick={handleKakaoLogin}
          >
            <img
              src={require('../../assets/kakao_icon.png')}
              alt="kakao"
              className="w-5 h-5"
            />
            카카오로 이용하기
          </button>

          <div className="mt-5 text-sm text-gray-500 flex justify-center space-x-4">
            <button
              className="hover:underline"
              onClick={() => navigate('/find-password')}
            >
              비밀번호 찾기
            </button>
            <span className="text-gray-300">|</span>
            <button
              className="hover:underline"
              onClick={() => navigate('/signup')}
            >
              회원가입
            </button>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default LoginPage;
