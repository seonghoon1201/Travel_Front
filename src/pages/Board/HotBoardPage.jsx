// src/pages/board/HotBoard.jsx (파일명은 기존 경로에 맞춰주세요)
import React, { useEffect, useState, useMemo } from 'react';

import BackHeader from '../../components/header/BackHeader';
import SearchBar from '../../components/common/SearchBar';
import RegionList from '../../components/board/RegionList';
import DefaultLayout from '../../layouts/DefaultLayout';

import { getHotRegions } from '../../api/region/getHotRegions';

const DEFAULT_IMAGE = '/images/default_place.jpg';
const LIMIT = 100; // 필요 개수로 조절

const HotBoard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [regionData, setRegionData] = useState([]);
  const [loading, setLoading] = useState(true);

  // ⬇️ ADDED: 맨 위로 버튼 표시 여부
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const res = await getHotRegions(LIMIT);
      if (res.success) {
        const seen = new Set();
        const mapped = [];
        for (const r of res.data) {
          const name = r.regionName?.trim();
          if (!name || seen.has(name)) continue;
          seen.add(name);
          mapped.push({
            imageUrl: r.regionImage || DEFAULT_IMAGE,
            city: name,
            Province: r.regionCode || '',
            summary: r.description || '',
            locations: [],
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

  const filteredRegionData = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return regionData;
    return regionData.filter(
      (item) =>
        (item.city || '').toLowerCase().includes(q) ||
        (item.Province || '').toLowerCase().includes(q)
    );
  }, [regionData, searchTerm]);

  // ⬇️ ADDED: 스크롤 감지해서 버튼 표시
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const y =
            window.scrollY ||
            document.documentElement.scrollTop ||
            document.body.scrollTop ||
            0;
          setShowTop(y > 200); // 200px 넘으면 표시
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // 초기 상태 계산
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ⬇️ ADDED: 맨 위로 이동
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <DefaultLayout>
      <div className="w-full mx-auto">
        <BackHeader />
        <div className="px-4 sm:px-6 md:px-8">
          <div className="mb-4">
            <SearchBar
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-start justify-between px-2 pt-4 py-2">
            <div>
              <p className="text-lg font-semibold text-[#222]">📍핫플 여행지</p>
              <p className="text-sm text-gray-500 mt-1">
                사람들이 많이 가는 곳으로 추천해드려요!
              </p>
            </div>
          </div>

          {/* 리스트 */}
          <div className="space-y-4 px-2 mb-[1rem]">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-20 rounded-xl bg-gray-100 animate-pulse"
                />
              ))
            ) : filteredRegionData.length > 0 ? (
              filteredRegionData.map((item, index) => (
                <RegionList
                  key={index}
                  imageUrl={item.imageUrl || DEFAULT_IMAGE}
                  city={item.city}
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

        {/* ⬇️ ADDED: 맨 위로 버튼 (떠있는 고정 버튼) */}
        {showTop && (
          <button
            type="button"
            onClick={scrollToTop}
            aria-label="맨 위로 가기"
            className="
              fixed bottom-20 right-5 z-50
              h-11 w-11 rounded-full
              bg-white/95 border border-gray-200 shadow-lg backdrop-blur
              flex items-center justify-center
              text-gray-700 text-lg
              active:translate-y-[1px] active:shadow-md
            "
          >
            ↑
          </button>
        )}
      </div>
    </DefaultLayout>
  );
};

export default HotBoard;
