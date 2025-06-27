export function loadKakaoMapScript(callback) {
  // 카카오 맵 로드 되어있으면 콜백
  if (window.kakao && window.kakao.maps) {
    callback();
    return;
  }
  // 스크립트 태그 중복 추가 방지
  if (document.getElementById('kakao-map-script')) return;

  const script = document.createElement('script');
  script.id = 'kakao-map-script';
  script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.REACT_APP_KAKAO_JS_KEY}&autoload=false`;
  script.async = true;
  script.onload = () => {
    console.log('SDK 로드 완료');
    window.kakao.maps.load(callback);
  };
  document.body.appendChild(script);
}
