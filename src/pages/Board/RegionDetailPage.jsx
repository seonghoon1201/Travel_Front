import React from 'react';
import { useParams } from 'react-router-dom';

import { CalendarPlus } from 'lucide-react';
import DefaultLayout from '../../layouts/DefaultLayout';
import BackHeader from '../../components/header/BackHeader';
import PlaceList from '../../components/board/PlaceList';
import RegionSummary from '../../components/board/RegionSummary';

const RegionDetailPage = () => {
  const { city } = useParams();
  console.log(' RegionDetailPage 렌더링 중');
  console.log(city.toLowerCase());
  // 더미 데이터 
  const region = {
    city: '제주특별자치도',
    weather: {
      icon: '☀️',
      temp: '27°C',
      desc: '맑음',
    },
    places: ['성산일출봉', '한라산', '협재해변'],
  };

  return (
    <DefaultLayout>
      <BackHeader />
      <div className="w-full min-h-screen bg-[#F8FBFF]">
        {/* 사진 + 요약 정보 */}

        <RegionSummary title="제주특별자치도" />

        {/* 날씨 정보 */}
        <div className="px-4 py-2 flex items-center gap-2 text-sm text-gray-700">
          <span className="text-xl">{region.weather.icon}</span>
          <span>{region.weather.temp}</span>
          <span className="text-gray-500">· {region.weather.desc}</span>
        </div>

        {/* 즐길거리 리스트 */}
        <div className="px-4 pt-4">
          <h3 className="text-base font-semibold text-gray-800 mb-2">
            즐길거리
          </h3>
          <div >
            {region.places.map((place, idx) => (
              <PlaceList key={idx} name={place} />
            ))}
          </div>
        </div>

       {/* 일정 만들기 버튼  */}
        <div className="fixed bottom-4 left-0 w-full px-4 z-50">
          <button className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white py-3 rounded-xl text-sm shadow">
            <CalendarPlus className="w-4 h-4" />
            이 지역으로 일정 만들기
          </button>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default RegionDetailPage;
