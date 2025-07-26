import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CalendarPlus } from 'lucide-react';

import DefaultLayout from '../../layouts/DefaultLayout';
import BackHeader from '../../components/header/BackHeader';
import PlaceList from '../../components/board/PlaceList';
import RegionSummary from '../../components/board/RegionSummary';
import PrimaryButton from '../../components/common/PrimaryButton';

import { getWeather } from '../../api/weather/getWeather';
import { searchTours } from '../../api/tour/searchTour';

const RegionDetailPage = () => {
  const { city } = useParams();
  const decodedCity = city ? decodeURIComponent(city) : '';

  const [weather, setWeather] = useState(null);
  const [places, setPlaces] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 도시명 축약 (백엔드 region 필드 맞추기)
        const normalizedCity = decodedCity
          .replace('특별자치도', '')
          .replace('광역시', '')
          .replace('특별시', '')
          .trim();

        // 1. 날씨 API 호출
        const weatherRes = await getWeather(normalizedCity);
        if (weatherRes.success) {
          setWeather(weatherRes.data);
        } else {
          console.warn('날씨 데이터 없음');
        }

        // 2. 투어 API 호출 (keyword도 반드시 값 넣기)
        const tourRes = await searchTours({
          keyword: 0,
          region: normalizedCity,
          category: '관광지',
          page: 0,
          size: 20,
        });

        if (tourRes.success && tourRes.data?.content) {
          const processedPlaces = tourRes.data.content.map((item) => ({
            id: item.contentId,
            name: item.title,
            imageUrl: item.firstImage || '/images/default_place.jpg',
            description: item.overview,
            lat: parseFloat(item.mapY),
            lng: parseFloat(item.mapX),
          }));
          setPlaces(processedPlaces);
        } else {
          setPlaces([]);
        }
      } catch (err) {
        console.error('RegionDetailPage API 에러:', err);
        setPlaces([]);
      }
    };

    if (decodedCity) fetchData();
  }, [decodedCity]);

  return (
    <DefaultLayout>
      <div className="w-full max-w-sm mx-auto">
        <BackHeader />
        <div className="w-full min-h-screen bg-[#F8FBFF]">
          {/* 요약 */}
          <RegionSummary title={decodedCity} />

          {/* 날씨 */}
          <div className="px-4 pt-4">
            <h3 className="text-base font-semibold text-gray-800 mb-2">날씨</h3>
            {weather ? (
              <div className="px-4 py-2 flex items-center gap-2 text-sm text-gray-700">
                <span className="text-xl">☀️</span>
                <span>{weather.main.temp}°C</span>
                <span className="text-gray-500">
                  · {weather.weather.description}
                </span>
              </div>
            ) : (
              <p className="text-sm text-gray-400">
                날씨 정보를 불러올 수 없습니다.
              </p>
            )}
          </div>

          {/* 즐길거리 */}
          <div className="px-4 pt-4">
            <h3 className="text-base font-semibold text-gray-800 mb-2">
              즐길거리
            </h3>
            <div className="space-y-3">
              {places.length > 0 ? (
                places.map((place) => (
                  <PlaceList
                    key={place.id}
                    name={place.name}
                    imageUrl={place.imageUrl}
                    description={place.description}
                  />
                ))
              ) : (
                <p className="text-sm text-gray-400">즐길거리가 없습니다.</p>
              )}
            </div>
          </div>
        </div>

        {/* 일정 만들기 버튼 */}
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 z-50">
          <PrimaryButton className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm shadow">
            <CalendarPlus className="w-4 h-4" />이 지역으로 일정 만들기
          </PrimaryButton>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default RegionDetailPage;
