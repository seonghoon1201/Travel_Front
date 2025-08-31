import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { CalendarPlus } from 'lucide-react';

import DefaultLayout from '../../layouts/DefaultLayout';
import BackHeader from '../../components/header/BackHeader';
import PlaceList from '../../components/board/PlaceList';
import RegionSummary from '../../components/board/RegionSummary';
import PrimaryButton from '../../components/common/PrimaryButton';

import { getWeather } from '../../api/weather/getWeather';
import { getPlacesByRegion } from '../../api/place/getPlacesByRegion';

const RegionDetailPage = () => {
  const { city } = useParams();
  const decodedCity = city ? decodeURIComponent(city) : '';

  const locationHook = useLocation();
  const state = locationHook.state || {};

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
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [places, setPlaces] = useState([]);

  // ===== 페이지네이션 상태 =====
  const [page, setPage] = useState(0);     // 현재 페이지
  const size = 20;                         // 고정: 20개씩
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true); // 다음 페이지 존재 여부 추정
  const idSetRef = useRef(new Set());      // 중복 방지

  const fetchWeather = useCallback(async () => {
    if (!decodedCity) return;

    try {
      setWeatherLoading(true);
      console.log('=== 날씨 API 호출 ===', decodedCity);
      
      // 직접 "시/군/구" 제거한 도시명으로 시도
      const cleanCityName = decodedCity.replace(/(시|군|구)$/, '');
      console.log('정제된 도시명:', cleanCityName);
      
      const response = await getWeather(cleanCityName);
      console.log('날씨 API 응답:', response);
      
      if (response.success && response.data) {
        setWeather(response.data);
      } else {
        setWeather(null);
      }
    } catch (error) {
      setWeather(null);
    } finally {
      setWeatherLoading(false);
    }
  }, [decodedCity]);

  useEffect(() => {
    if (decodedCity) {
      fetchWeather();
    }
  }, [decodedCity, fetchWeather]);

  useEffect(() => {
    setPlaces([]);
    setPage(0);
    setHasMore(true);
    idSetRef.current.clear();
  }, [decodedCity, ldongRegnCd, ldongSignguCd]);

  const fetchPage = useCallback(
    async (pageToLoad) => {
      if (!ldongRegnCd || !ldongSignguCd) return;
      if (loading) return;

      try {
        setLoading(true);

        console.log('=== getPlacesByRegion API 호출 ===');
        const apiParams = {
          ldongRegnCd: String(ldongRegnCd),
          ldongSignguCd: String(ldongSignguCd),
          page: pageToLoad,
          size, // 20개씩
        };
        console.log('API 호출 파라미터:', apiParams);

        const res = await getPlacesByRegion(apiParams);

        if (res.success && Array.isArray(res.data?.content)) {
          const batch = res.data.content;

          // 맵핑 + 중복 제거
          const next = [];
          for (const item of batch) {
            const id = item.contentId ?? item.id;
            if (!id || idSetRef.current.has(id)) continue;
            idSetRef.current.add(id);

            next.push({
              contentId: id,
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
            });
          }

          setPlaces((prev) => [...prev, ...next]);
          setHasMore(batch.length === size);
          setPage(pageToLoad);
          console.log(`페이지 ${pageToLoad} 로드: ${next.length}개 추가`);
        } else {
          setHasMore(false);
        }
      } catch (e) {
        console.warn('장소 데이터 로드 실패:', e?.message || e);
      } finally {
        setLoading(false);
      }
    },
    [ldongRegnCd, ldongSignguCd, size]
  );

  // 초기 1페이지 로드
  useEffect(() => {
    if (decodedCity && ldongRegnCd && ldongSignguCd) {
      fetchPage(0);
    } else if (decodedCity) {
      console.warn('=== 법정동 코드 누락 ===');
      console.warn('ldongRegnCd:', ldongRegnCd, typeof ldongRegnCd);
      console.warn('ldongSignguCd:', ldongSignguCd, typeof ldongSignguCd);
      setPlaces([]);
    }
  }, [decodedCity, ldongRegnCd, ldongSignguCd, fetchPage]);

  // "더 보기" 클릭 → page+1 로드
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchPage(page + 1);
    }
  };

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
        
            {weatherLoading ? (
              <div className="flex items-center justify-center px-4 py-3 bg-white rounded-lg shadow">
                <p className="text-sm text-gray-500">날씨 정보를 불러오는 중...</p>
              </div>
            ) : weather ? (
              <div className="flex items-center justify-between px-4 py-3 bg-white rounded-lg shadow">
                <div className="flex items-center gap-3">
                  <img
                    src={`https://openweathermap.org/img/wn/${weather?.weather?.[0]?.icon}@2x.png`}
                    alt={weather?.weather?.[0]?.description || 'weather'}
                    className="w-10 h-10"
                  />
                  <div className="text-sm text-gray-700">
                    <p className="font-medium">
                      최저 {weather?.main?.temp_min ?? '-'}°C 
                      <br /> 
                      최고 {weather?.main?.temp_max ?? '-'}°C
                    </p>
                    <p className="text-gray-500">
                      현재상태 : 
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
              <div className="flex items-center justify-between px-4 py-3 bg-white rounded-lg shadow">
                <p className="text-sm text-gray-400">날씨 정보를 불러올 수 없습니다.</p>
                <button
                  onClick={fetchWeather}
                  className="text-blue-500 text-sm hover:underline"
                >
                  다시 시도
                </button>
              </div>
            )}
          </div> 

          {/* 즐길거리 */}
          <div className="px-4 pt-4">
            <h3 className="text-base font-semibold text-gray-800 mb-2">즐길거리</h3>

            {/* 디버깅 정보 표시 */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-4 p-3 bg-gray-100 rounded text-xs">
                <p>디버그: ldongRegnCd = {String(ldongRegnCd)}</p>
                <p>디버그: ldongSignguCd = {String(ldongSignguCd)}</p>
                <p>디버그: places 길이 = {places.length}</p>
                <p>디버그: page = {page}, hasMore = {String(hasMore)}, loading = {String(loading)}</p>
              </div>
            )}

            <div className="space-y-3">
              {places.length > 0 ? (
                <>
                  {places.map((p) => (
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
                  ))}

                  {/* 더 보기 버튼 */}
                  <div className="pt-2 pb-16 text-center">
                    {hasMore ? (
                      <button
                        onClick={handleLoadMore}
                        disabled={loading}
                        className="px-3 py-2 text-sm rounded-lg bg-white shadow border hover:bg-gray-50 disabled:opacity-60"
                      >
                        {loading ? '불러오는 중…' : '더 보기'}
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">마지막입니다.</span>
                    )}
                  </div>
                </>
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