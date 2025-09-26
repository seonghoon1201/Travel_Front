// src/App.jsx
import React, { useEffect } from 'react';
import AppRoutes from './routes';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

export default function App() {
  useEffect(() => {
    if (Capacitor.getPlatform() !== 'web') {
      // ✅ WebView가 상태바 아래로 깔리지 않게
      StatusBar.setOverlaysWebView({ overlay: false });
      // 상태바 색/아이콘
      StatusBar.setBackgroundColor({ color: '#ffffff' });
      StatusBar.setStyle({ style: Style.Dark }); // 밝은 배경에 어두운 아이콘
    }
  }, []);

  return (
    <div className="min-h-dvh flex flex-col bg-[#F6FBFF] safe-top safe-bottom">
      <AppRoutes />
    </div>
  );
}
