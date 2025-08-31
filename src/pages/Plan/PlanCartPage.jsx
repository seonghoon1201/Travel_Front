// src/pages/Plan/PlanCartPage.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Progress, Flex, message, Tooltip, Drawer } from 'antd';
import DefaultLayout from '../../layouts/DefaultLayout';
import BackHeader from '../../components/header/BackHeader';
import PrimaryButton from '../../components/common/PrimaryButton';
import CategoryButton from '../../components/common/CategoryButton';
import CartButton from '../../components/common/CartButton';
import FavoriteButton from '../../components/common/FavoriteButton';
import AmountInputModal from '../../components/modal/AmountInputModal';
import { HelpCircle } from 'lucide-react';
import usePlanStore from '../../store/planStore';
import { loadKakaoMap } from '../../utils/kakaoMapLoader';
import { getPlacesByRegionTheme, getRegions } from '../../api';
import useCartStore from '../../store/cartStore';

const THEMES = ['관광', '맛집', '숙소', '힐링', '레저'];
const THEME_PARAM_MAP = {
  관광: '관광지',
  맛집: '맛집',
  숙소: '숙소',
  힐링: '힐링',
  레저: '레저',
};

const FALLBACK_IMG = '/assets/dummy.jpg';

const PlanCartPage = () => {
  const navigate = useNavigate();
  const {
    locationIds,
    locationCodes,
    setLocationCodes,
    budget,
    favorites,
    toggleFavorite,
    isFavorite,
  } = usePlanStore();

  // cart 전용 스토어
  const {
    items: cartItems,
    addToCart,
    setCartItems,
    removeByContentId,
    clear: clearCart,
    loadFromServer,
    isInCart,
  } = useCartStore();

  const [activeCategory, setActiveCategory] = useState('관광');
  const [remainingBudget, setRemainingBudget] = useState(budget);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);

  const [codePair, setCodePair] = useState(null);
  const [codeInvalid, setCodeInvalid] = useState(false);
  const [apiItems, setApiItems] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingList, setLoadingList] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);

  // 지도 refs
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const kakaoRef = useRef(null);
  const markersRef = useRef([]);
  const infoWindowRef = useRef(null);

  const canonPair = (o = {}) => ({
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
  const isValidPair = (p) =>
    Boolean((p?.ldongRegnCd || '').trim()) &&
    Boolean((p?.ldongSignguCd || '').trim());

  // 장바구니 불러오기
  useEffect(() => {
    loadFromServer().catch(() => {
      message.error('장바구니 조회에 실패했습니다.');
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 예산 계산
  useEffect(() => {
    const used = cartItems.reduce(
      (sum, item) => sum + (Number(item.price) || 0),
      0
    );
    setRemainingBudget(budget - used);
  }, [cartItems, budget]);

  // 지역 코드(법정동/시군구) 지정: PlanLocationPage에서 넣어둔 locationCodes 사용
  useEffect(() => {
    (async () => {
      if (!Array.isArray(locationCodes) || locationCodes.length === 0) {
        console.warn(
          '[Cart] locationCodes가 비어있음: 지역 선택부터 진행 필요'
        );
        setCodePair(null);
        setCodeInvalid(true);
        return;
      }
      // 1차: store 값 정규화
      const first = canonPair(locationCodes[0]);
      if (isValidPair(first)) {
        setCodePair(first);
        setCodeInvalid(false);
        // 저장된 필드 키가 달랐다면 한 번 정규화해서 덮어쓰기
        if (
          !locationCodes[0]?.ldongRegnCd ||
          !locationCodes[0]?.ldongSignguCd
        ) {
          setLocationCodes([first]);
        }
        return;
      }

      // 2차: /regions 조회 → locationIds[0]로 정확한 코드 재매핑
      try {
        const regions = await getRegions();
        const pickedId = String(locationIds?.[0] ?? '');
        const match = (regions || []).find(
          (r) => String(r.regionId) === pickedId
        );
        const fromRegions = canonPair(match);
        if (isValidPair(fromRegions)) {
          setLocationCodes([fromRegions]);
          setCodePair(fromRegions);
          setCodeInvalid(false);
          console.log('[Cart] 코드 보완 성공 (regions 기반)', fromRegions);
          return;
        }
      } catch (e) {
        console.warn('[Cart] /regions 매핑 실패', e);
      }

      // 3차: 실패 — 사용자 안내 및 요청 차단
      setCodePair(null);
      setCodeInvalid(true);
      console.warn(
        '[Cart] 유효한 법정동/시군구 코드를 찾을 수 없음',
        locationCodes[0]
      );
      message.error(
        '선택한 지역 코드가 유효하지 않습니다. 지역을 다시 선택해 주세요.'
      );
    })();
  }, [locationCodes, locationIds, setLocationCodes]);

  // 테마/페이지에 따른 목록 로드
  const fetchList = async (reset = false) => {
    // 코드가 유효하지 않으면 호출 금지
    if (!codePair?.ldongRegnCd || !codePair?.ldongSignguCd || codeInvalid)
      return;
    const themeParam = '관광지';
    const nextPage = reset ? 0 : page;
    try {
      setLoadingList(true);
      console.log('[Cart] GET /places/region/theme', {
        ldongRegnCd: codePair.ldongRegnCd,
        ldongSignguCd: codePair.ldongSignguCd,
        theme: themeParam,
        page: nextPage,
        size: 20,
      });
      const data = await getPlacesByRegionTheme({
        ldongRegnCd: codePair.ldongRegnCd,
        ldongSignguCd: codePair.ldongSignguCd,
        theme: themeParam,
        page: nextPage,
        size: 20,
      });
      const content = Array.isArray(data?.content) ? data.content : [];
      console.log('[Cart] fetchList response meta', {
        totalElements: data?.totalElements,
        totalPages: data?.totalPages,
        pageNumber: data?.number,
        numberOfElements: data?.numberOfElements,
        first: data?.first,
        last: data?.last,
        sample: content.slice(0, 3),
      });
      const mapped = content.map((item) => ({
        contentId: item.contentId,
        name: item.title,
        address: `${item.address ?? ''} ${item.address2 ?? ''}`.trim(),
        price: Math.floor(Math.random() * 10000) + 1000, // 임시가격
        imageUrl: item.firstImage || FALLBACK_IMG,
        phone: item.tel,
        location: {
          lat: Number(item.mapY), // 위도
          lng: Number(item.mapX), // 경도
        },
      }));

      setApiItems((prev) => (reset ? mapped : [...prev, ...mapped]));
      setHasMore(
        data?.last === false || nextPage + 1 < (data?.totalPages ?? 0)
      );
      setPage(reset ? 1 : nextPage + 1);
    } catch (e) {
      console.error('[Cart] places fetch error', e?.response?.data || e);
      message.error(
        e?.response?.data?.message ?? '여행지 목록을 불러오지 못했어요.'
      );
    } finally {
      setLoadingList(false);
    }
  };

  // 지역코드/테마 바뀌면 초기화 후 첫 페이지 로드
  useEffect(() => {
    if (!codePair?.ldongRegnCd || !codePair?.ldongSignguCd || codeInvalid)
      return;
    setApiItems([]);
    setPage(0);
    setHasMore(true);
    fetchList(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codePair, activeCategory]);

  // Kakao Map 초기화
  useEffect(() => {
    let disposed = false;
    (async () => {
      try {
        const Kakao = await loadKakaoMap();
        if (disposed) return;
        kakaoRef.current = Kakao;

        const { maps } = Kakao;
        const defaultCenter = new maps.LatLng(37.5665, 126.978);
        const map = new maps.Map(mapContainerRef.current, {
          center: defaultCenter,
          level: 6,
        });
        mapRef.current = map;
        infoWindowRef.current = new maps.InfoWindow({ zIndex: 2 });
        renderMarkers();
      } catch (e) {
        console.error('Kakao map init failed', e);
        message.error('지도를 불러오지 못했어요.');
      }
    })();

    return () => {
      disposed = true;
      clearMarkers();
      mapRef.current = null;
      infoWindowRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 아이템 변경 시 마커 갱신
  useEffect(() => {
    if (!mapRef.current || !kakaoRef.current) return;
    renderMarkers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiItems, activeCategory]);

  const clearMarkers = () => {
    if (markersRef.current.length) {
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
    }
  };

  const points = useMemo(() => {
    return apiItems
      .map((it) => ({
        id: it.contentId,
        name: it.name,
        address: it.address,
        lat: it?.location?.lat,
        lng: it?.location?.lng,
      }))
      .filter(
        (p) =>
          typeof p.lat === 'number' &&
          typeof p.lng === 'number' &&
          !Number.isNaN(p.lat) &&
          !Number.isNaN(p.lng)
      );
  }, [apiItems]);

  const renderMarkers = () => {
    const map = mapRef.current;
    const { maps } = kakaoRef.current;
    clearMarkers();
    if (!points.length) return;

    const bounds = new maps.LatLngBounds();

    points.forEach((p) => {
      const pos = new maps.LatLng(p.lat, p.lng);
      const marker = new maps.Marker({ position: pos, clickable: true });
      marker.setMap(map);
      markersRef.current.push(marker);
      bounds.extend(pos);

      const html = `
        <div style="padding:8px 10px;max-width:220px">
          <div style="font-weight:700;margin-bottom:4px">${p.name}</div>
          <div style="font-size:12px;color:#666">${p.address ?? ''}</div>
        </div>
      `;
      maps.event.addListener(marker, 'click', () => {
        infoWindowRef.current.setContent(html);
        infoWindowRef.current.open(map, marker);
        map.panTo(pos);
      });
    });

    if (!bounds.isEmpty()) map.setBounds(bounds);
  };

  // 리스트 항목 클릭 → 지도 팬 & 인포윈도우
  const panToItem = (item) => {
    if (!item?.location || !mapRef.current) return;
    const { maps } = kakaoRef.current;
    const pos = new maps.LatLng(item.location.lat, item.location.lng);
    mapRef.current.panTo(pos);
    const html = `
      <div style="padding:8px 10px;max-width:220px">
        <div style="font-weight:700;margin-bottom:4px">${item.name}</div>
        <div style="font-size:12px;color:#666">${item.address ?? ''}</div>
      </div>
    `;
    infoWindowRef.current.setContent(html);
    infoWindowRef.current.open(
      mapRef.current,
      new maps.Marker({ position: pos })
    );
  };

  // 장바구니 담기/빼기
  const handleCartClick = async (place) => {
    const exists = isInCart(place.contentId);
    if (exists) {
      await removeByContentId(place.contentId); // 서버 DELETE 후 스토어 갱신
    } else {
      setSelectedPlace(place);
      setIsModalOpen(true); // 가격 입력 → onSubmit에서 addToCart 호출
    }
  };

  const handleAddToCart = async (placeWithPrice) => {
    const price = Number(placeWithPrice.price ?? placeWithPrice.cost ?? 0);
    await addToCart({ ...placeWithPrice, price, cost: price });
    setIsModalOpen(false);
  };

  const itemsToShow = apiItems;
  const percentUsed =
    budget > 0 ? Math.min(100, ((budget - remainingBudget) / budget) * 100) : 0;

  // 서버 동기화: 로컬 카트를 서버 카트로 전송
  const syncCartThenGo = async () => {
    if (!cartItems.length) {
      message.warning('장바구니가 비어있어요.');
      return;
    }
    // 🔎 사용자가 버튼 누를 때 카트 상태 로그
    console.log('[PlanCart] 자동 일정 짜기 클릭 - cartItems', cartItems);
    navigate('/plan/auto');
  };

  return (
    <DefaultLayout>
      <div className="w-full max-w-sm mx-auto pb-32">
        <BackHeader title={`${locationIds?.[0] || '여행지'} 여행`} />
        <div className="px-4">
          {/* 지도 */}
          <div className="w-full h-64 rounded-lg bg-gray-200 overflow-hidden">
            <div ref={mapContainerRef} className="w-full h-full" />
          </div>

          {/* 예산/프로그레스 */}
          <div className="mt-4">
            <p className="text-sm text-center flex justify-center items-center gap-1">
              현재 설정하신 예산에서{' '}
              <span
                className={
                  remainingBudget < 0
                    ? 'text-red-500 font-bold'
                    : 'text-blue-500 font-bold'
                }
              >
                {remainingBudget.toLocaleString()}원{' '}
                {remainingBudget < 0 ? '초과' : '여유'}
              </span>{' '}
              입니다.
            </p>
            <Flex gap="small" vertical className="mt-2">
              <Progress
                percent={percentUsed}
                status={remainingBudget < 0 ? 'exception' : 'active'}
              />
            </Flex>
          </div>

          {/* 테마 탭 */}
          <div className="relative mt-6">
            <div className="flex flex-wrap gap-2 justify-center">
              {THEMES.map((category) => (
                <CategoryButton
                  key={category}
                  label={category}
                  isActive={activeCategory === category}
                  onClick={() => setActiveCategory(category)}
                />
              ))}
            </div>

            <Tooltip
              title={
                <div className="text-sm leading-5">
                  ❤️ 즐겨찾기는 가고 싶은 모든 장소를 모아둘 수 있어요.
                  <br />
                  🛒 장바구니에 추가된 장소를 최대한 활용해 일정을 짜드립니다.
                </div>
              }
              placement="left"
            >
              <button className="absolute top-0 right-0 p-1">
                <HelpCircle
                  size={18}
                  className="text-gray-500 hover:text-gray-700 cursor-pointer"
                />
              </button>
            </Tooltip>
          </div>

          {/* 목록 */}
          <div className="mt-4 space-y-4">
            {itemsToShow.map((item) => {
              const isAdded = isInCart(item.contentId);
              const hasGeo =
                !!item?.location &&
                typeof item.location.lat === 'number' &&
                typeof item.location.lng === 'number';

              return (
                <div
                  key={item.contentId}
                  className="relative flex items-center justify-between p-2 border rounded-lg"
                  onClick={() => hasGeo && panToItem(item)}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={item.imageUrl || FALLBACK_IMG}
                        alt={item.name}
                        className="w-14 h-14 rounded-md object-cover"
                        onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
                      />
                      <FavoriteButton
                        isActive={isFavorite(item.contentId)}
                        toggleFavorite={() => toggleFavorite(item.contentId)}
                      />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-800">
                        {item.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.address}
                      </div>
                      <div className="text-xs text-gray-500">
                        ₩{item.price.toLocaleString()}
                      </div>
                      {!hasGeo && (
                        <div className="text-[10px] text-gray-400">
                          지도 좌표 없음
                        </div>
                      )}
                    </div>
                  </div>
                  <CartButton
                    isAdded={isAdded}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCartClick(item);
                    }}
                  />
                </div>
              );
            })}

            {/* 더 보기 */}
            {hasMore && (
              <button
                disabled={loadingList}
                onClick={() => fetchList(false)}
                className="mt-2 w-full rounded-xl border border-gray-200 py-2 text-sm disabled:opacity-50"
              >
                {loadingList ? '불러오는 중...' : '더 보기'}
              </button>
            )}
          </div>

          {/* 수량/가격 입력 모달 */}
          {selectedPlace && (
            <AmountInputModal
              visible={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onSubmit={handleAddToCart}
              place={selectedPlace}
            />
          )}
        </div>
      </div>

      {/* 하단 고정 바: 카트 보기 + 자동 일정 짜기 */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur border-t">
        <div className="mx-auto max-w-sm px-4 py-3 flex gap-2">
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex-1 rounded-xl border border-gray-300 py-2 text-sm"
          >
            카트 보기 ({cartItems.length})
          </button>
          <PrimaryButton onClick={syncCartThenGo} className="flex-1">
            자동 일정 짜기
          </PrimaryButton>
        </div>
      </div>

      {/* 카트 보기 Drawer */}
      <Drawer
        title={`장바구니 (${cartItems.length})`}
        placement="bottom"
        height="70%"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        destroyOnClose
      >
        {cartItems.length === 0 ? (
          <div className="text-sm text-gray-500">담긴 장소가 없어요.</div>
        ) : (
          <div className="space-y-3">
            {cartItems.map((it) => (
              <div
                key={it.contentId}
                className="flex items-center justify-between p-2 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={it.imageUrl || FALLBACK_IMG}
                    alt={it.name}
                    className="w-12 h-12 rounded-md object-cover"
                    onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
                  />
                  <div>
                    <div className="text-sm font-semibold">{it.name}</div>
                    <div className="text-xs text-gray-500">{it.address}</div>
                    <div className="text-xs text-gray-500">
                      ₩{Number(it.price || 0).toLocaleString()}
                    </div>
                  </div>
                </div>
                <button
                  className="text-xs text-red-500"
                  onClick={async () => {
                    await removeByContentId(it.contentId);
                  }}
                >
                  제거
                </button>
              </div>
            ))}
            <button
              className="w-full rounded-xl border border-gray-300 py-2 text-sm"
              onClick={async () => {
                await clearCart();
              }}
            >
              전체 비우기
            </button>
          </div>
        )}
      </Drawer>

      {/* 동기화 로딩 오버레이 */}
      {syncing && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-xl px-6 py-4 shadow">
            <div className="text-sm font-semibold">장바구니 동기화 중...</div>
          </div>
        </div>
      )}
    </DefaultLayout>
  );
};

export default PlanCartPage;
