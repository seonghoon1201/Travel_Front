// capacitor.config.ts
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yeodam.app',
  appName: '여담',
  webDir: 'build',
  android: {
    // 🔧 혼합 콘텐츠(HTTP 이미지 등) 허용: 썸네일이 http일 때 깨짐 방지
    allowMixedContent: true,
  },
  server: {
    // 프로덕션에선 정적 번들(내장 서버) 사용
    cleartext: false,
    // ⬇️ Kakao OAuth/Share에 필요한 도메인 허용
    allowNavigation: [
      'accounts.kakao.com',
      'kauth.kakao.com',
      'kapi.kakao.com',
      'sharer.kakao.com', // ✅ Kakao Share 경유지
      // 우리 서비스 도메인(리다이렉트 URI 포함)
      'yeodam.vercel.app',
      'yeodam.site',
      // (선택) 정적 리소스 캐시 도메인
      'k.kakaocdn.net',
      't1.kakaocdn.net',
    ],
    // (기본값: http/localhost) — Kakao 콘솔에 http://localhost 화이트리스트 등록 필요
    // androidScheme: 'http',
    // hostname: 'localhost',
  },
};

export default config;
