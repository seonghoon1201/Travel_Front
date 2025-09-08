import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import DefaultLayout from '../../layouts/DefaultLayout';
import BackHeader from '../../components/header/BackHeader';
import PrimaryButton from '../../components/common/PrimaryButton';
import { message } from 'antd';
import useScheduleStore from '../../store/scheduleStore';

import { getSchedule } from '../../api';
import { getFavorites } from '../../api/favorite/getFavorites';
import { getPlacesByRegion } from '../../api/place/getPlacesByRegion';
import { createScheduleItem } from '../../api';

// 👇 RegionDetailPage와 동일한 리스트 컴포넌트 사용
import PlaceList from '../../components/board/PlaceList';

const dedupBy = (arr, seen, item) => {
  const id = String(item.contentId ?? item.id ?? '');
  if (!id || seen.has(id)) return;
  seen.add(id);
  arr.push(item);
};

const AddPlace = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sp] = useSearchParams();

  // === 입력(라우터/쿼리) ===
  const scheduleId = location.state?.scheduleId || sp.get('scheduleId') || '';
  const dayNumber = Number(location.state?.dayNumber || sp.get('day')) || 1;

  // 라우터/쿼리에서 받은 지역코드(초기값)
  const initRegn = location.state?.ldongRegnCd || sp.get('ldongRegnCd') || '';
  const initSigngu =
    location.state?.ldongSignguCd || sp.get('ldongSignguCd') || '';

  // === 화면 상태 ===
  const [favorites, setFavorites] = useState([]); // PlaceList 포맷
  const [places, setPlaces] = useState([]); // PlaceList 포맷
  const [favLoading, setFavLoading] = useState(false);
  const [placeLoading, setPlaceLoading] = useState(false);

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const seenRef = useRef(new Set());

  const [selected, setSelected] = useState(new Set());
  const selectedCount = selected.size;

  const [baseOrder, setBaseOrder] = useState(1);

  // ✅ 이 상태만 믿고 동작: 지역코드(없으면 스케줄에서 채움)
  const [regionCodes, setRegionCodes] = useState({
    ldongRegnCd: initRegn,
    ldongSignguCd: initSigngu,
  });

  const detail = useScheduleStore((s) => s.detail);
  const setDetail = useScheduleStore((s) => s.setDetail);

  // 서버 0-베이스 여부 감지
  const isZeroBased = useMemo(() => {
    const items = Array.isArray(detail?.scheduleItems)
      ? detail.scheduleItems
      : [];
    return (
      items.some((it) => Number(it.dayNumber) === 0) ||
      items.some((it) => Number(it.order) === 0)
    );
  }, [detail]);

  // ↓↓↓ 기본 검증 + baseOrder 계산 + (지역코드 채우기)
  useEffect(() => {
    if (!scheduleId) {
      message.warning('scheduleId가 없어 돌아갑니다.');
      navigate(-1);
      return;
    }
    (async () => {
      try {
        // 스토어에 없으면 한 번 로드
        const res =
          detail &&
          String(detail.scheduleId ?? detail.id) === String(scheduleId)
            ? detail
            : await getSchedule(scheduleId);
        if (res && res !== detail) setDetail(res);

        const items = Array.isArray((res ?? detail)?.scheduleItems)
          ? (res ?? detail).scheduleItems
          : [];

        // baseOrder 계산
        const serverDay = isZeroBased ? dayNumber - 1 : dayNumber; // 서버 포맷
        const maxOrderInDay = items
          .filter((it) => Number(it.dayNumber) === serverDay)
          .reduce(
            (m, it) => Math.max(m, Number(it.order ?? 0)),
            isZeroBased ? -1 : 0
          );
        setBaseOrder(maxOrderInDay + 1);

        // 같은 Day의 첫 아이템에서 지역코드 사용 (없으면 아무 아이템에서라도)
        const byDay = items.find(
          (it) =>
            Number(it.dayNumber) === serverDay &&
            it.ldongRegnCd &&
            it.ldongSignguCd
        );
        const anyWithCode = items.find(
          (it) => it.ldongRegnCd && it.ldongSignguCd
        );

        const c1 = byDay?.ldongRegnCd ?? anyWithCode?.ldongRegnCd ?? '';
        const c2 = byDay?.ldongSignguCd ?? anyWithCode?.ldongSignguCd ?? '';
        if (c1 && c2)
          setRegionCodes({
            ldongRegnCd: String(c1),
            ldongSignguCd: String(c2),
          });
      } catch (e) {
        console.warn('[AddPlace] init fail', e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scheduleId, dayNumber]);

  // ===== 1) 즐겨찾기(전역) : PlaceList 포맷으로 맵핑 =====
  useEffect(() => {
    (async () => {
      try {
        setFavLoading(true);
        const res = await getFavorites({ page: 0, size: 100 });
        const list = Array.isArray(res?.favorites) ? res.favorites : [];
        setFavorites(
          list.map((x) => {
            const cid = String(x.contentId ?? x.id);
            // 숫자 문자열만 들어온 경우 제목 대체
            const rawTitle = x.placeTitle || x.title || '';
            const destination =
              /^\d+$/.test(String(rawTitle)) && cid === String(rawTitle)
                ? '이름 없는 장소'
                : rawTitle || '이름 없는 장소';

            return {
              contentId: cid,
              destination,
              category: x.tema || x.theme || '기타',
              location: x.address || '',
              opentime: x.openTime || '-',
              closetime: x.closeTime || '-',
              tel: x.tel || '정보 없음',
              imageUrl: x.placeImage || x.imageUrl || x.firstImage || '',
              __isFavorite: true,
            };
          })
        );
      } catch (e) {
        console.error('[AddPlace] favorites load fail', e);
      } finally {
        setFavLoading(false);
      }
    })();
  }, []);

  // ===== 2) 지역 장소 로드 (PlaceList 포맷) =====
  const loadPlaces = async (pageToLoad) => {
    const { ldongRegnCd, ldongSignguCd } = regionCodes;
    if (!ldongRegnCd || !ldongSignguCd) return;
    if (placeLoading) return;

    try {
      setPlaceLoading(true);
      const res = await getPlacesByRegion({
        ldongRegnCd: String(ldongRegnCd),
        ldongSignguCd: String(ldongSignguCd),
        page: pageToLoad,
        size: 20,
      });

      const content = res?.data?.content ?? res?.content ?? [];
      const next = [];
      for (const it of content) {
        const cid = String(it.contentId ?? it.id);
        const rawTitle = it.title || it.placeTitle || '';
        const destination =
          /^\d+$/.test(String(rawTitle)) && cid === String(rawTitle)
            ? '이름 없는 장소'
            : rawTitle || '이름 없는 장소';

        const mapped = {
          contentId: cid,
          destination,
          category:
            it.lclsSystm3 ||
            it.lclsSystm2 ||
            it.lclsSystm1 ||
            it.cat3 ||
            it.cat2 ||
            it.cat1 ||
            '기타',
          location: it.address || '',
          opentime: it.openTime || '-',
          closetime: it.closeTime || '-',
          tel: it.tel || '정보 없음',
          imageUrl: it.firstImage || it.imageUrl || '',
        };
        dedupBy(next, seenRef.current, mapped);
      }
      setPlaces((prev) => [...prev, ...next]);
      setHasMore(content.length === 20);
      setPage(pageToLoad);
    } catch (e) {
      console.error('[AddPlace] region places load fail', e);
    } finally {
      setPlaceLoading(false);
    }
  };

  // 지역코드가 준비되면 첫 페이지 로드
  useEffect(() => {
    setPlaces([]);
    setPage(0);
    setHasMore(true);
    seenRef.current.clear();
    if (regionCodes.ldongRegnCd && regionCodes.ldongSignguCd) {
      loadPlaces(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regionCodes.ldongRegnCd, regionCodes.ldongSignguCd]);

  // ===== 3) 선택/해제 =====
  const toggleSelect = (cid) => {
    setSelected((prev) => {
      const n = new Set(prev);
      const id = String(cid);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  // ===== 4) 저장 =====
  const [saving, setSaving] = useState(false);
  const handleAddSelected = async () => {
    if (!selectedCount) return message.info('추가할 장소를 선택하세요.');
    try {
      setSaving(true);
      const ids = Array.from(selected);
      const serverDay = isZeroBased ? dayNumber - 1 : dayNumber;

      await Promise.all(
        ids.map((cid, idx) =>
          createScheduleItem(scheduleId, {
            contentId: String(cid),
            dayNumber: serverDay,
            memo: '',
            cost: 0,
            order: baseOrder + idx,
          })
        )
      );

      // 최신 스케줄 재조회 → 스토어 반영
      const fresh = await getSchedule(scheduleId);
      setDetail(fresh);
      message.success('선택한 장소를 추가했어요.');
      navigate(-1);
    } catch (e) {
      console.error('[AddPlace] save fail', e?.response?.data || e);
      message.error('추가에 실패했어요.');
    } finally {
      setSaving(false);
    }
  };

  // ===== 5) Selectable Row (PlaceList 래퍼) =====
  const SelectableRow = ({ item }) => {
    const cid = String(item.contentId);
    const checked = selected.has(cid);

    return (
      <div
        onClick={() => toggleSelect(cid)}
        className={`relative rounded-xl ${
          checked ? 'ring-2 ring-blue-400' : ''
        }`}
      >
        {/* PlaceList 자체는 클릭 이벤트를 먹지 않게 만들어 선택만 하도록 */}
        <div className="pointer-events-none">
          <PlaceList
            contentId={cid}
            destination={item.destination}
            category={item.category}
            location={item.location}
            opentime={item.opentime}
            closetime={item.closetime}
            tel={item.tel}
            imageUrl={item.imageUrl}
          />
        </div>

        {/* 체크박스 (우상단) */}
        <label
          className="absolute top-3 right-3 cursor-pointer"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            className="w-5 h-5 align-middle"
            readOnly
            checked={checked}
            onChange={() => {}}
          />
        </label>
      </div>
    );
  };

  // 힌트 문구도 regionCodes 기준
  const regionHint = useMemo(() => {
    if (!regionCodes.ldongRegnCd || !regionCodes.ldongSignguCd)
      return '지역 코드가 없어 즐겨찾기만 표시됩니다.';
    return '';
  }, [regionCodes.ldongRegnCd, regionCodes.ldongSignguCd]);

  return (
    <DefaultLayout>
      <BackHeader title="장소 추가" />
      <div className="px-4 sm:px-6 md:px-8 pb-20">
        {/* 즐겨찾기 섹션 */}
        <h3 className="text-base font-semibold mb-2">즐겨찾기</h3>
        {favLoading ? (
          <div className="text-sm text-gray-400 py-6">불러오는 중…</div>
        ) : favorites.length ? (
          <div className="space-y-2 mb-6">
            {favorites.map((f) => (
              <SelectableRow key={f.contentId} item={f} />
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-400 mb-6">즐겨찾기가 없어요.</div>
        )}

        {/* 지역 장소 섹션 */}
        <div className="flex items-baseline justify-between mb-2">
          <h3 className="text-base font-semibold">이 지역의 장소</h3>
          {regionHint && (
            <span className="text-xs text-red-400">{regionHint}</span>
          )}
        </div>

        {regionCodes.ldongRegnCd && regionCodes.ldongSignguCd ? (
          <>
            <div className="space-y-2">
              {places.map((p) => (
                <SelectableRow key={p.contentId} item={p} />
              ))}
            </div>

            <div className="text-center mt-3">
              {hasMore ? (
                <button
                  disabled={placeLoading}
                  onClick={() => loadPlaces(page + 1)}
                  className="px-3 py-2 text-sm rounded-lg bg-white shadow border hover:bg-gray-50 disabled:opacity-60"
                >
                  {placeLoading ? '불러오는 중…' : '더 보기'}
                </button>
              ) : (
                <span className="text-xs text-gray-400">마지막입니다.</span>
              )}
            </div>
          </>
        ) : null}

        {/* 하단 고정 추가 버튼 */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-3">
          <PrimaryButton
            disabled={saving || selectedCount === 0}
            onClick={handleAddSelected}
            className="w-full"
          >
            {saving ? '추가 중…' : `선택한 ${selectedCount}개 추가`}
          </PrimaryButton>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default AddPlace;
