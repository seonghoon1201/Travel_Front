import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { CalendarPlus } from 'lucide-react';

import DefaultLayout from '../../layouts/DefaultLayout';
import BackHeader from '../../components/header/BackHeader';
import PlaceList from '../../components/board/PlaceList';
import RegionSummary from '../../components/board/RegionSummary';
import PrimaryButton from '../../components/common/PrimaryButton';

import { getWeather } from '../../api';
import { getPlacesByRegion } from '../../api/place/getPlacesByRegion';

const RegionDetailPage = () => {
  const { city } = useParams();
  const decodedCity = city ? decodeURIComponent(city) : '';

  const locationHook = useLocation();
  const state = locationHook.state || {};
  // ✅ state 우선, 없으면 쿼리스트링(lDong/ldong 모두 수용)에서 폴백
  const searchParams = new URLSearchParams(locationHook.search);
  const ldongRegnCd =
    state.ldongRegnCd ??
    state.lDongRegnCd ??
    searchParams.get('ldongRegnCd') ??
    searchParams.get('lDongRegnCd') ??
    '';
  const ldongSignguCd =
    state.ldongSignguCd ??
    state.lDongSignguCd ??
    searchParams.get('ldongSignguCd') ??
    searchParams.get('lDongSignguCd') ??
    '';

  const [weather, setWeather] = useState(null);
  const [places, setPlaces] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('=== RegionDetailPage 데이터 로딩 시작 ===');
        console.log('도시명:', decodedCity);
        console.log('받은 state:', state);
        console.log('ldongRegnCd:', ldongRegnCd);
        console.log('ldongSignguCd:', ldongSignguCd);

        // 날씨 API 호출
        // const weatherRes = await getWeather(decodedCity);
        // if (weatherRes.success) {
        //   setWeather(weatherRes.data);
        //   console.log('날씨 데이터 로드 성공');
        // } else {
        //   console.warn('날씨 데이터 없음:', weatherRes.error);
        // }

        // 지역별 장소 API 호출
        if (ldongRegnCd && ldongSignguCd) {
          console.log('=== getPlacesByRegion API 호출 ===');
          const apiParams = {
            // 내부 변수명은 소문자 유지, 래퍼에서 lDong*로 변환해 전송
            ldongRegnCd: String(ldongRegnCd),
            ldongSignguCd: String(ldongSignguCd),
            page: 0,
            size: 20,
          };
          console.log('API 호출 파라미터:', apiParams);

          const placesRes = await getPlacesByRegion(apiParams);

          if (placesRes.success && Array.isArray(placesRes.data?.content)) {
            const processed = placesRes.data.content.map((item, index) => {
              const processedItem = {
                contentId: item.contentId,
                destination: item.title,
                category:
                  item.lclsSystm3 ||
                  item.lclsSystm2 ||
                  item.lclsSystm1 ||
                  item.cat3 ||
                  item.cat2 ||
                  item.cat1 ||
                  '기타',
                location: item.address || '',
                opentime: item.openTime || '-',
                closetime: item.closeTime || '-',
                tel: item.tel || '-',
                imageUrl: item.firstImage || '/images/default_place.jpg',
              };

              console.log(`처리된 아이템 ${index + 1}:`, processedItem);
              return processedItem;
            });

            setPlaces(processed);
            console.log(`총 ${processed.length}개 장소 설정 완료`);
          } else {
            console.warn('장소 데이터 처리 실패');
            setPlaces([]);
          }
        } else {
          console.warn('=== 법정동 코드 누락 ===');
          console.warn('ldongRegnCd:', ldongRegnCd, typeof ldongRegnCd);
          console.warn('ldongSignguCd:', ldongSignguCd, typeof ldongSignguCd);
          setPlaces([]);
        }
      } catch (err) {
        setPlaces([]);
      }
    };

    if (decodedCity) {
      fetchData();
    } else {
      console.warn('decodedCity가 없음:', city);
    }
    // search(쿼리 변경)로 들어오는 값도 반영되도록 locationHook.search는 의존성에 넣지 않아도
    // ldongRegnCd/ldongSignguCd가 이미 이를 반영하므로 아래 배열로 충분합니다.
  }, [decodedCity, ldongRegnCd, ldongSignguCd]);

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
          {/* <div className="px-4 pt-4">
            <h3 className="text-base font-semibold text-gray-800 mb-2">날씨</h3>
            {weather ? (
              <div className="flex items-center justify-between px-4 py-3 bg-white rounded-lg shadow">
                <div className="flex items-center gap-3">
                  <img
                    src={`https://openweathermap.org/img/wn/${weather?.weather?.[0]?.icon}@2x.png`}
                    alt={weather?.weather?.[0]?.description || 'weather'}
                    className="w-10 h-10"
                  />
                  <div className="text-sm text-gray-700">
                    <p className="font-medium">
                      최저 {weather?.main?.temp_min ?? '-'}°C / 최고 {weather?.main?.temp_max ?? '-'}°C
                    </p>
                    <p className="text-gray-500">
                      {weather?.weather?.[0]?.description ?? ''}
                    </p>
                  </div>
                </div>
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
              <p className="text-sm text-gray-400">날씨 정보를 불러올 수 없습니다.</p>
            )}
          </div> */}

          {/* 즐길거리 */}
          <div className="px-4 pt-4">
            <h3 className="text-base font-semibold text-gray-800 mb-2">즐길거리</h3>

            {/* 디버깅 정보 표시 */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-4 p-3 bg-gray-100 rounded text-xs">
                <p>디버그: ldongRegnCd = {String(ldongRegnCd)}</p>
                <p>디버그: ldongSignguCd = {String(ldongSignguCd)}</p>
                <p>디버그: places 길이 = {places.length}</p>
              </div>
            )}

            <div className="space-y-3">
              {places.length > 0 ? (
                places.map((p) => (
                  <PlaceList
                    key={p.contentId}
                    contentId={p.contentId}
                    destination={p.destination}
                    category={p.category}
                    location={p.location}
                    opentime={p.opentime}
                    closetime={p.closetime}
                    tel={p.tel}
                    imageUrl={p.imageUrl}
                  />
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-400 mb-2">즐길거리가 없습니다.</p>
                  {(!ldongRegnCd || !ldongSignguCd) && (
                    <p className="text-xs text-red-400">
                      법정동 코드가 누락되었습니다.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 일정 만들기 버튼 */}
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 z-50">
          <PrimaryButton className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm shadow">
            <CalendarPlus className="w-4 h-4" />
            이 지역으로 일정 만들기
          </PrimaryButton>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default RegionDetailPage;
