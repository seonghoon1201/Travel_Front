import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { Progress, Flex, message, Tooltip, Drawer } from 'antd';
import DefaultLayout from '../../layouts/DefaultLayout';
import BackHeader from '../../components/header/BackHeader';
import PrimaryButton from '../../components/common/PrimaryButton';
import CategoryButton from '../../components/common/CategoryButton';
import CartButton from '../../components/common/CartButton';
import FavoriteButton from '../../components/common/FavoriteButton';
import AmountInputModal from '../../components/modal/AmountInputModal';
import { HelpCircle, AlertTriangle, XCircle, Info } from 'lucide-react';
import usePlanStore from '../../store/planStore';
import { loadKakaoMap } from '../../utils/kakaoMapLoader';
import { getPlacesByRegionTheme, getRegions } from '../../api';
import useCartStore from '../../store/cartStore';

const CATEGORIES = ['관광', '숙소', '맛집', '축제', '레저'];
const CATEGORY_TO_CONTENTTYPEID = {
  관광: 12,
  숙소: 32,
  맛집: 39,
  축제: 15,
  레저: 28,
};
const FALLBACK_IMG = '/assets/dummy.jpg';

const PlanCartPage = () => {
  const navigate = useNavigate();
  const {
    locationIds,
    locationCodes,
    setLocationCodes,
    budget,
    toggleFavorite,
    isFavorite,
  } = usePlanStore();

  const startDate = usePlanStore((s) => s.startDate);
  const endDate = usePlanStore((s) => s.endDate);

  const {
    items: cartItems,
    addToCart,
    removeByContentId,
    clear: clearCart,
    isInCart,
    ensureCart,
    loadFromServer,
  } = useCartStore();

  const [activeCategory, setActiveCategory] = useState('관광');
  const [remainingBudget, setRemainingBudget] = useState(budget);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);

  const [codePair, setCodePair] = useState(null);
  const [codeInvalid, setCodeInvalid] = useState(false);
  const [apiItems, setApiItems] = useState([]);
  const [brokenImages, setBrokenImages] = useState(() => new Set());
  const markBroken = (id) =>
    setBrokenImages((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingList, setLoadingList] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // 지도
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const kakaoRef = useRef(null);
  const markersRef = useRef([]);
  const infoWindowRef = useRef(null);

  // 지역 코드 정규화/검증
  const canonPair = useCallback(
    (o = {}) => ({
      ldongRegnCd: String(o.ldongRegnCd ?? o.lDongRegnCd ?? ''),
      ldongSignguCd: String(o.ldongSignguCd ?? o.lDongSignguCd ?? ''),
    }),
    []
  );

  const isValidPair = useCallback(
    (p) =>
      Boolean((p?.ldongRegnCd || '').trim()) &&
      Boolean((p?.ldongSignguCd || '').trim()),
    []
  );

  // 여행 일수(포함)
  const tripDays = useMemo(() => {
    if (!startDate || !endDate) return null;
    const s = new Date(String(startDate));
    const e = new Date(String(endDate));
    if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return null;
    const diff = Math.floor((e - s) / 86400000) + 1;
    return diff > 0 ? diff : null;
  }, [startDate, endDate]);

  // 최소/최대 개수
  const cartLimit = useMemo(() => (tripDays ? tripDays * 5 : null), [tripDays]);
  const cartMin = useMemo(() => (tripDays ? tripDays * 2 : null), [tripDays]);
  const isMinMet = cartMin != null ? cartItems.length >= cartMin : false;
  const overBy = cartLimit != null ? cartItems.length - cartLimit : 0;
  const underBy = cartMin != null ? Math.max(0, cartMin - cartItems.length) : 0;

  // 예산 계산
  useEffect(() => {
    const used = cartItems.reduce(
      (sum, item) => sum + (Number(item.price) || 0),
      0
    );
    setRemainingBudget(budget - used);
  }, [cartItems, budget]);

  // 지역코드 정규화/보강
  useEffect(() => {
    (async () => {
      if (!Array.isArray(locationCodes) || locationCodes.length === 0) {
        setCodePair(null);
        setCodeInvalid(true);
        return;
      }
      const first = canonPair(locationCodes[0]);
      if (isValidPair(first)) {
        setCodePair(first);
        setCodeInvalid(false);
        if (
          !locationCodes[0]?.ldongRegnCd ||
          !locationCodes[0]?.ldongSignguCd
        ) {
          setLocationCodes([first]);
        }
        return;
      }

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
          return;
        }
      } catch (e) {}

      setCodePair(null);
      setCodeInvalid(true);
      message.error(
        '선택한 지역 코드가 유효하지 않습니다. 지역을 다시 선택해 주세요.'
      );
    })();
  }, [locationCodes, locationIds, setLocationCodes, canonPair, isValidPair]);

  // 목록 불러오기
  const loadPage = useCallback(
    async (pageIndex, reset = false) => {
      if (!codePair?.ldongRegnCd || !codePair?.ldongSignguCd || codeInvalid)
        return;

      const contentTypeId = CATEGORY_TO_CONTENTTYPEID[activeCategory];
      if (!contentTypeId) return;

      try {
        setLoadingList(true);
        const data = await getPlacesByRegionTheme({
          ldongRegnCd: codePair.ldongRegnCd,
          ldongSignguCd: codePair.ldongSignguCd,
          contentTypeId,
          page: pageIndex,
          size: 20,
        });
        const content = Array.isArray(data?.content) ? data.content : [];

        const mapped = content.map((item) => {
          const imageUrl = item.firstImage || item.firstimage || '';
          return {
            contentId: String(item.contentId),
            name: item.title,
            address: `${item.address ?? ''} ${item.address2 ?? ''}`.trim(),
            price: undefined,
            imageUrl,
            hasRemoteImage: !!imageUrl,
            phone: item.tel,
            location: { lat: Number(item.mapY), lng: Number(item.mapX) },
          };
        });

        setApiItems((prev) => (reset ? mapped : [...prev, ...mapped]));
        setHasMore(
          data?.last === false && pageIndex + 1 < (data?.totalPages ?? 0)
        );
        setPage(pageIndex + 1);
      } catch (e) {
        message.error(
          e?.response?.data?.message ?? '여행지 목록을 불러오지 못했어요.'
        );
      } finally {
        setLoadingList(false);
      }
    },
    [activeCategory, codePair, codeInvalid]
  );

  // 준비 → 동기화 → 첫 페이지
  useEffect(() => {
    if (!codePair?.ldongRegnCd || !codePair?.ldongSignguCd || codeInvalid)
      return;

    (async () => {
      try {
        await ensureCart({
          ldongRegnCd: String(codePair.ldongRegnCd),
          ldongSignguCd: String(codePair.ldongSignguCd),
        });
        await loadFromServer().catch(() => {});
      } catch {
        message.error('장바구니를 준비하지 못했어요.');
      } finally {
        setApiItems([]);
        setPage(0);
        setHasMore(true);
        loadPage(0, true);
      }
    })();
  }, [
    codePair,
    activeCategory,
    ensureCart,
    loadFromServer,
    codeInvalid,
    loadPage,
  ]);

  // 카카오맵 초기화
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
      } catch {
        message.error('지도를 불러오지 못했어요.');
      }
    })();

    return () => {
      disposed = true;
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
      mapRef.current = null;
      infoWindowRef.current = null;
    };
  }, []);

  // 포인트 메모이즈
  const points = useMemo(
    () =>
      apiItems
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
        ),
    [apiItems]
  );

  // 마커 렌더
  const renderMarkers = useCallback(() => {
    const map = mapRef.current;
    const kakao = kakaoRef.current;
    if (!map || !kakao) return;

    const { maps } = kakao;
    if (markersRef.current.length) {
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
    }
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
        infoWindowRef.current?.setContent(html);
        infoWindowRef.current?.open(map, marker);
        map.panTo(pos);
      });
    });
    if (!bounds.isEmpty()) map.setBounds(bounds);
  }, [points]);

  useEffect(() => {
    renderMarkers();
  }, [renderMarkers]);

  // 리스트 클릭 시 지도 이동
  const panToItem = useCallback((item) => {
    if (!item?.location || !mapRef.current || !kakaoRef.current) return;
    const { maps } = kakaoRef.current;
    const pos = new maps.LatLng(item.location.lat, item.location.lng);
    mapRef.current.panTo(pos);
    const html = `
      <div style="padding:8px 10px;max-width:220px">
        <div style="font-weight:700;margin-bottom:4px">${item.name}</div>
        <div style="font-size:12px;color:#666">${item.address ?? ''}</div>
      </div>
    `;
    infoWindowRef.current?.setContent(html);
    infoWindowRef.current?.open(
      mapRef.current,
      new maps.Marker({ position: pos })
    );
  }, []);

  // 카트 담기/빼기
  const handleCartClick = useCallback(
    async (place) => {
      const exists = isInCart(place.contentId);
      if (exists) {
        await removeByContentId(place.contentId);
      } else {
        if (cartLimit != null && cartItems.length >= cartLimit) {
          message.warning(
            `이번 여행은 총 ${tripDays}일이라 카트는 최대 ${cartLimit}개(일×5)까지 담을 수 있어요.`
          );
          return;
        }
        setSelectedPlace(place);
        setIsModalOpen(true);
      }
    },
    [isInCart, removeByContentId, cartItems.length, cartLimit, tripDays]
  );

  const handleAddToCart = useCallback(
    async (placeWithPrice) => {
      if (
        cartLimit != null &&
        useCartStore.getState().items.length >= cartLimit
      ) {
        message.warning(
          `카트 한도(${cartLimit}개)를 초과할 수 없어요. 담긴 항목을 일부 제거해 주세요.`
        );
        setIsModalOpen(false);
        return;
      }
      const price = Number(placeWithPrice.price ?? placeWithPrice.cost ?? 0);
      await addToCart({ ...placeWithPrice, price, cost: price });
      setIsModalOpen(false);
    },
    [addToCart, cartLimit]
  );

  // 예산 게이지
  const percentUsed =
    budget > 0 ? Math.min(100, ((budget - remainingBudget) / budget) * 100) : 0;

  // 자동 일정으로 이동
  const syncCartThenGo = useCallback(async () => {
    if (!cartItems.length) {
      message.warning('장바구니가 비어있어요.');
      return;
    }
    if (cartMin != null && cartItems.length < cartMin) {
      message.warning(
        `이번 여행은 총 ${tripDays}일이라 자동 일정은 최소 ${cartMin}개(일×2) 이상 담아야 가능해요. 현재 ${cartItems.length}개로 ${underBy}개 더 담아 주세요.`
      );
      return;
    }
    if (cartLimit != null && cartItems.length > cartLimit) {
      message.warning(
        `카트가 제한(${cartLimit}개)을 ${
          cartItems.length - cartLimit
        }개 초과했어요. 일부 항목을 제거해 주세요.`
      );
      return;
    }
    try {
      setSyncing(true);
      await loadFromServer();
    } finally {
      setSyncing(false);
    }
    navigate('/plan/auto');
  }, [
    cartItems.length,
    cartLimit,
    cartMin,
    tripDays,
    underBy,
    loadFromServer,
    navigate,
  ]);

  // 타이틀용 지역명
  const [titleRegion, setTitleRegion] = useState(null);
  useEffect(() => {
    (async () => {
      try {
        const regions = await getRegions();
        const pickedId = String(locationIds?.[0] ?? '');
        const match = Array.isArray(regions)
          ? regions.find((r) => String(r.regionId) === pickedId)
          : null;
        const name = match?.regionName || match?.name || null;
        setTitleRegion(name);
      } catch {}
    })();
  }, [locationIds]);

  // 자동 일정 버튼 비활성 조건
  const disableAutoPlan =
    (cartLimit != null && cartItems.length > cartLimit) ||
    (cartMin != null && cartItems.length < cartMin);

  // ✅ 상세 페이지로 이동
  const goToDetail = useCallback(
    (id) => navigate(`/board/place/${id}`),
    [navigate]
  );

  return (
    <DefaultLayout>
      <div className="w-full mx-auto pb-32">
        <BackHeader title={`${titleRegion || '여행지'} 여행`} />
        <div className="px-4 sm:px-6 md:px-8">
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

          {/* 카테고리 탭 */}
          <div className="relative mt-6">
            <div className="flex flex-wrap gap-2 justify-center">
              {CATEGORIES.map((category) => (
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
              <button
                className="absolute top-0 right-0 p-1"
                aria-label="도움말"
              >
                <HelpCircle
                  size={18}
                  className="text-gray-500 hover:text-gray-700 cursor-pointer"
                />
              </button>
            </Tooltip>
          </div>

          {/* 안내 박스 */}
          <div className="mt-3">
            {cartLimit == null || cartMin == null ? (
              <div className="text-[12px] text-gray-600 bg-gray-50 border border-gray-200 rounded-xl p-3">
                여행 날짜를 선택하면 카트 <b>최소/최대</b> 개수 제한이
                적용됩니다.
                <span className="ml-1">(최소: 일×2, 최대: 일×5)</span>
              </div>
            ) : (
              (() => {
                const status = overBy > 0 ? 'over' : !isMinMet ? 'under' : 'ok';
                const styles = {
                  over: {
                    wrap: 'bg-red-50 border-red-200 text-red-700',
                    chipWrap: 'bg-white/70',
                    chip: 'border-red-200',
                    icon: <XCircle size={18} className="text-red-600" />,
                    title: '최대 개수 초과',
                    hint: (
                      <>
                        카트가 제한(<b>{cartLimit}개</b>)을{' '}
                        <b>{cartItems.length - cartLimit}개</b> 초과했어요. 일부
                        항목을 제거해 주세요.
                      </>
                    ),
                  },
                  under: {
                    wrap: 'bg-amber-50 border-amber-200 text-amber-800',
                    chipWrap: 'bg-white/70',
                    chip: 'border-amber-200',
                    icon: (
                      <AlertTriangle size={18} className="text-amber-600" />
                    ),
                    title: '최소 개수 미충족',
                    hint: (
                      <>
                        자동 일정을 위해 최소 <b>{cartMin}개</b> 필요해요. 현재{' '}
                        <b>{cartItems.length}개</b>로 <b>{underBy}개</b> 더
                        담아주세요.
                      </>
                    ),
                  },
                  ok: {
                    wrap: 'bg-blue-50 border-blue-200 text-blue-700',
                    chipWrap: 'bg-white/70',
                    chip: 'border-blue-200',
                    icon: <Info size={18} className="text-blue-600" />,
                    title: '요건 충족!',
                    hint: (
                      <>
                        자동 일정을 바로 만들 수 있어요. 최대{' '}
                        <b>{cartLimit}개</b>
                        까지 담을 수 있습니다.
                      </>
                    ),
                  },
                }[status];

                return (
                  <div
                    className={`rounded-xl border p-3 md:p-4 shadow-[0_1px_0_rgba(0,0,0,0.02)] ${styles.wrap}`}
                    role="alert"
                    aria-live="polite"
                  >
                    <div className="flex items-start gap-2">
                      <div className="shrink-0 mt-0.5">{styles.icon}</div>
                      <div className="grow">
                        <div className="font-semibold text-[13px] leading-5">
                          {styles.title}
                        </div>
                        <div
                          className={`mt-2 inline-flex flex-wrap items-center gap-2 rounded-lg px-2 py-2 ${styles.chipWrap}`}
                        >
                          <span
                            className={`text-[11px] px-2 py-1 rounded-md border ${styles.chip}`}
                          >
                            최소 <b>{cartMin}</b>개
                          </span>
                          <span
                            className={`text-[11px] px-2 py-1 rounded-md border ${
                              styles.chip
                            } ${
                              status === 'ok'
                                ? 'bg-blue-100/70'
                                : status === 'under'
                                ? 'bg-amber-100/70'
                                : 'bg-red-100/70'
                            }`}
                          >
                            현재 <b>{cartItems.length}</b>개
                          </span>
                          <span
                            className={`text-[11px] px-2 py-1 rounded-md border ${styles.chip}`}
                          >
                            최대 <b>{cartLimit}</b>개
                          </span>
                        </div>
                        <p className="mt-2 text-[12px] leading-6">
                          {styles.hint}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()
            )}
          </div>

          {/* 목록 */}
          <div className="mt-4 space-y-4">
            {apiItems.map((item) => {
              const isAdded = isInCart(String(item.contentId));
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
                      {item.hasRemoteImage &&
                      !brokenImages.has(String(item.contentId)) ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-14 h-14 rounded-md object-cover cursor-pointer"
                          loading="lazy"
                          onError={() => markBroken(String(item.contentId))}
                          onClick={(e) => {
                            e.stopPropagation();
                            goToDetail(String(item.contentId));
                          }}
                        />
                      ) : (
                        <div
                          className="w-14 h-14 rounded-md bg-gray-200 flex items-center justify-center text-[10px] text-gray-500 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            goToDetail(String(item.contentId));
                          }}
                        >
                          No Image
                        </div>
                      )}
                      <FavoriteButton
                        isActive={isFavorite(String(item.contentId))}
                        toggleFavorite={() =>
                          toggleFavorite(String(item.contentId))
                        }
                      />
                    </div>
                    <div>
                      <div
                        className="text-sm font-bold text-gray-800 hover:underline cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          goToDetail(String(item.contentId));
                        }}
                      >
                        {item.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.address}
                      </div>
                      <div className="text-xs text-gray-500">
                        {typeof item.price === 'number'
                          ? `₩${item.price.toLocaleString()}`
                          : '가격 입력 필요'}
                      </div>
                      {!hasGeo && (
                        <div className="text-[10px] text-gray-400">
                          지도 좌표 없음
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 오른쪽 버튼: 자세히 보기 + 카트 버튼 */}
                  <div className="flex items-center gap-2">
                    <button
                      className="text-xs px-2 py-1 rounded-md border border-blue-200 text-blue-600 hover:bg-blue-50 transition"
                      onClick={(e) => {
                        e.stopPropagation();
                        goToDetail(String(item.contentId));
                      }}
                    >
                      자세히 보기
                    </button>
                    <CartButton
                      isAdded={isAdded}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCartClick({
                          ...item,
                          contentId: String(item.contentId),
                        });
                      }}
                    />
                  </div>
                </div>
              );
            })}

            {/* 더 보기 */}
            {hasMore && (
              <button
                disabled={loadingList}
                onClick={() => loadPage(page, false)}
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

      {/* 하단 바 */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur border-t">
        <div className="mx-auto w-full px-4 sm:px-6 md:px-8 py-3 flex gap-2">
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex-1 rounded-xl border border-gray-300 py-2 text-sm"
          >
            카트 보기 ({cartItems.length}
            {cartLimit != null ? `/${cartLimit}` : ''})
          </button>
          <PrimaryButton
            onClick={syncCartThenGo}
            className="flex-1"
            disabled={disableAutoPlan}
          >
            자동 일정 짜기
          </PrimaryButton>
        </div>
      </div>

      {/* 카트 Drawer */}
      <Drawer
        title={`장바구니 (${cartItems.length}${
          cartLimit != null ? `/${cartLimit}` : ''
        })`}
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
                key={String(it.contentId)}
                className="flex items-center justify-between p-2 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={it.imageUrl || FALLBACK_IMG}
                    alt={it.name}
                    className="w-12 h-12 rounded-md object-cover cursor-pointer"
                    onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
                    onClick={(e) => {
                      e.stopPropagation();
                      goToDetail(String(it.contentId));
                    }}
                  />
                  <div>
                    <div
                      className="text-sm font-semibold hover:underline cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        goToDetail(String(it.contentId));
                      }}
                    >
                      {it.name}
                    </div>
                    <div className="text-xs text-gray-500">{it.address}</div>
                    <div className="text-xs text-gray-500">
                      ₩{Number(it.price || 0).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="text-xs text-blue-600 border border-blue-200 px-2 py-1 rounded-md hover:bg-blue-50"
                    onClick={() => goToDetail(String(it.contentId))}
                  >
                    자세히
                  </button>
                  <button
                    className="text-xs text-red-500"
                    onClick={async () => {
                      await removeByContentId(String(it.contentId));
                    }}
                  >
                    제거
                  </button>
                </div>
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
