// src/utils/kakao.js
let kakaoReady;

export async function loadKakao() {
  if (window.Kakao && window.Kakao.isInitialized?.()) return window.Kakao;

  // SDK 스크립트 주입
  if (!document.getElementById('kakao-js-sdk')) {
    const s = document.createElement('script');
    s.id = 'kakao-js-sdk';
    s.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js';
    s.crossOrigin = 'anonymous';
    document.head.appendChild(s);
    kakaoReady = new Promise((res) => (s.onload = res));
  }

  if (kakaoReady) await kakaoReady;

  const JS_KEY =
    process.env.REACT_APP_KAKAO_JS_KEY || import.meta?.env?.VITE_KAKAO_JS_KEY; // (Vite 겸용)

  if (!JS_KEY) throw new Error('REACT_APP_KAKAO_JS_KEY 누락');

  if (!window.Kakao.isInitialized()) {
    window.Kakao.init(JS_KEY); // 반드시 JavaScript 키
  }
  console.log(
    '[Kakao] init ok?',
    window.Kakao.isInitialized(),
    'key(len)=',
    (JS_KEY || '').length
  );
  return window.Kakao;
}
