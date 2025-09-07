import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import SearchBar from '../components/common/SearchBar';
import DefaultLayout from '../layouts/DefaultLayout';
import BackHeader from '../components/header/BackHeader';
import RegionList from '../components/board/RegionList';

import { getHotRegions } from '../api/region/getHotRegions';

const LIMIT = 100;

const SearchPage = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [regionData, setRegionData] = useState([]);
  const [loading, setLoading] = useState(true);

  // 데이터 로드
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await getHotRegions(LIMIT);
        if (res.success) {
          const seen = new Set();
          const mapped = [];

          for (const r of res.data) {
            const name = r.regionName?.trim();
            if (!name || seen.has(name)) continue;
            seen.add(name);

            mapped.push({
              imageUrl: r.regionImage || '/images/default_place.jpg',
              city: name,
              Province: r.regionCode || '',
              summary: r.description || '',
              locations: [],
              ldongRegnCd: r.ldongRegnCd || '',
              ldongSignguCd: r.ldongSignguCd || '',
            });
          }

          setRegionData(mapped);
        } else {
          setRegionData([]);
        }
      } catch (error) {
        setRegionData([]);
      }
      setLoading(false);
    };

    load();
  }, []);

  // 한글 초성 추출 함수
  const getInitialConsonants = (str) => {
    const initials = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
    return str.split('').map(char => {
      const code = char.charCodeAt(0);
      if (code >= 44032 && code <= 55203) { // 한글 완성형 범위
        const index = Math.floor((code - 44032) / 588);
        return initials[index];
      }
      return char;
    }).join('');
  };

  const filteredRegionData = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return regionData;
    
    return regionData.filter((item) => {
      const city = (item.city || '').toLowerCase();
      const summary = (item.summary || '').toLowerCase();
      
      // 기본 텍스트 검색
      const textMatch = city.includes(q) || summary.includes(q);
      
      // 한글 초성 검색
      let initialMatch = false;
      if (/[ㄱ-ㅎ]/.test(searchTerm)) { // 초성이 포함된 경우만
        const cityInitials = getInitialConsonants(item.city || '');
        const summaryInitials = getInitialConsonants(item.summary || '');
        initialMatch = cityInitials.includes(searchTerm) || summaryInitials.includes(searchTerm);
      }
      
      return textMatch || initialMatch;
    });
  }, [regionData, searchTerm]);

  return (
    <DefaultLayout>
      <div className="w-full mx-auto">
        <BackHeader />

        <div className="sm:px-6  md:px-8">
          {/* 검색창 */}
          <div className="w-full mb-4">
            <SearchBar
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="지역을 검색해보세요 !"
            />
          </div>

          {/* 상단 설명 영역 */}
          <div className="flex items-start justify-between px-2 pt-4 py-2">
            <div>
              <p className="text-lg font-semibold text-[#222]">
                {searchTerm ? `"${searchTerm}" 검색 결과` : '🔍 지역 검색'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {searchTerm
                  ? `${filteredRegionData.length}개의 지역을 찾았습니다.`
                  : '원하는 지역을 검색해서 여행 계획을 세워보세요!'}
              </p>
            </div>
          </div>

          {/* 리스트 */}
          <div className="space-y-4  pb-8">
            {loading ? (
              // 로딩 스켈레톤
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-20 rounded-xl bg-gray-100 animate-pulse" />
              ))
            ) : filteredRegionData.length > 0 ? (
              filteredRegionData.map((item, index) => (
                <RegionList
                  key={`${item.city}-${index}`}
                  imageUrl={item.imageUrl}
                  city={item.city}
                  summary={item.summary}
                  locations={item.locations}
                  ldongRegnCd={item.ldongRegnCd}
                  ldongSignguCd={item.ldongSignguCd}  
                  onClick={() =>
                    navigate(`/region/detail/${encodeURIComponent(item.city)}`, {
                      state: {
                        ldongRegnCd: item.ldongRegnCd,
                        ldongSignguCd: item.ldongSignguCd,
                        from: 'search',
                      },
                    })
                  }
                />
              ))
            ) : (
              <div className="text-center py-12">
                {searchTerm ? (
                  <>
                    <p className="text-sm text-gray-400 mb-2">
                      "{searchTerm}"에 대한 검색 결과가 없습니다.
                    </p>
                    <p className="text-xs text-gray-400">다른 키워드로 검색해보세요.</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-gray-400 mb-2">지역 데이터가 없습니다.</p>
                    <p className="text-xs text-gray-400">잠시 후 다시 시도해주세요.</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default SearchPage;