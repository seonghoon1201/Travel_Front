import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import KakaoMap from '../../components/map/KakaoMap';
import DefaultLayout from '../../layouts/DefaultLayout';
import BackHeader from '../../components/header/BackHeader';

import { getTourDetail } from '../../api/tour/getTourDetail';
import { getFavorites } from '../../api/favorite/getFavorites'; 
import { toggleFavorite } from '../../api/favorite/toggleFavorite'; 
import { message } from 'antd';
import useUserStore from '../../store/userStore'; 

const PlaceDetail = () => {
  const { contentId } = useParams();
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);

  const isLoggedIn = useUserStore((s) => s.isLoggedIn); 
  const [messageApi, contextHolder] = message.useMessage();

  const extractHref = (html) => {
    const match = html.match(/href="([^"]+)"/);
    return match ? match[1] : null;
  };

  useEffect(() => {
    const fetchPlaceDetail = async () => {
      if (!contentId) {
        setError('잘못된 접근입니다.');
        setLoading(false);
        return;
      }

      setLoading(true);
      const result = await getTourDetail(contentId);

      if (result.success) {
        setPlace(result.data);
        setError(null);

        try {
          const favRes = await getFavorites();
          if (Array.isArray(favRes?.favorites)) {
            const exists = favRes.favorites.some(
              (f) => String(f.contentId) === String(contentId)
            );
            setIsSaved(exists);
          }
        } catch (err) {
        }
      } else {
        setError(result.error || '데이터를 불러올 수 없습니다.');
        setPlace(null);
      }
      setLoading(false);
    };

    fetchPlaceDetail();
  }, [contentId]);

  const handleToggleFavorite = async () => {
    if (!isLoggedIn) {
      messageApi.warning('로그인 후 이용 가능합니다!');
      return;
    }

    try {
      const res = await toggleFavorite(contentId);
      setIsSaved(res.favorite);
      setPlace((prev) => (prev ? { ...prev, favorite: res.favorite } : prev));

      if (res.favorite) {
        messageApi.success('즐겨찾기에 추가되었습니다!');
      } else {
        messageApi.info('즐겨찾기에서 제거되었습니다.');
      }
    } catch (err) {
      messageApi.error('즐겨찾기 처리에 실패했습니다.');
    }
  };

  const handleFindRoute = () => {
    if (place && place.latitude && place.longitude) {
      const kakaoUrl = `https://map.kakao.com/link/to/${place.title},${place.latitude},${place.longitude}`;
      window.open(kakaoUrl, '_blank');
      messageApi.success('카카오맵으로 이동합니다!');
    } else {
      messageApi.error('위치 정보가 없어 길찾기를 할 수 없습니다.');
    }
  };

  if (loading) {
    return (
      <DefaultLayout>
        {contextHolder}
        <div className="w-full mx-auto">
          <BackHeader />
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">로딩 중...</div>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  if (error || !place) {
    return (
      <DefaultLayout>
        {contextHolder}
        <BackHeader />
        <div className="flex justify-center items-center h-64">
          <div className="text-red-500">{error || '데이터를 찾을 수 없습니다.'}</div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      {contextHolder}
      <div className="w-full mx-auto">
        <BackHeader />

        <div className="px-4 sm:px-6 md:px-8">
          {/* 제목 & 지역 */}
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-bold">{place.title || '제목 없음'}</h1>
            <div className="flex items-center text-gray-500">
              <span className="ml-2 text-medium">📍 {place.region || ''}</span>
            </div>
          </div>

          {/* 대표 이미지 */}
          {place.image && (
            <img
              src={place.image}
              alt={place.title}
              className="w-full h-52 object-cover rounded-xl mb-4"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          )}

          {/* 버튼들 */}
          <div className="flex justify-around text-gray-600 text-medium mt-[1rem] mb-[2rem]">
            <div
              onClick={handleToggleFavorite}
              className="flex flex-col items-center gap-1 cursor-pointer transition"
            >
              <span>{isSaved ? '❤️' : '🤍'}</span>
              <span>즐겨찾기</span>
            </div>

            <div
              onClick={handleFindRoute}
              className="flex flex-col items-center gap-1 cursor-pointer hover:text-blue-500 transition"
            >
              <span>🗺️</span>
              <span>길찾기</span>
            </div>
          </div>

          {/* 기본 정보 & 지도 */}
          <h2 className="font-semibold text-base mb-2">기본 정보</h2>

          {place.latitude && place.longitude && (
            <div className="mb-4">
              <KakaoMap
                latitude={parseFloat(place.latitude)}
                longitude={parseFloat(place.longitude)}
              />
            </div>
          )}

          <div className="space-y-2 mb-6 text-sm">
            {place.address && <p><strong>주소:</strong> {place.address}</p>}
            {place.tel && <p><strong>전화:</strong> {place.tel}</p>}
            {place.homepage && (
              <p>
                <strong>홈페이지:</strong>{' '}
                <a
                  href={extractHref(place.homepage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline break-all"
                >
                  홈페이지 바로가기
                </a>
              </p>
            )}
          </div>

          {/* 개요 */}
          {place.overview && (
            <>
              <h2 className="font-semibold text-base mb-2 border-t pt-4">소개</h2>
              <p className="text-sm leading-relaxed mb-6 whitespace-pre-line">
                {place.overview}
              </p>
            </>
          )}

          {/* 추가 정보 */}
          <div className="border-t pt-4 space-y-4">
            <div>
              <p className="font-medium text-sm mb-1"><strong>카테고리</strong></p>
              <p className="text-sm text-gray-600">{place.theme || '정보 없음'}</p>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default PlaceDetail;
