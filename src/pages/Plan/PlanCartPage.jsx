// src/pages/PlanCartPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Progress, Flex, message } from 'antd';
import DefaultLayout from '../../layouts/DefaultLayout';
import BackHeader from '../../components/header/BackHeader';
import PrimaryButton from '../../components/common/PrimaryButton';
import CategoryButton from '../../components/common/CategoryButton';
import CartButton from '../../components/common/CartButton';
import FavoriteButton from '../../components/common/FavoriteButton';
import AmountInputModal from '../../components/modal/AmountInputModal';
import usePlanStore from '../../store/planStore';

const dummyItems = {
  관광: [
    {
      id: 1,
      name: '아쿠아플라넷 제주',
      address: '서귀포시 성산읍 섭지코지로 95',
      price: 30000,
      imageUrl: '/assets/dummy.jpg',
    },
    {
      id: 2,
      name: '성산일출봉',
      address: '서귀포시 성산읍 일출로 284-12',
      price: 10000,
      imageUrl: '/assets/dummy.jpg',
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

  useEffect(() => {
    const used = cartItems.reduce((sum, item) => sum + item.price, 0);
    setRemainingBudget(budget - used);
  }, [cartItems, budget]);

  const handleFetchItems = async (category) => {
    // TODO: 백엔드 연동 시 구현 예정
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

  const percentUsed = Math.min(100, ((budget - remainingBudget) / budget) * 100);

  return (
    <DefaultLayout>
      <div className="w-full max-w-sm mx-auto">
        <BackHeader title={`${locationIds[0] || '여행지'} 여행`} />

        <div className="w-full h-40 rounded-lg bg-gray-200 flex items-center justify-center text-gray-500">
          지도 영역 (추후 구현)
        </div>

        <div className="mt-4">
          <p className="text-sm text-center">
            현재 설정하신 예산에서{' '}
            <span className={remainingBudget < 0 ? 'text-red-500 font-bold' : 'text-blue-500 font-bold'}>
              {remainingBudget.toLocaleString()}원 {remainingBudget < 0 ? '초과' : '여유'}
            </span>
            입니다.
          </p>

          <Flex gap="small" vertical className="mt-2">
            <Progress percent={percentUsed} status={remainingBudget < 0 ? 'exception' : 'active'} />
          </Flex>
        </div>

        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          {Object.keys(dummyItems).map((category) => (
            <CategoryButton
              key={category}
              label={category}
              isActive={activeCategory === category}
              onClick={() => {
                setActiveCategory(category);
                handleFetchItems(category);
              }}
            />
          ))}
        </div>

        <div className="mt-4 space-y-4">
          {dummyItems[activeCategory].map((item) => {
            const isAdded = cartItems.some((cartItem) => cartItem.id === item.id);
            return (
              <div key={item.id} className="relative flex items-center justify-between p-2 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img src={item.imageUrl} alt={item.name} className="w-14 h-14 rounded-md object-cover" />
                    <FavoriteButton
                      isActive={isFavorite(item.id)}
                      toggleFavorite={() => toggleFavorite(item.id)}
                    />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-800">{item.name}</div>
                    <div className="text-xs text-gray-500">{item.address}</div>
                    <div className="text-xs text-gray-500">₩{item.price.toLocaleString()}</div>
                  </div>
                </div>
                <CartButton isAdded={isAdded} onClick={() => handleCartClick(item)} />
              </div>
            );
          })}
        </div>

        <PrimaryButton className="mt-8 w-full" onClick={() => navigate('/plan/auto')}>
          자동 일정 짜기
        </PrimaryButton>

        {cartItems.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 shadow-md z-10">
            <div className="flex items-center justify-between text-sm font-semibold">
              <span>🛒 {cartItems.length}개 장소 선택됨</span>
              <span className={remainingBudget < 0 ? 'text-red-500' : 'text-gray-800'}>
                총 ₩{cartItems.reduce((sum, item) => sum + item.price, 0).toLocaleString()}
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
    </DefaultLayout>
  );
};

export default PlanCartPage;
