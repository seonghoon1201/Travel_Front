// src/App.jsx
import React, { useEffect } from 'react';
import AppRoutes from './routes';

import { App as CapApp } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

import qs from 'qs';
import http from './utils/authAxios';
import useUserStore from './store/userStore';

function useKakaoAppLinks() {
  const login = useUserStore((s) => s.login);

  useEffect(() => {
    const sub = CapApp.addListener('appUrlOpen', async ({ url }) => {
      // 허용 콜백 도메인(둘 다 지원)
      const allow = [
        'https://yeodam.site/kakao/callback',
        'https://yeodam.vercel.app/kakao/callback',
      ];
      if (!url || !allow.some((u) => url.startsWith(u))) return;

      try {
        // 1) 커스텀 탭 닫기(네이티브에서만)
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

        // 4) state 기반 리다이렉트(있으면)
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
        window.location.replace(next);
      } catch (e) {
        console.error(e);
        window.location.replace('/login');
      }
    });

    return () => {
      try {
        sub.remove();
      } catch {}
    };
  }, [login]);
}

export default function App() {
  useKakaoAppLinks();

  useEffect(() => {
    // 네이티브(안드/IOS)에서만 상태바 설정
    if (Capacitor.isNativePlatform()) {
      // 핵심: WebView가 상태바 뒤로 깔리지 않게
      StatusBar.setOverlaysWebView({ overlay: false });

      // 보기 좋은 배경/아이콘 설정(앱 톤&매너에 맞게 조정 가능)
      StatusBar.setBackgroundColor({ color: '#F6FBFF' });
      StatusBar.setStyle({ style: Style.Dark }); // 밝은 배경 → 어두운 아이콘
    }

    // uses-overlay 플래그는 더 이상 사용하지 않음(전역 CSS 단순화)
    // document.documentElement.classList.toggle('uses-overlay', false);
  }, []);

  return (
    // safe-area 유틸 적용(상/하단 겹침 방지)
    <div className="min-h-dvh flex flex-col bg-[#F6FBFF] safe-top safe-bottom">
      <AppRoutes />
    </div>
  );
}
