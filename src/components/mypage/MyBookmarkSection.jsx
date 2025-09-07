// src/components/bookmark/MyBookmarkSection.jsx
import React, { useEffect, useState } from 'react';
import BookmarkItem from './BookmarkItem';
import CategoryButtonSection from './CategoryButtonSection';
import { getFavorites } from '../../api/favorite/getFavorites';

const MyBookmarkSection = () => {
  const [activeCategory, setActiveCategory] = useState('전체');
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  // 최초 로드 시 즐겨찾기 불러오기
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await getFavorites();
        if (res?.favorites) {
          setBookmarks(
            res.favorites
              .filter((f) => f.placeTitle && f.placeTitle.trim() !== '') // 제목 없는 건 제외
              .map((f) => ({
                contentId: f.contentId, 
                destination: f.placeTitle,
                category: f.regionCode || '기타',
                location: f.regionCode || '기타',
                address: f.placeAddress || '',
                opentime: '',
                closetime: '',
                tel: '',
                imageUrl: f.placeImage || '/assets/default_place.jpg',
                isFavorite: true, 
              }))
          );
        }
      } catch (err) {
        console.error('즐겨찾기 불러오기 실패:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  // 카테고리 필터링
  const filteredBookmarks =
    activeCategory === '전체'
      ? bookmarks
      : bookmarks.filter((item) => item.category === activeCategory);

  if (loading) {
    return <div className="p-4 text-center text-gray-400">불러오는 중...</div>;
  }

  return (
    <div className="p-4 space-y-4 sm:px-6 md:px-8">
      <CategoryButtonSection
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />

      {filteredBookmarks.length > 0 ? (
        filteredBookmarks.map((bookmark) => (
          <BookmarkItem
            key={bookmark.contentId} 
            contentId={bookmark.contentId}
            destination={bookmark.destination}
            category={bookmark.category}
            location={bookmark.location}
            address={bookmark.address}
            opentime={bookmark.opentime}
            closetime={bookmark.closetime}
            tel={bookmark.tel}
            imageUrl={bookmark.imageUrl}
            isFavorite={bookmark.isFavorite}
          />
        ))
      ) : (
        <p className="text-center text-gray-400 text-sm">
          즐겨찾기한 장소가 없습니다.
        </p>
      )}
    </div>
  );
};

export default MyBookmarkSection;
