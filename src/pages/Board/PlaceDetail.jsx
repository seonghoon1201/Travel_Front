import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import KakaoMap from '../../components/map/KakaoMap';
import DefaultLayout from '../../layouts/DefaultLayout';
import BackHeader from '../../components/header/BackHeader';

const dummyPlaceData = {
  contentId: "137706",
  title: "아쿠아플라넷 제주",
  address: "제주특별자치도 서귀포시 성산읍 섭지코지로 95",
  tel: "1833-7001",
  website: "https://www.aquaplanet.co.kr/jeju/index.do",
  imageUrl: "", 
  mapX: "126.925710",  
  mapY: "33.488980", 
  openTime: "9:30",
  closeTime: "18:00",
  lastEntry: "17:30",
  tips: "유모차 대여 가능, 신용카드 가능",
  region: "제주",
};

const PlaceDetail = () => {
  const { contentId } = useParams();
  const place = dummyPlaceData;
  const [isSaved, setIsSaved] = useState(false);

  const toggleSave = () => setIsSaved(prev => !prev);
  const handleAddToCart = () => {
    if (window.confirm('여행 일정 짜러 갈까요?')) {
        window.location.href = '/plan/location';
    }
};

const handleFindRoute = () => {
  const kakaoUrl = `https://map.kakao.com/link/to/${place.title},${place.mapY},${place.mapX}`;
  window.open(kakaoUrl, '_blank');
};

  return (
    <DefaultLayout> 
        <BackHeader />
      {/* 제목 & 좋아요 */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl font-bold">{place.title}</h1>
        <div className="flex items-center text-gray-500">
          <span className="ml-2 text-xs">📍 {place.region}</span>
        </div>
      </div>

      {/* 대표 이미지 */}
      <img
        src={place.imageUrl}
        alt={place.title}
        className="w-full h-52 object-cover rounded-xl mb-4"
      />

      {/* 버튼들 */}
      <div className="flex justify-around text-gray-600 text-xs mb-6">
        <div onClick={toggleSave} className="flex flex-col items-center gap-1 transition">
            <span>{isSaved ? '❤️' : '🤍'}</span>
            <span>{isSaved ? '저장취소' : '저장하기'}</span>
        </div>
        <div onClick={handleAddToCart} className="flex flex-col items-center gap-1 ">
            <span>🛒</span>
            <span>장바구니 추가</span>
        </div>
        <div onClick={handleFindRoute} className="flex flex-col items-center gap-1 cursor-pointer hover:text-blue-500 transition">
            <span>🗺️</span>
            <span>길찾기</span>
        </div>
      </div>

      {/* 기본 정보 */}
      <h2 className="font-semibold text-base mb-2">기본 정보</h2>
     <KakaoMap
        latitude={parseFloat(place.mapY)}
        longitude={parseFloat(place.mapX)}
        />
      <div className="space-y-1 mb-6 text-sm">
        <p><strong>주소</strong> {place.address}</p>
        <p><strong>전화</strong> {place.tel}</p>
        <p>
          <strong>홈페이지</strong>{' '}
          <a href={place.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
            {place.website}
          </a>
        </p>
      </div>

      {/* 이용 시간 */}
      <h2 className="font-semibold text-base mb-2 border-t pt-4">이용 가능 시간 및 공휴일</h2>
      <p className="text-blue-500">
        오늘 {place.openTime}~{place.closeTime} (입장 마감 {place.lastEntry})
      </p>

      {/* 이용팁 */}
      <h2 className="font-semibold text-base mb-2 border-t pt-4">이곳의 이용팁</h2>
      <p>{place.tips}</p>

    </DefaultLayout>
  );
};

export default PlaceDetail;
