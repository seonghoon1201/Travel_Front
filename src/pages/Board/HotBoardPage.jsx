import React, { useEffect, useState, useMemo } from 'react';
import { SlidersHorizontal } from 'lucide-react';

import BackHeader from '../../components/header/BackHeader';
import SearchBar from '../../components/common/SearchBar';
import RegionList from '../../components/board/RegionList';
import DefaultLayout from '../../layouts/DefaultLayout';

import { getHotRegions } from '../../api/region/getHotRegions';

const DEFAULT_IMAGE = '/images/default_place.jpg';
const LIMIT = 20; // 필요 개수로 조절

const HotBoard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [regionData, setRegionData] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 백엔드 핫플 불러오기
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const res = await getHotRegions(LIMIT);
      if (res.success) {
        // 중복 제거 + RegionList에 맞게 가공
        const seen = new Set();
        const mapped = [];
        for (const r of res.data) {
          const name = r.regionName?.trim();
          if (!name || seen.has(name)) continue;
          seen.add(name);
          mapped.push({
            imageUrl: r.regionImage || DEFAULT_IMAGE,
            city: name,               // 도시/지역명
            Province: r.regionCode || '', // 시/도 코드(있으면)
            summary: r.description || '',
            locations: [],            // 필요 시 추후 연동
          });
        }
        setRegionData(mapped);
      } else {
        setRegionData([]);
      }
      setLoading(false);
    };
    load();
  }, []);

  // 🔹 검색 필터(대소문자/공백 안전)
  const filteredRegionData = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return regionData;
    return regionData.filter((item) =>
      (item.city || '').toLowerCase().includes(q)
      || (item.Province || '').toLowerCase().includes(q)
    );
  }, [regionData, searchTerm]);

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

          {/* 리스트 */}
          <div className="space-y-4 mt-4 px-2">
            {loading ? (
              // 스켈레톤
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-20 rounded-xl bg-gray-100 animate-pulse" />
              ))
            ) : filteredRegionData.length > 0 ? (
              filteredRegionData.map((item, index) => (
                <RegionList
                  key={index}
                  imageUrl={item.imageUrl || DEFAULT_IMAGE}
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
