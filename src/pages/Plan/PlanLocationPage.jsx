// src/pages/Plan/PlanLocationPage.jsx
import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback,
} from 'react';
import { useNavigate } from 'react-router-dom';

import DefaultLayout from '../../layouts/DefaultLayout';
import SearchBar from '../../components/common/SearchBar';
import CategoryButton from '../../components/common/CategoryButton';
import PrimaryButton from '../../components/common/PrimaryButton';
import BackHeader from '../../components/header/BackHeader';

import usePlanStore from '../../store/planStore';
import { message } from 'antd';
import { getRegions } from '../../api';
import http from '../../utils/authAxios';

const FALLBACK_IMG = '/assets/logo.jpg';

const normalizeImageUrl = (raw) => {
  if (!raw) return FALLBACK_IMG;
  let src = String(raw)
    .trim()
    .replace(/^"(.*)"$/, '$1');
  if (/^data:/.test(src)) return src;
  if (/^https?:\/\//i.test(src)) {
    return src.replace(/^http:\/\//i, 'https://');
  }
  const base = http?.defaults?.baseURL || window.location.origin;
  const baseUrl = new URL(base, window.location.origin);
  if (src.startsWith('/')) {
    let url = baseUrl.origin + src;
    if (window.location.protocol === 'https:')
      url = url.replace(/^http:\/\//i, 'https://');
    return url;
  }
  return new URL(src, baseUrl.href)
    .toString()
    .replace(/^http:\/\//i, 'https://');
};

const PlanLocationPage = () => {
  const navigate = useNavigate();
  const { setLocationIds, setLocationCodes } = usePlanStore();
  const setSelectedRegionMeta = usePlanStore((s) => s.setSelectedRegionMeta);

  const [searchText, setSearchText] = useState('');
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  //  페이지 단위 (처음 10개)
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // 관찰할 sentinel
  const loaderRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const regions = await getRegions();
        const mapped = regions.map((r) => ({
          id: r.regionId,
          name: r.regionName,
          imageUrl: normalizeImageUrl(r.regionImage || r.imageUrl),
          ldongRegnCd: String(r.ldongRegnCd ?? r.lDongRegnCd ?? ''),
          ldongSignguCd: String(r.ldongSignguCd ?? r.lDongSignguCd ?? ''),
          selected: false,
        }));
        setLocations(mapped);
      } catch (e) {
        console.error(e);
        message.error('지역 정보를 불러오지 못했어요.');
        setLocations([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSelect = (id) => {
    setLocations((prev) =>
      prev.map((loc) =>
        loc.id === id
          ? { ...loc, selected: !loc.selected }
          : { ...loc, selected: false }
      )
    );
  };

  const handleNext = () => {
    const selected = locations.find((l) => l.selected);
    if (!selected) {
      return alert('여행지를 하나 선택해 주세요.');
    }

    if (!selected.ldongRegnCd || !selected.ldongSignguCd) {
      message.error(
        '선택한 지역의 코드가 비어 있어요. 다른 지역을 선택해 주세요.'
      );
      return;
    }

    setLocationIds([selected.id]);
    setLocationCodes([
      {
        ldongRegnCd: selected.ldongRegnCd,
        ldongSignguCd: selected.ldongSignguCd,
      },
    ]);
    setSelectedRegionMeta({ name: selected.name, imageUrl: selected.imageUrl });
    navigate('/plan/date', {
      state: {
        ldongRegnCd: selected.ldongRegnCd,
        ldongSignguCd: selected.ldongSignguCd,
        city: selected.name,
        imageUrl: selected.imageUrl,
      },
    });
  };

  // 검색
  const filtered = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return locations;
    return locations.filter((l) => (l.name || '').toLowerCase().includes(q));
  }, [locations, searchText]);

  //  페이지 단위로 잘라서 보여주기
  const shown = filtered.slice(0, page * pageSize);
  const canLoadMore = shown.length < filtered.length;

  // IntersectionObserver로 무한 스크롤
  const loadMore = useCallback(() => {
    if (canLoadMore) setPage((p) => p + 1);
  }, [canLoadMore]);

  useEffect(() => {
    if (!loaderRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 1 }
    );

    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [loadMore]);

  const anySelected = locations.some((l) => l.selected);

  return (
    <DefaultLayout>
      <div className="w-full mx-auto pb-28">
        <BackHeader title="여행지 선택" />
        <div className="px-4 sm:px-6 md:px-8">
          <SearchBar
            placeholder="관광지/맛집/숙소 검색"
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setPage(1); //  검색할 때 페이지 초기화
            }}
          />

          {loading ? (
            <div className="mt-6 text-sm text-gray-500">불러오는 중...</div>
          ) : (
            <>
              <div className="mt-4 space-y-4">
                {shown.map((loc) => (
                  <div
                    key={loc.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={loc.imageUrl || FALLBACK_IMG}
                        alt={loc.name}
                        className="w-12 h-12 rounded-full object-cover"
                        onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="font-bold text-gray-800 text-sm">
                          {loc.name}
                        </div>
                      </div>
                    </div>
                    <CategoryButton
                      label={loc.selected ? '취소' : '선택'}
                      isActive={loc.selected}
                      onClick={() => handleSelect(loc.id)}
                    />
                  </div>
                ))}
                {!shown.length && (
                  <div className="text-xs text-gray-500">
                    검색 결과가 없어요.
                  </div>
                )}
              </div>

              {/* 무한 스크롤 sentinel */}
              {canLoadMore && <div ref={loaderRef} className="h-10" />}
            </>
          )}
        </div>
      </div>

      {/* 하단 고정 버튼 바 */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur border-t footer-safe">
        <div className="mx-auto w-full px-4 sm:px-6 md:px-8 py-3">
          <PrimaryButton
            onClick={handleNext}
            className="w-full"
            disabled={!anySelected}
          >
            선택 완료
          </PrimaryButton>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default PlanLocationPage;
