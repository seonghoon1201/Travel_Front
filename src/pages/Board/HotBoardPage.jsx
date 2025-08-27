import React, { useEffect, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';

import BackHeader from '../../components/header/BackHeader';
import SearchBar from '../../components/common/SearchBar';
import RegionList from '../../components/board/RegionList';
import DefaultLayout from '../../layouts/DefaultLayout';

import { fetchWikipediaData } from '../../utils/wikiApi';

// 🔹 hotCities 리스트
const hotCities = [
  '성남시',
  '서울특별시',
  '부산광역시',
  '광주광역시',
  '대전광역시',
  '제주특별자치도',
  '울산광역시',
];

const HotBoard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [regionData, setRegionData] = useState([]);

  // 🔹 위키데이터 불러오기
  useEffect(() => {
    const loadWikipediaData = async () => {
      try {
        const results = await Promise.all(
          hotCities.map(async (city) => {
            const data = await fetchWikipediaData(city);
            return {
              imageUrl: data.imageUrl,
              city: data.title,
              Province: '', // 필요하면 city에서 도 추출
              summary: data.extract,
              locations: [], // 필요시 다른 API 연결
            };
          })
        );
        setRegionData(results);
      } catch (err) {
        console.error('핫플 데이터 로드 실패:', err);
      }
    };

    loadWikipediaData();
  }, []);

  // 🔹 검색 필터
  const filteredRegionData = regionData.filter((item) =>
    item.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DefaultLayout>
      <div className="w-full max-w-sm mx-auto ">
        <BackHeader />
        <div className="pl-[1rem] pr-[1rem]">
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
                  city={item.city}
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
        </div>
      </div>
    </DefaultLayout>
  );
};

export default HotBoard;
