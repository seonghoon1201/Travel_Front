import React, { useEffect, useState } from 'react';
import BookmarkItem from './BookmarkItem';
import CategoryButtonSection from './CategoryButtonSection';
import { getFavorites } from '../../api/favorite/getFavorites'; // API 유틸 분리했다고 가정

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
          // API 응답 형식에 맞게 변환
          setBookmarks(
            res.favorites.map((f) => ({
              destination: f.placeTitle,
              category: f.regionCode, // 카테고리 필드 없으니 regionCode로 구분? (백엔드와 협의 필요)
              location: f.regionCode,
              address: f.placeAddress,
              opentime: '',   // 스웨거에는 없음 → 빈값 처리
              closetime: '',  // 스웨거에는 없음 → 빈값 처리
              tel: '',        // 스웨거에는 없음 → 빈값 처리
              imageUrl: f.placeImage,
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
    return (
      <div className="p-4 text-center text-gray-400">불러오는 중...</div>
    );
  }

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
