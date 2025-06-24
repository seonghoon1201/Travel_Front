import React, { useState } from 'react';
import BookmarkItem from './BookmarkItem';
import CategoryButtonSection from './CategoryButtonSection';

const MyBookmarkSection = () => {
  const [activeCategory, setActiveCategory] = useState('전체');

  const bookmarks = [
    {
      destination: '섭지코지',
      category: '힐링',
      location: '제주',
      address: '제주특별자치도 서귀포시 성산읍 섭지코지로 95',
      opentime: '09:30',
      closetime: '18:00',
      tel: '1833-7001',
      imageUrl: '/assets/jeju_sample.jpg',
    },
    {
      destination: '성산일출봉',
      category: '힐링',
      location: '제주',
      address: '제주특별자치도 서귀포시 성산읍 일출로 284-12',
      opentime: '07:00',
      closetime: '20:00',
      tel: '064-783-0959',
      imageUrl: '/assets/jeju_sample.jpg',
    },
    {
      destination: '강릉서핑',
      category: '레저',
      location: '강릉',
      address: '강원특별자치도 강릉시 해변로 100',
      opentime: '08:00',
      closetime: '19:00',
      tel: '033-123-4567',
      imageUrl: '/assets/gangneung_sample.jpg',
    },
  ];

  // 카테고리 필터링
  const filteredBookmarks =
    activeCategory === '전체'
      ? bookmarks
      : bookmarks.filter((item) => item.category === activeCategory);

  return (
    <div className="p-4 space-y-4">
      <CategoryButtonSection
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />

      {filteredBookmarks.length > 0 ? (
        filteredBookmarks.map((bookmark, index) => (
          <BookmarkItem
            key={index}
            destination={bookmark.destination}
            category={bookmark.category}
            location={bookmark.location}
            address={bookmark.address}
            opentime={bookmark.opentime}
            closetime={bookmark.closetime}
            tel={bookmark.tel}
            imageUrl={bookmark.imageUrl}
          />
        ))
      ) : (
        <p className="text-center text-gray-400 text-sm">
          저장된 여행이 없습니다.
        </p>
      )}
    </div>
  );
};

export default MyBookmarkSection;
