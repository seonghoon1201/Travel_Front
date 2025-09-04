// CRA 전용: Vite 아님
const KAKAO_JS_KEY = process.env.REACT_APP_KAKAO_JS_KEY || '';

let kakaoReady;
export function loadKakao() {
  if (kakaoReady) return kakaoReady;

  kakaoReady = new Promise((resolve, reject) => {
    // 이미 초기화된 경우
    if (window.Kakao && window.Kakao.isInitialized && window.Kakao.isInitialized()) {
      return resolve(window.Kakao);
    }

    // 이미 스크립트가 있으면 로드 이벤트만 대기
    const SDK_URL = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js';
    const exist = document.querySelector(`script[src="${SDK_URL}"]`);
    const onReady = () => {
      try {
        if (!window.Kakao) throw new Error('Kakao SDK not found');
        if (!window.Kakao.isInitialized || !window.Kakao.isInitialized()) {
          if (!KAKAO_JS_KEY) throw new Error('Kakao JS key is missing');
          window.Kakao.init(KAKAO_JS_KEY);
        }
        resolve(window.Kakao);
      } catch (e) {
        reject(e);
      }
    };

    if (exist) {
      if (window.Kakao && window.Kakao.isInitialized && window.Kakao.isInitialized()) {
        return resolve(window.Kakao);
      }
      exist.addEventListener('load', onReady, { once: true });
      exist.addEventListener('error', reject, { once: true });
      return;
    }

    // 스크립트 최초 로딩
    const s = document.createElement('script');
    s.src = SDK_URL;
    s.async = true;
    s.crossOrigin = 'anonymous';
    s.onload = onReady;
    s.onerror = reject;
    document.head.appendChild(s);
  });

  return kakaoReady;
}
