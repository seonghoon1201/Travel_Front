// src/utils/kakaoMapLoader.js
const MAP_KEY =
  (typeof import.meta !== 'undefined' &&
    import.meta.env &&
    import.meta.env.VITE_KAKAO_JS_KEY) ||
  process.env.REACT_APP_KAKAO_JS_KEY;

export function loadKakaoMap(callback) {
  return new Promise((resolve, reject) => {
    const onReady = () => {
      if (!(window.kakao && window.kakao.maps)) {
        reject(
          new Error('Kakao Map SDK loaded but window.kakao.maps is missing')
        );
        return;
      }
      // autoload=false 이므로 load 콜백으로 보장
      window.kakao.maps.load(() => {
        if (typeof callback === 'function') callback();
        resolve(window.kakao);
      });
    };

    // 이미 로드 완료
    if (window.kakao && window.kakao.maps) {
      if (window.kakao.maps.load) {
        return onReady();
      }
      // 드물지만 maps가 즉시 준비된 경우
      if (typeof callback === 'function') callback();
      return resolve(window.kakao);
    }

    if (!MAP_KEY) return reject(new Error('Kakao Map appkey is missing'));

    // 스크립트 중복 처리: 있으면 load 이벤트만 구독
    let script = document.getElementById('kakao-map-script');
    if (script) {
      script.addEventListener('load', onReady, { once: true });
      script.addEventListener(
        'error',
        () => reject(new Error('Kakao Map script load error')),
        {
          once: true,
        }
      );
      return;
    }

    // 새로 삽입
    script = document.createElement('script');
    script.id = 'kakao-map-script';
    script.async = true;
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${MAP_KEY}&autoload=false`;
    script.addEventListener('load', onReady, { once: true });
    script.addEventListener(
      'error',
      () => reject(new Error('Kakao Map script load error')),
      {
        once: true,
      }
    );
    document.head.appendChild(script);
  });
}
export { loadKakaoMap as loadKakaoMapScript }; 
export default loadKakaoMap; 