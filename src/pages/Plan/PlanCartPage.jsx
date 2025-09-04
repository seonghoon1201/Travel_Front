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
import { HelpCircle } from 'lucide-react';
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

  // map refs
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const kakaoRef = useRef(null);
  const markersRef = useRef([]);
  const infoWindowRef = useRef(null);

  // 정규화/검증
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

  // ✅ 여행 일수(포함) 계산 → 한도(일×5)
  const tripDays = useMemo(() => {
    if (!startDate || !endDate) return null;
    const s = new Date(String(startDate));
    const e = new Date(String(endDate));
    if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return null;
    const diff = Math.floor((e - s) / 86400000) + 1; // inclusive
    return diff > 0 ? diff : null;
  }, [startDate, endDate]);
  const cartLimit = useMemo(() => (tripDays ? tripDays * 5 : null), [tripDays]);
  const isLimitReached = cartLimit != null && cartItems.length >= cartLimit;
  const overBy = cartLimit != null ? cartItems.length - cartLimit : 0;

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

  // 목록 불러오기 (useCallback로 경고 제거)
  const loadPage = useCallback(
    async (pageIndex, reset = false) => {
      if (!codePair?.ldongRegnCd || !codePair?.ldongSignguCd || codeInvalid)
        return;

      const contentTypeId = CATEGORY_TO_CONTENTTYPEID[activeCategory];
      if (!contentTypeId) return;

      try {
        setLoadingList(true);
        const data = await getPlacesByRegionTheme({
          // ⚠️ 백엔드 스펙에 맞춰 전달 (lDong*)
          ldongRegnCd: codePair.ldongRegnCd,
          ldongSignguCd: codePair.ldongSignguCd,
          contentTypeId,
          page: pageIndex,
          size: 20,
        });
        const content = Array.isArray(data?.content) ? data.content : [];
        // 이미지  url 콘솔에 찍기 시작
        // 주소에서 지역명 추출
        const pickRegion = (item) => {
          const direct =
            item?.sigungu || item?.sigunguName || item?.region || '';
          if (direct) return String(direct);
          const addr = `${item?.address ?? ''} ${item?.address2 ?? ''}`.trim();
          if (!addr) return '';
          const tokens = addr.split(/\s+/);
          if (tokens.length >= 2) return tokens[1];
          if (tokens.length >= 1) return tokens[0];
          return '';
        };

        // 관광공사 필드가 소문자/대문자 혼용될 수 있어 전부 체크
        const pickImage = (c) =>
          c?.firstImage ||
          c?.firstimage ||
          c?.firstImage2 ||
          c?.firstimage2 ||
          '';

        const rowsAll = content.map((c) => ({
          region: pickRegion(c),
          title: c?.title || '',
          imageUrl: pickImage(c),
          hasImage: !!pickImage(c),
        }));

        console.groupCollapsed('[places/region/theme] 전체 항목(이미지 유/무)');
        console.table(rowsAll);
        console.groupEnd();

        const missing = rowsAll.filter((r) => !r.hasImage);
        if (missing.length) {
          console.warn(
            `이미지 없는 항목 ${missing.length}건:`,
            missing.map((m) => m.title)
          );
        }
        const mapped = content.map((item) => {
          const imageUrl = item.firstImage || item.firstimage || '';
          return {
            contentId: String(item.contentId),
            name: item.title,
            address: `${item.address ?? ''} ${item.address2 ?? ''}`.trim(),
            price: undefined,
            imageUrl, // ← 기본 이미지만 (없으면 빈 문자열)
            hasRemoteImage: !!imageUrl, // ← 원격 이미지 존재 여부
            phone: item.tel,
            location: { lat: Number(item.mapY), lng: Number(item.mapX) },
          };
        });

        setApiItems((prev) => (reset ? mapped : [...prev, ...mapped]));
        // Spring Page 기준: last=true면 마지막 페이지
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

  // 코드/카테고리 변경 시: 카트 준비 → 서버 동기화 → 첫 페이지 로드
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

  const renderMarkers = useCallback(() => {
    const map = mapRef.current;
    const kakao = kakaoRef.current;
    if (!map || !kakao) return;

    const { maps } = kakao;
    // clear
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

  // 리스트 항목 클릭 → 지도 팬 & 인포윈도우
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

  // 장바구니 담기/빼기
  const handleCartClick = useCallback(
    async (place) => {
      const exists = isInCart(place.contentId);
      if (exists) {
        await removeByContentId(place.contentId);
      } else {
        // ✅ 카트 추가 전 한도 검사
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
      // ✅ 모달 제출 시에도 레이스 가드
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

  const percentUsed =
    budget > 0 ? Math.min(100, ((budget - remainingBudget) / budget) * 100) : 0;

  const syncCartThenGo = useCallback(async () => {
    if (!cartItems.length) {
      message.warning('장바구니가 비어있어요.');
      return;
    } // ✅ 한도 초과 시 자동 일정 차단
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
  }, [cartItems.length, cartLimit, loadFromServer, navigate]);

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

  return (
    <DefaultLayout>
      <div className="w-full max-w-sm mx-auto pb-32">
        <BackHeader title={`${titleRegion || '여행지'} 여행`} />
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

          {/* ✅ 카트 한도 안내 박스 */}
          <div className="mt-3">
            {cartLimit == null ? (
              <div className="text-[12px] text-gray-500">
                여행 날짜를 선택하면 카트 개수 제한(일 × 5)이 적용됩니다.
              </div>
            ) : (
              <div
                className={`text-[12px] rounded-lg border p-2 ${
                  isLimitReached
                    ? 'bg-red-50 border-red-200 text-red-600'
                    : 'bg-gray-50 border-gray-200 text-gray-700'
                }`}
              >
                이번 여행은 <b>{tripDays}일</b> 일정이에요. 카트는
                <b> {cartLimit}개 (일×5)</b>까지 담을 수 있어요.
                <br />
                현재{' '}
                <b>
                  {cartItems.length}/{cartLimit}
                </b>
                개.
                {overBy > 0 && (
                  <span className="ml-1">
                    (초과: <b>{overBy}</b>개)
                  </span>
                )}
              </div>
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
                          className="w-14 h-14 rounded-md object-cover"
                          loading="lazy"
                          onError={() => markBroken(String(item.contentId))} // 실패 시 No Image로 전환
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-md bg-gray-200 flex items-center justify-center text-[10px] text-gray-500">
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
                      <div className="text-sm font-bold text-gray-800">
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

      {/* 하단 고정 바 */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur border-t">
        <div className="mx-auto max-w-sm px-4 py-3 flex gap-2">
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex-1 rounded-xl border border-gray-300 py-2 text-sm"
          >
            카트 보기 ({cartItems.length}
            {cartLimit != null ? `/${cartLimit}` : ''})
          </button>
          <PrimaryButton onClick={syncCartThenGo} className="flex-1">
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
                    await removeByContentId(String(it.contentId));
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
