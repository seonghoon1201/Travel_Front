import React, { useState } from 'react';
import logo from '../../assets/logo.png';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { message } from 'antd';
import PrimaryButton from '../../components/common/PrimaryButton';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { loginUser, getKakaoLoginUrl } from '../../api';
import DefaultLayout from '../../layouts/DefaultLayout';
import useUserStore from '../../store/userStore';
import { Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const login = useUserStore((state) => state.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [msg, contextHolder] = message.useMessage();

  // ✅ 현재 페이지(로그인)의 종료 후 돌아갈 경로 계산
  const currentUrl = `${window.location.pathname}${window.location.search}`;
  const redirectParam = searchParams.get('redirect'); // /login?redirect=/invite?scheduleId=...

  // ✅ 공통: 로그인 후 어디로 보낼지 결정
  const computeNextUrl = () => {
    // 1) 쿼리 파라미터 우선
    if (redirectParam) return redirectParam;

    // 2) localStorage 백업
    try {
      const raw = localStorage.getItem('pendingScheduleInvite');
      if (raw) {
        const saved = JSON.parse(raw);
        // saved.redirect가 있으면 그걸 가장 우선
        if (saved?.redirect) return saved.redirect;
        // redirect가 없고 scheduleId만 있으면 초대수락 페이지로 보내기
        if (saved?.scheduleId) return `/invite?scheduleId=${saved.scheduleId}`;
      }
    } catch {
      /* no-op */
    }

    // 3) 기본
    return '/';
  };

  // ✅ 카카오 로그인: redirect 유지해서 복귀 가능하게
  const handleKakaoLogin = () => {
    msg.loading('카카오 로그인 페이지로 이동합니다...', 1);

    // 로그인 후 돌아갈 곳: 쿼리에 redirect가 있으면 그곳, 없으면 홈('/')
    const redirectTarget = redirectParam || '/';

    // 안전 백업 (필요할 때만)
    const scheduleId = new URLSearchParams(window.location.search).get(
      'scheduleId'
    );
    localStorage.setItem(
      'pendingScheduleInvite',
      JSON.stringify({
        scheduleId,
        redirect: redirectParam || '/', // ← /login 저장 금지
        ts: Date.now(),
      })
    );

    // 카카오로 보낼 때 'state'에 redirect 정보를 넣어 보낸다 (카카오가 그대로 콜백에 돌려줌)
    try {
      const base = getKakaoLoginUrl(); // ex) https://kauth.kakao.com/oauth/authorize?...&response_type=code
      const url = new URL(base);
      url.searchParams.set(
        'state',
        encodeURIComponent(JSON.stringify({ redirect: redirectTarget }))
      );
      window.location.href = url.toString();
    } catch {
      const sep = getKakaoLoginUrl().includes('?') ? '&' : '?';
      const state = encodeURIComponent(
        JSON.stringify({ redirect: redirectTarget })
      );
      window.location.href = `${getKakaoLoginUrl()}${sep}state=${state}`;
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      msg.warning('이메일과 비밀번호를 입력해 주세요.');
      return;
    }

    try {
      setLoggingIn(true);
      const hide = msg.loading('로그인 중...', 0);
      const data = await loginUser({ email, password });
      hide();

      const {
        jwtDto: { accessToken, refreshToken },
        userNickname: nickname,
        userProfileImage: profileImageUrl,
        userRole,
      } = data;

      // ✅ 토큰/유저정보 저장
      login({ accessToken, refreshToken, nickname, profileImageUrl, userRole });

      // ✅ 성공 메시지
      msg.success('로그인 성공!');

      // ✅ 이동 우선순위: redirect 파라미터 > pending.redirect > pending.scheduleId > /mypage
      const next = computeNextUrl();

      // ✅ 사용한 pending은 제거
      localStorage.removeItem('pendingScheduleInvite');

      navigate(next, { replace: true });
    } catch (error) {
      const status = error?.response?.status;
      msg.error(
        error?.response?.data?.message ||
          (status === 401 || status === 403
            ? '이메일 또는 비밀번호가 올바르지 않습니다.'
            : '로그인 중 오류가 발생했습니다.')
      );
    } finally {
      setLoggingIn(false);
    }
  };

  const onPasswordKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleLogin();
    }
  };

  return (
    <DefaultLayout>
      {contextHolder}
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
              disabled={loggingIn}
            />
          </div>

          {/* 비밀번호 입력 + 보기/숨기기 토글 */}
          <div className="text-left mb-5">
            <label className="text-sm text-text font-semibold">비밀번호</label>
            <div className="relative mt-1">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="비밀번호를 입력해 주세요."
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={onPasswordKeyDown}
                disabled={loggingIn}
              />
              <button
                type="button"
                aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                onClick={() => setShowPassword((v) => !v)}
                disabled={loggingIn}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <PrimaryButton onClick={handleLogin} disabled={loggingIn}>
            {loggingIn ? '로그인 중...' : '로그인'}
          </PrimaryButton>

          <button
            className="w-full mt-3 py-2.5 rounded-xl bg-yellow-300 text-sm font-semibold text-black hover:brightness-95 transition flex items-center justify-center gap-2 disabled:opacity-60"
            onClick={handleKakaoLogin}
            disabled={loggingIn}
          >
            <img
              src={require('../../assets/kakao_icon.png')}
              alt="kakao"
              className="w-5 h-5"
            />
            카카오로 이용하기
          </button>

          <div className="relative mt-5 text-sm text-gray-500 h-6">
            {/* 중앙 구분자: 항상 정확히 가운데 */}
            <div className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 flex items-center">
              <span className="text-gray-300">|</span>
            </div>

            {/* 왼쪽 텍스트: 가운데에서 왼쪽으로 붙이기 */}
            <div
              className="absolute top-1/2 -translate-y-1/2 pr-3 whitespace-nowrap"
              style={{ right: '50%' }}
            >
              <button
                className="hover:underline"
                onClick={() => navigate('/find-password')}
              >
                비밀번호 찾기
              </button>
            </div>

            {/* 오른쪽 텍스트: 가운데에서 오른쪽으로 붙이기 */}
            <div
              className="absolute top-1/2 -translate-y-1/2 pl-3 whitespace-nowrap"
              style={{ left: '50%' }}
            >
              <button
                className="hover:underline"
                onClick={() => navigate('/signup')}
              >
                회원가입
              </button>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default LoginPage;
