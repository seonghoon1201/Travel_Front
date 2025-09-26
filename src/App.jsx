// src/App.jsx
import React, { useEffect } from 'react';
import AppRoutes from './routes';
import { App as CapApp } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import qs from 'qs';
import http from './utils/authAxios';
import useUserStore from './store/userStore';
import { StatusBar, Style } from '@capacitor/status-bar';

function useKakaoAppLinks() {
  const login = useUserStore((s) => s.login);
  useEffect(() => {
    const sub = CapApp.addListener('appUrlOpen', async ({ url }) => {
      // ex) https://yeodam.site/kakao/callback?code=xxx&state=yyy
      if (!url?.startsWith('https://yeodam.vercel.app/kakao/callback')) return;

      try {
        // 1) 커스텀 탭 닫기
        if (Capacitor.isNativePlatform()) await Browser.close();

        // 2) code/state 파싱
        const query = url.split('?')[1] || '';
        const { code, state } = qs.parse(query);
        if (!code) return;

        // 3) 서버에 code 교환 요청
        const { data } = await http.post('/auth/kakao/callback', { code });
        const jwtDto = data?.jwtDto;
        if (!jwtDto) throw new Error('jwtDto 없음');

        login({
          accessToken: jwtDto.accessToken,
          refreshToken: jwtDto.refreshToken,
          nickname: data?.userNickname || '',
          profileImageUrl: data?.userProfileImage || '',
          userRole: data?.userRole || '',
          userEmail: data?.userEmail || '',
          userName: data?.userName || '',
          isLoggedIn: true,
        });

        // 4) state에 담았던 redirect 복원 (선택)
        let next = '/';
        if (state) {
          try {
            const s = decodeURIComponent(state);
            if (s.startsWith('{')) next = JSON.parse(s)?.redirect || '/';
            else if (s.includes('redirect='))
              next = new URLSearchParams(s).get('redirect') || '/';
            else if (s.startsWith('/')) next = s;
          } catch {}
        }
        // navigate(next, { replace: true }); // 라우터 사용 시
        window.location.replace(next);
      } catch (e) {
        console.error(e);
        // 실패 시 로그인 페이지 등으로
        window.location.replace('/login');
      }
    });
    return () => sub.remove();
  }, [login]);
}

export default function App() {
  useKakaoAppLinks();
  useEffect(() => {
    if (Capacitor.getPlatform() !== 'web') {
      StatusBar.setOverlaysWebView({ overlay: false }); // ⬅️ 핵심
      StatusBar.setBackgroundColor({ color: '#F8FBFF' });
      StatusBar.setStyle({ style: Style.Dark }); // 밝은 배경 → 어두운 아이콘
    }
    // ✅ 옵션 1 모드 플래그 (safe-area padding 제거 트리거)
    document.documentElement.classList.toggle('uses-overlay', false);
  }, []);

  return (
    <div className="min-h-dvh flex flex-col bg-[#F6FBFF]">
      <AppRoutes />
    </div>
  );
}
