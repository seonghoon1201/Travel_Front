import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CalendarPlus } from 'lucide-react';

import DefaultLayout from '../../layouts/DefaultLayout';
import BackHeader from '../../components/header/BackHeader';
import PlaceList from '../../components/board/PlaceList';
import RegionSummary from '../../components/board/RegionSummary';
import PrimaryButton from '../../components/common/PrimaryButton';

import { getWeather } from '../../api';
import { searchTours } from '../../api';

const RegionDetailPage = () => {
  const { city } = useParams();
  const decodedCity = city ? decodeURIComponent(city) : '';

  const [weather, setWeather] = useState(null);
  const [places, setPlaces] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // API에 그대로 보내는 값 확인용 로그
        console.log('Weather / Tour API 호출 도시명:', decodedCity);

        // 1. 날씨 API 호출
        const weatherRes = await getWeather(decodedCity);
        if (weatherRes.success) {
          console.log('날씨 API 응답:', weatherRes.data);

          setWeather(weatherRes.data);
        } else {
          console.warn('날씨 데이터 없음');
        }

        // 2. 투어 API 호출
        const tourRes = await searchTours({
          keyword: 0, // 기본값 0
          region: decodedCity, // 그대로 전달
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
          <div className="pr-3 pl-3">
            <RegionSummary title={decodedCity} />
          </div>

          {/* 날씨 */}
          <div className="px-4 pt-4">
            <h3 className="text-base font-semibold text-gray-800 mb-2">날씨</h3>
            {weather ? (
              <div className="flex items-center justify-between px-4 py-3 bg-white rounded-lg shadow">
                {/* 왼쪽: 아이콘 + 최저/최고온도 */}
                <div className="flex items-center gap-3">
                  <img
                    src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                    alt={weather.weather[0].description}
                    className="w-10 h-10"
                  />
                  <div className="text-sm text-gray-700 pt-4 ">
                    <p className="font-medium">
                      최저 {weather.main.temp_min}°C / 최고{' '}
                      {weather.main.temp_max}°C
                    </p>
                    <p className="text-gray-500">
                      {weather.weather.description}
                    </p>
                  </div>
                </div>

                {/* 오른쪽: 날씨 보러가기 버튼 */}
                <a
                  href={`https://search.naver.com/search.naver?query=${encodeURIComponent(
                    decodedCity
                  )}+날씨`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 text-sm hover:underline"
                >
                  날씨 보러가기
                </a>
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
