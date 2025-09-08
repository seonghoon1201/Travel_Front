// src/components/bookmark/MyBookmarkSection.jsx
import React, { useEffect, useState } from 'react';
import BookmarkItem from './BookmarkItem';
import { getFavorites } from '../../api/favorite/getFavorites';
import { toggleFavorite } from '../../api/favorite/toggleFavorite';

const MyBookmarkSection = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const res = await getFavorites();
      if (res?.favorites) {
        setBookmarks(
          res.favorites
            .filter((f) => f.placeTitle && f.placeTitle.trim() !== '') // 제목 없는 건 제외
            .map((f) => ({
              contentId: f.contentId,
              destination: f.placeTitle,
              address: f.placeAddress || '',
              opentime: '',
              closetime: '',
              tel: '',
              imageUrl: f.placeImage || '/assets/default_place.jpg',
              isFavorite: true,
            }))
        );
         setTotalCount(res.totalCount || 0);
      }
    } catch (err) {
      console.error('즐겨찾기 불러오기 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  // 즐겨찾기 토글 함수
  const handleToggleFavorite = async (contentId) => {
    try {
      const result = await toggleFavorite(contentId);
      return result;
    } catch (err) {
      console.error('즐겨찾기 토글 실패:', err);
      throw err;
    }
  };

  // 북마크 목록에서 제거하는 함수
  const handleRemoveBookmark = (contentId) => {
    setBookmarks((prev) =>
      prev.filter((bookmark) => bookmark.contentId !== contentId)
    );
    setTotalCount((prev) => prev - 1);
  };

  if (loading) {
    return <div className="p-4 text-center text-gray-400">불러오는 중...</div>;
  }

  return (
    <div className="p-4 space-y-4 sm:px-6 md:px-8">
       <div className="text-sm font-semibold text-gray-600 mb-3">
        총 즐겨찾기: {totalCount}개
      </div>

      {bookmarks.length > 0 ? (
        bookmarks.map((bookmark) => (
          <BookmarkItem
            key={bookmark.contentId}
            contentId={bookmark.contentId}
            destination={bookmark.destination}
            address={bookmark.address}
            opentime={bookmark.opentime}
            closetime={bookmark.closetime}
            tel={bookmark.tel}
            imageUrl={bookmark.imageUrl}
            isFavorite={bookmark.isFavorite}
            toggleFavorite={handleToggleFavorite}
            onRemove={handleRemoveBookmark}
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
