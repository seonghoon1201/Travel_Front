import React, { useEffect, useRef } from 'react';
import { loadKakaoMapScript } from '../../utils/kakaoMapLoader';

const KakaoMap = ({ latitude, longitude, markers = [], useCustomOverlay = false }) => {
  const mapRef = useRef(null);

  useEffect(() => {
    loadKakaoMapScript(() => {
      if (!mapRef.current) return;

      // 원하는 5가지 색상 반복 돌림
      const colorList = ['#5E87EB', '#F97316', '#10B981', '#EC4899', '#FACC15'];

      let map;

      const center = markers.length > 0
        ? new window.kakao.maps.LatLng(markers[0].lat, markers[0].lng)
        : latitude && longitude
          ? new window.kakao.maps.LatLng(latitude, longitude)
          : null;

      if (!center) return;

      map = new window.kakao.maps.Map(mapRef.current, {
        center,
        level: 6,
      });

      if (markers.length > 0) {
        markers.forEach(({ lat, lng }, index) => {
          const position = new window.kakao.maps.LatLng(lat, lng);

          if (useCustomOverlay) {
            // index 기준으로 5가지 반복
            const color = colorList[index % colorList.length];

            new window.kakao.maps.CustomOverlay({
              map,
              position,
              content: `
                <div style="
                  width: 24px;
                  height: 24px;
                  border-radius: 50%;
                  background: ${color};
                  color: white;
                  text-align: center;
                  line-height: 24px;
                  font-size: 12px;
                  font-weight: bold;
                ">
                  ${index + 1}
                </div>
              `,
              yAnchor: 1,
            });
          } else {
            new window.kakao.maps.Marker({ map, position });
          }
        });
      } else if (latitude && longitude) {
        const position = new window.kakao.maps.LatLng(latitude, longitude);
        new window.kakao.maps.Marker({ map, position });
      }
    });
  }, [latitude, longitude, markers, useCustomOverlay]);

  return <div ref={mapRef} className="w-full h-64 rounded-lg" />;
};

export default KakaoMap;
