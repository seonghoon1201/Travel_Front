// src/components/AppBackHandler.jsx
import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { App as CapApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { message } from 'antd';

/**
 * 안드로이드 하드웨어 뒤로가기 처리
 * - 히스토리가 있으면 navigate(-1)
 * - 특정 루트 경로에서는 "한 번 더 누르면 종료" 토스트 후 2초 내 재입력시 종료
 */
export default function AppBackHandler() {
  const navigate = useNavigate();
  const location = useLocation();
  const lastBackRef = useRef(0);

  // 뒤로 두번 눌러 종료를 적용할 경로들 (원하는 대로 추가/수정 가능)
  const EXIT_ROUTES = new Set(['/', '/home', '/splash']);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return; // 웹에서는 무시

    const remove = CapApp.addListener('backButton', ({ canGoBack }) => {
      // 모달/팝업 등 앱 내부 상태가 있으면 여기서 먼저 닫는 로직을 태워도 됨.
      // ex) if (store.modalOpen) { store.closeModal(); return; }

      // 1) 라우터 히스토리가 가능하면 뒤로가기
      if (canGoBack && !EXIT_ROUTES.has(location.pathname)) {
        navigate(-1);
        return;
      }

      // 2) 루트(홈 등)에서는 두 번 눌러야 종료
      const now = Date.now();
      if (now - lastBackRef.current < 2000) {
        CapApp.exitApp();
      } else {
        lastBackRef.current = now;
        message.info('한 번 더 누르면 종료됩니다');
      }
    });

    return () => {
      remove?.remove();
    };
    // location.pathname이 바뀌어도 최신 경로 기준으로 동작하도록 의존성 포함
  }, [location.pathname, navigate]);

  return null;
}
