// src/pages/PlanLocationPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
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
    return window.location.protocol === 'https:'
      ? src.replace(/^http:\/\//i, 'https://')
      : src;
  }
  const base = http?.defaults?.baseURL || window.location.origin;
  const baseUrl = new URL(base, window.location.origin);
  if (src.startsWith('/')) {
    let url = baseUrl.origin + src;
    if (window.location.protocol === 'https:')
      url = url.replace(/^http:\/\//i, 'https://');
    return url;
  }
  return new URL(src, baseUrl.href).toString();
};

const PlanLocationPage = () => {
  const navigate = useNavigate();
  const { setLocationIds, setLocationCodes } = usePlanStore();

  const [searchText, setSearchText] = useState('');
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(5);

  useEffect(() => {
    (async () => {
      try {
        const regions = await getRegions();
        const mapped = regions.map((r) => ({
          id: r.regionId,
          name: r.regionName,
          description: r.description || '',
          imageUrl: normalizeImageUrl(r.regionImage || r.imageUrl),
          // 여러 케이스를 모두 수용해 ldong* 로 정규화해 저장
          ldongRegnCd: String(
            r.ldongRegnCd ??
              r.ldongRegnCd ??
              r.lDongRegnCd ??
              r.ldongRegnCd ??
              ''
          ),
          ldongSignguCd: String(
            r.ldongSignguCd ??
              r.ldongSignguCd ??
              r.lDongSignguCd ??
              r.ldongSignguCd ??
              ''
          ),
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
    setLocations((prev) => {
      const next = prev.map((loc) =>
        loc.id === id ? { ...loc, selected: !loc.selected } : loc
      );
      // 최신 상태로 로그
      const target = next.find((l) => l.id === id);
      if (target) {
        console.log('[Location] 선택 토글', {
          regionId: target.id,
          ldongRegnCd: target.ldongRegnCd,
          ldongSignguCd: target.ldongSignguCd,
          name: target.name,
          selected: target.selected,
        });
      }
      return next;
    });
  };

  const handleNext = () => {
    const selected = locations.filter((l) => l.selected);
    if (!selected.length)
      return alert('최소 한 곳 이상의 여행지를 선택해 주세요.');
    // 코드 유효성(빈 문자열만 차단 — 서버가 짧은 코드도 허용하므로)
    const missing = selected.find(
      (l) =>
        !String(l.ldongRegnCd || '').trim() ||
        !String(l.ldongSignguCd || '').trim()
    );
    if (missing) {
      message.error(
        '선택한 지역의 코드가 비어 있어요. 다른 지역을 선택해 주세요.'
      );
      return;
    }
    setLocationIds(selected.map((l) => l.id));
    const canon = (o) => ({
      ldongRegnCd: String(
        o.ldongRegnCd ?? o.ldongRegnCd ?? o.lDongRegnCd ?? o.ldongRegnCd ?? ''
      ),
      ldongSignguCd: String(
        o.ldongSignguCd ??
          o.ldongSignguCd ??
          o.lDongSignguCd ??
          o.ldongSignguCd ??
          ''
      ),
    });
    setLocationCodes(selected.map(canon));
    navigate('/plan/date');
  };

  const filtered = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return locations;
    return locations.filter(
      (l) =>
        (l.name || '').toLowerCase().includes(q) ||
        (l.description || '').toLowerCase().includes(q)
    );
  }, [locations, searchText]);

  const shown = filtered.slice(0, visibleCount);
  const canLoadMore = filtered.length > visibleCount;
  const anySelected = locations.some((l) => l.selected);

  return (
    <DefaultLayout>
      <div className="w-full max-w-sm mx-auto pb-28">
        {' '}
        {/* 고정 버튼 자리 확보 */}
        <BackHeader title="여행지 선택" />
        <div className="px-4">
          <SearchBar
            placeholder="관광지/맛집/숙소 검색"
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setVisibleCount(5);
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
                        <div className="text-xs text-gray-500">
                          {loc.description}
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

              {canLoadMore && (
                <button
                  type="button"
                  className="mt-3 w-full rounded-xl border border-gray-200 py-2 text-sm"
                  onClick={() => setVisibleCount((n) => n + 5)}
                >
                  더 보기 (+5)
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* 하단 고정 버튼 바 */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur border-t">
        <div className="mx-auto max-w-sm px-4 py-3">
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
