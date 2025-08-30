// src/pages/PlanCartPage.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Progress, Flex, message, Tooltip } from 'antd';
import DefaultLayout from '../../layouts/DefaultLayout';
import BackHeader from '../../components/header/BackHeader';
import PrimaryButton from '../../components/common/PrimaryButton';
import CategoryButton from '../../components/common/CategoryButton';
import CartButton from '../../components/common/CartButton';
import FavoriteButton from '../../components/common/FavoriteButton';
import AmountInputModal from '../../components/modal/AmountInputModal';
import { HelpCircle } from 'lucide-react';
import usePlanStore from '../../store/planStore';
import { loadKakao } from '../../utils/kakao';

const dummyItems = {
  관광: [
    {
      id: 1,
      name: '아쿠아플라넷 제주',
      address: '서귀포시 성산읍 섭지코지로 95',
      price: 30000,
      imageUrl: '/assets/dummy.jpg',
      // 예시 좌표(섭지코지 인근)
      location: { lat: 33.4426, lng: 126.9208 },
    },
    {
      id: 2,
      name: '성산일출봉',
      address: '서귀포시 성산읍 일출로 284-12',
      price: 10000,
      imageUrl: '/assets/dummy.jpg',
      location: { lat: 33.459, lng: 126.9425 },
    },
  ],
  맛집: [],
  숙소: [],
  힐링: [],
  레저: [],
};

const PlanCartPage = () => {
  const navigate = useNavigate();
  const {
    locationIds,
    budget,
    cartItems,
    favorites,
    toggleFavorite,
    isFavorite,
    addToCart,
    setCartItems,
  } = usePlanStore();

  const [activeCategory, setActiveCategory] = useState('관광');
  const [remainingBudget, setRemainingBudget] = useState(budget);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);

  // ✅ API 응답 아이템 상태
  const [apiItems, setApiItems] = useState([]);

  const API_BASE_URL = process.env.REACT_APP_API_URL;

  // ---------- 지도 관련 refs ----------
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null); // kakao.maps.Map 인스턴스
  const kakaoRef = useRef(null); // window.Kakao
  const markersRef = useRef([]); // 생성된 마커들
  const infoWindowRef = useRef(null); // 하나의 인포윈도우 재사용

  useEffect(() => {
    const used = cartItems.reduce((sum, item) => sum + item.price, 0);
    setRemainingBudget(budget - used);
  }, [cartItems, budget]);

  const handleFetchItems = async (category) => {
    setApiItems([]); // 새 카테고리 선택 시 초기화
    try {
      const res = await fetch(
        `${API_BASE_URL}/tour/search?category=${encodeURIComponent(
          category
        )}&page=0&size=20`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );
      if (!res.ok) throw new Error('API 요청 실패');
      const result = await res.json();

      const parsed = result.content.map((item) => ({
        id: item.contentId,
        name: item.title,
        address: `${item.addr1 ?? ''} ${item.addr2 ?? ''}`.trim(),
        price: Math.floor(Math.random() * 10000) + 1000,
        imageUrl: item.firstImage || '/assets/dummy.jpg',
        phone: item.tel,
        location: {
          lat: Number(item.mapY), // 위도
          lng: Number(item.mapX), // 경도
        },
      }));

      setApiItems(parsed);
    } catch (err) {
      console.error(err);
      message.error('여행지 정보를 불러오지 못했어요.');
    }
  };

  const handleCartClick = (place) => {
    const isAlreadyInCart = cartItems.some((item) => item.id === place.id);
    if (isAlreadyInCart) {
      setCartItems(cartItems.filter((item) => item.id !== place.id));
      message.info('장바구니에서 제거되었습니다.');
    } else {
      setSelectedPlace(place);
      setIsModalOpen(true);
    }
  };

  const handleAddToCart = (placeWithPrice) => {
    addToCart(placeWithPrice);
    message.success('장바구니에 추가되었습니다.');
  };

  // 리스트에 사용/지도에 사용할 현재 카테고리 아이템
  const itemsToShow = useMemo(
    () => (apiItems.length > 0 ? apiItems : dummyItems[activeCategory] || []),
    [apiItems, activeCategory]
  );

  // 좌표가 유효한 아이템만 추리기
  const points = useMemo(() => {
    return itemsToShow
      .map((it) => ({
        id: it.id,
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
  }, [itemsToShow]);

  // ---------- 지도 초기화 ----------
  useEffect(() => {
    let disposed = false;
    (async () => {
      try {
        const Kakao = await loadKakao();
        if (disposed) return;
        kakaoRef.current = Kakao;

        const { maps } = window.kakao;
        // 초기 중심: 유효한 포인트가 있으면 첫 포인트, 없으면 서울시청
        const defaultCenter = points[0]
          ? new maps.LatLng(points[0].lat, points[0].lng)
          : new maps.LatLng(37.5665, 126.978);

        const map = new maps.Map(mapContainerRef.current, {
          center: defaultCenter,
          level: 6,
        });
        mapRef.current = map;
        infoWindowRef.current = new maps.InfoWindow({ zIndex: 2 });

        // 초깃값 마커 렌더
        renderMarkers();
      } catch (e) {
        console.error('Kakao map init failed', e);
        message.error('지도를 불러오지 못했어요.');
      }
    })();

    return () => {
      disposed = true;
      // 마커 정리
      clearMarkers();
      mapRef.current = null;
      infoWindowRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 최초 1회

  // ---------- 아이템 변경 시 마커 갱신 ----------
  useEffect(() => {
    if (!mapRef.current || !kakaoRef.current) return;
    renderMarkers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points]);

  // 마커 삭제
  const clearMarkers = () => {
    if (markersRef.current.length) {
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
    }
  };

  // 마커 렌더 + bounds 피팅
  const renderMarkers = () => {
    const map = mapRef.current;
    const { maps } = window.kakao;
    clearMarkers();
    if (!points.length) return;

    const bounds = new maps.LatLngBounds();

    points.forEach((p) => {
      const pos = new maps.LatLng(p.lat, p.lng);
      const marker = new maps.Marker({ position: pos, clickable: true });
      marker.setMap(map);
      markersRef.current.push(marker);
      bounds.extend(pos);

      // 인포윈도우 내용 (간단)
      const html = `
        <div style="padding:8px 10px;max-width:200px">
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

    // 모든 마커가 보이도록
    if (!bounds.isEmpty()) {
      map.setBounds(bounds);
    }
  };

  // 리스트 아이템 클릭 시 해당 위치로 이동
  const panToItem = (item) => {
    if (!item?.location || !mapRef.current) return;
    const { maps } = window.kakao;
    const pos = new maps.LatLng(item.location.lat, item.location.lng);
    mapRef.current.panTo(pos);
    // 간단히 인포윈도우도 열기
    const html = `
      <div style="padding:8px 10px;max-width:200px">
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

  const percentUsed =
    budget > 0 ? Math.min(100, ((budget - remainingBudget) / budget) * 100) : 0;

  return (
    <DefaultLayout>
      <div className="w-full max-w-sm mx-auto">
        <BackHeader title={`${locationIds[0] || '여행지'} 여행`} />
        <div className="px-4">
          {/* ✅ 지도 영역 */}
          <div className="w-full h-64 rounded-lg bg-gray-200 overflow-hidden">
            <div ref={mapContainerRef} className="w-full h-full" />
          </div>

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

          <div className="relative mt-6">
            <div className="flex flex-wrap gap-2 justify-center">
              {Object.keys(dummyItems).map((category) => (
                <CategoryButton
                  key={category}
                  label={category}
                  isActive={activeCategory === category}
                  onClick={() => {
                    setActiveCategory(category);
                    handleFetchItems(category); // ✅ API 호출
                  }}
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

          <div className="mt-4 space-y-4">
            {itemsToShow.map((item) => {
              const isAdded = cartItems.some(
                (cartItem) => cartItem.id === item.id
              );
              const hasGeo = !!(
                item?.location &&
                typeof item.location.lat === 'number' &&
                typeof item.location.lng === 'number'
              );

              return (
                <div
                  key={item.id}
                  className="relative flex items-center justify-between p-2 border rounded-lg"
                  onClick={() => hasGeo && panToItem(item)}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-14 h-14 rounded-md object-cover"
                      />
                      <FavoriteButton
                        isActive={isFavorite(item.id)}
                        toggleFavorite={() => toggleFavorite(item.id)}
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
          </div>

          <PrimaryButton
            className="mt-8 w-full"
            onClick={() => navigate('/plan/auto')}
          >
            자동 일정 짜기
          </PrimaryButton>

          {cartItems.length > 0 && (
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 shadow-md z-10">
              <div className="flex items-center justify-between text-sm font-semibold">
                <span>🛒 {cartItems.length}개 장소 선택됨</span>
                <span
                  className={
                    remainingBudget < 0 ? 'text-red-500' : 'text-gray-800'
                  }
                >
                  총 ₩
                  {cartItems
                    .reduce((sum, item) => sum + item.price, 0)
                    .toLocaleString()}
                </span>
              </div>
            </div>
          )}

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
    </DefaultLayout>
  );
};

export default PlanCartPage;
