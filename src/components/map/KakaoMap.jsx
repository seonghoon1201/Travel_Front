import React, { useEffect } from 'react';
import { loadKakaoMapScript } from '../../utils/kakaoMapLoader';

const GKakaoMap = () => {
  useEffect(() => {
    loadKakaoMapScript(() => {
      console.log('지도 콜백 시작');
      // container: 지도가 들어갈 <div id="map">
      const container = document.getElementById('map');
      // 추후에 api 연동해서 위도 경도값 변수로 받아와서 해야할 듯 !
      //LatLng: 위도 경도, level: 줌 레벨, Map: 지도를 생성해서 넣기
      const options = {
        center: new window.kakao.maps.LatLng(33.450701, 126.570667),
        level: 3,
      };
      const map = new window.kakao.maps.Map(container, options);

      new window.kakao.maps.Marker({
        map,
        position: new window.kakao.maps.LatLng(33.450701, 126.570667),
      });
    });
  }, []);

  return <div id="map" style={{ width: '100%', height: '400px' }}></div>;
};

export default KakaoMap;
