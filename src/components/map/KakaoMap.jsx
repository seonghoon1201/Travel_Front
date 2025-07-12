import React, { useEffect, useRef } from 'react';
import { loadKakaoMapScript } from '../../utils/kakaoMapLoader';

const KakaoMap = ({ latitude, longitude }) => {
  const mapRef = useRef(null);

  useEffect(() => {
    loadKakaoMapScript(() => {
      console.log('지도 콜백 시작');
      if (!mapRef.current) return;

      const options = {
        center: new window.kakao.maps.LatLng(latitude, longitude),
        level: 3,
      };

      const map = new window.kakao.maps.Map(mapRef.current, options);

      new window.kakao.maps.Marker({
        map,
        position: new window.kakao.maps.LatLng(latitude, longitude),
      });
    });
  }, [latitude, longitude]);

  return (
    <div
      ref={mapRef}
      className="w-full h-64 rounded-lg"
    />
  );
};

export default KakaoMap;
