import React, { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';

import BackHeader from '../components/header/BackHeader';
import SearchBar from '../components/common/SearchBar';
import CategoryButtonSection from '../components/mypage/CategoryButtonSection';
import HotSpotItem from '../components/board/HotSpotItem';

const HotBoard = () => {
  const [activeCategory, setActiveCategory] = useState('전체');
  const [searchTerm, setSearchTerm] = useState('');
  const bookmarks = [
    {
      destination: '아쿠아플라넷 제주',
      category: '관광',
      location: '제주',
      opentime: '09:30',
      closetime: '18:00',
      tel: '1833-7001',
      imageUrl: '/assets/.jpg',
    },
    {
      destination: '아쿠아플라넷 제주',
      category: '관광',
      location: '제주',
      opentime: '09:30',
      closetime: '18:00',
      tel: '1833-7001',
      imageUrl: '/assets/.jpg',
    },
    {
      destination: '아쿠아플라넷 제주',
      category: '관광',
      location: '제주',
      opentime: '09:30',
      closetime: '18:00',
      tel: '1833-7001',
      imageUrl: '/assets/.jpg',
    },
  ];

  const filteredBookmarks =
    activeCategory === '전체'
      ? bookmarks
      : bookmarks.filter((item) => item.category === activeCategory);

  return (
    <div className="min-h-screen bg-background">
      <BackHeader title="핫플 여행지" />
      <div className="p-4">
        <SearchBar
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="px-4">
        <CategoryButtonSection
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
        />
        {/* 핫플 여행지 상단 영역 */}
        <div className="flex items-start justify-between px-2 pt-4 py-2">
          {/* 왼쪽 문구 */}
          <div>
            <p className="text-lg font-semibold text-[#222]">📍핫플 여행지</p>
            <p className="text-sm text-gray-500 mt-1">
              사람들이 많이 가는 곳으로 추천해드려요!
            </p>
          </div>

          {/* 오른쪽 문구 */}
          <div className="text-right pt-3 pr-2">
            <p className="text-xs font-medium text-[#333] flex items-center justify-end gap-1">
              <SlidersHorizontal className="w-4 h-4" />
              금액 조정하기
            </p>
            <p className="text-sm text-gray-500 mt-1">
              예산 : <span className="font-semibold text-black">원</span>
            </p>
          </div>
        </div>
        <div className="space-y-4 mt-4">
          {filteredBookmarks.map((item, index) => (
            <HotSpotItem key={index} {...item} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HotBoard;
