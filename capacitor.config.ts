import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yeodam.app',
  appName: '여담',
  webDir: 'build',
  android: { allowMixedContent: false },
  server: {
    // 프로덕션에선 보통 url 미사용(정적 번들 포함 방식)
    cleartext: false,
    // ⬇️ 카카오 OAuth 도메인을 WebView 내부에서 허용(주소창 방지)
    allowNavigation: [
      'accounts.kakao.com',
      'kauth.kakao.com',
      'kapi.kakao.com',

      // ✅ 우리 서비스 도메인(리다이렉트 URI에 쓰는 모든 도메인)
      'yeodam.vercel.app',
      'yeodam.site',
    ],
  },
};

export default config;
