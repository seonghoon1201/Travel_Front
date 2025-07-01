import React, { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';

import BackHeader from '../components/header/BackHeader';
import SearchBar from '../components/common/SearchBar';
import RegionList from '../components/board/RegionList';
import DefaultLayout from '../layouts/DefaultLayout';

const HotBoard = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // 🔹 예시 지역 데이터
  const regionData = [
    {
      imageUrl: 'https://example.com/seogwipo.jpg',
      City: '서귀포시',
      Province: '제주도',
      summary:
        '서귀포에 대한 내용 요약 부분서귀포에 대한 내용 요약 부분서귀포에 대한 내용 요약 부분서귀포에 대한 내용 요약 부분서귀포에 대한 내용 요약 부분서귀포에 대한 내용 요약 부분',
      locations: ['아쿠아플라넷', '감귤 농장', '올레시장', '몰라', '어렵네'],
    },
    {
      imageUrl: 'https://example.com/gangneung.jpg',
      City: '강릉시',
      Province: '강원도',
      summary: '30자 이상 넘어가면 ... ',
      locations: ['경포해변', '안목해변'],
    },
  ];

  // 🔹 City 기준 검색 필터
  const filteredRegionData = regionData.filter((item) =>
    item.City.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DefaultLayout>
      <BackHeader />

      {/* 검색창 */}
      <div className="w-full mb-4">
        <SearchBar
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* 상단 설명 영역 */}
      <div className="flex items-start justify-between px-2 pt-4 py-2">
        <div>
          <p className="text-lg font-semibold text-[#222]">📍핫플 여행지</p>
          <p className="text-sm text-gray-500 mt-1">
            사람들이 많이 가는 곳으로 추천해드려요!
          </p>
        </div>
        <div className="text-right pt-3 pr-2">
          <p className="text-xs font-medium text-[#333] flex items-center justify-end gap-1">
            <SlidersHorizontal className="w-4 h-4" />
            금액 조정하기
          </p>
          <p className="text-sm text-gray-500 mt-1">
            예산 : <span className="font-semibold text-black">원</span>
          </p>
        </div>
      </div>

      {/* 핫플 리스트 */}
      <div className="space-y-4 mt-4 px-2">
        {filteredRegionData.length > 0 ? (
          filteredRegionData.map((item, index) => (
            <RegionList
              key={index}
              imageUrl={item.imageUrl}
              City={item.City}
              Province={item.Province}
              summary={item.summary}
              locations={item.locations}
            />
          ))
        ) : (
          <p className="text-sm text-center text-gray-400">
            검색 결과가 없습니다.
          </p>
        )}
      </div>
    </DefaultLayout>
  );
};

export default HotBoard;
