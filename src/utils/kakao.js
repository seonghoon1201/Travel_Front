// src/utils/kakao.js
const KAKAO_JS_KEY =
  (typeof import.meta !== 'undefined' &&
    import.meta.env &&
    import.meta.env.VITE_KAKAO_JS_KEY) ||
  process.env.REACT_APP_KAKAO_JS_KEY ||
  '';

let kakaoReady;
export function loadKakao() {
  if (kakaoReady) return kakaoReady;
  kakaoReady = new Promise((resolve, reject) => {
    if (window.Kakao && window.Kakao.isInitialized?.())
      return resolve(window.Kakao);
    const s = document.createElement('script');
    s.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js';
    s.crossOrigin = 'anonymous';
    s.onload = () => {
      try {
        if (!window.Kakao.isInitialized()) {
          if (!KAKAO_JS_KEY) throw new Error('Kakao JS key is missing');
          window.Kakao.init(KAKAO_JS_KEY);
        }
        resolve(window.Kakao);
      } catch (e) {
        reject(e);
      }
    };
    s.onerror = reject;
    document.head.appendChild(s);
  });
  return kakaoReady;
}
