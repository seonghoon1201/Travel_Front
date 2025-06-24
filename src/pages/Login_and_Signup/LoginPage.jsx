import React, { useState } from 'react';
import logo from '../../assets/logo.png';
import { useNavigate } from 'react-router-dom';
import { setItem } from '../../utils/localStorage';
import PrimaryButton from '../../components/common/PrimaryButton';
import axios from 'axios';

const LoginPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleKakaoLogin = () => {
    window.location.href = 'http://localhost:8080/auth/kakao/login';
  };

  const handleLogin = async () => {
    if (!email || !password) {
      alert('이메일과 비밀번호를 입력해 주세요.');
      return;
    }

    try {
      const res = await axios.post('http://localhost:8080/user/login', {
        email,
        password,
      });

      // 로그인 성공 시 토큰 등 저장
      const { accessToken, refreshToken, nickname, profileImageUrl } = res.data;

      setItem('accessToken', accessToken);
      setItem('refreshToken', refreshToken);
      setItem('nickname', nickname);
      setItem('profileImageUrl', profileImageUrl);

      alert('로그인 성공!');
      navigate('/'); // 메인 페이지로 이동
    } catch (error) {
      console.error('로그인 실패:', error);
      alert(
        error?.response?.data?.message || '이메일 또는 비밀번호가 올바르지 않습니다.'
      );
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="w-[90%] max-w-sm mx-auto text-center">
        <img src={logo} alt="여담 로고" className="w-60 mx-auto mb-3" />

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
  );
};

export default LoginPage;
