import React, { useEffect, useRef, useState } from 'react';
import { loadKakaoMapScript } from '../../utils/kakaoMapLoader';

const KakaoMap = ({
  latitude,
  longitude,
  markers = [],
  useCustomOverlay = false,
  fitToMarkers = true,
  fitPadding = 60,
  className = 'w-full h-64 rounded-lg',
}) => {
  const containerRef = useRef(null); // div
  const mapRef = useRef(null); // kakao.maps.Map
  const [ready, setReady] = useState(false); // SDK 로드 여부

  // SDK 로드
  useEffect(() => {
    loadKakaoMapScript(() => {
      setReady(true);
    }).catch((e) => {
      console.error('[KakaoMap] SDK load error', e);
    });
  }, []);

  // 지도 초기화
  useEffect(() => {
    if (!ready || !containerRef.current || mapRef.current) return;

    const center =
      (markers[0] &&
        new window.kakao.maps.LatLng(markers[0].lat, markers[0].lng)) ||
      (latitude &&
        longitude &&
        new window.kakao.maps.LatLng(latitude, longitude)) ||
      new window.kakao.maps.LatLng(37.5665, 126.978); // 서울 기본값

    mapRef.current = new window.kakao.maps.Map(containerRef.current, {
      center,
      level: 6,
    });
  }, [ready, markers, latitude, longitude]);

  // markers 반영
  useEffect(() => {
    if (!ready || !mapRef.current) return;

    const { maps } = window.kakao;
    const map = mapRef.current;

    // 이전 마커 제거
    map.markers?.forEach((m) => m.setMap(null));
    map.markers = [];

    const bounds = new maps.LatLngBounds();
    const path = [];
    const colorList = ['#5E87EB', '#F97316', '#10B981', '#EC4899', '#FACC15'];

    if (markers.length > 0) {
      markers.forEach(({ lat, lng, order }, i) => {
        const pos = new maps.LatLng(lat, lng);
        bounds.extend(pos);
        path.push(pos);

        if (useCustomOverlay) {
          const overlay = new maps.CustomOverlay({
            map,
            position: pos,
            content: `<div style="
              width:24px;height:24px;border-radius:50%;
              background:${colorList[i % colorList.length]};
              color:#fff;text-align:center;line-height:24px;
              font-size:12px;font-weight:bold;
            ">${order || i + 1}</div>`,
            yAnchor: 1,
          });
          map.markers.push(overlay);
        } else {
          const marker = new maps.Marker({ map, position: pos });
          map.markers.push(marker);
        }
      });

      // 경로 라인
      if (path.length > 1) {
        const polyline = new maps.Polyline({
          map,
          path,
          strokeWeight: 2,
          strokeColor: '#3B82F6',
          strokeOpacity: 0.9,
        });
        map.markers.push(polyline);
      }

      if (fitToMarkers) map.setBounds(bounds, fitPadding);
    } else if (latitude && longitude) {
      const pos = new maps.LatLng(latitude, longitude);
      const marker = new maps.Marker({ map, position: pos });
      map.markers.push(marker);
      map.setCenter(pos);
    }
  }, [
    ready,
    markers,
    latitude,
    longitude,
    useCustomOverlay,
    fitToMarkers,
    fitPadding,
  ]);

  return <div ref={containerRef} className={className} />;
};

export default KakaoMap;
