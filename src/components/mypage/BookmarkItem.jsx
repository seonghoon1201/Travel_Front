import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FavoriteButton from '../common/FavoriteButton';
import ConfirmModal from '../modal/ConfirmModal'; 
import { useToast } from '../../utils/useToast';

const BookmarkItem = ({
  contentId,
  destination,
  address,
  opentime,
  closetime,
  tel,
  imageUrl,
  isFavorite = false,
  toggleFavorite,
  onRemove,
}) => {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);

  const { showSuccess, showError, showInfo } = useToast();

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleClick = () => {
    navigate(`/place/detail/${contentId}`);
  };

  const handleToggleFavorite = async (e) => {
    e.stopPropagation();
    

    if (isFavorite) {
      setShowConfirmModal(true);
      return;
    }

    try {
      const result = await toggleFavorite(contentId);
      if (result?.favorite) {
        showSuccess('즐겨찾기에 추가되었습니다. ❤️');
      }
    } catch (err) {
      console.error('즐겨찾기 추가 실패:', err);
      showError('즐겨찾기 처리에 실패했습니다.');
    }
  };

  const handleCancelRemove = () => {
    setShowConfirmModal(false);
  };

  const handleConfirmRemove = async () => {
    try {
      const result = await toggleFavorite(contentId);
      if (!result?.favorite) {
        showInfo('즐겨찾기에서 제거되었습니다. 🤍');
        
        if (onRemove) {
          setTimeout(() => {
            onRemove(contentId);
          }, 1000); // toast 보여준 후 제거
        }
      }
    } catch (err) {
      console.error('즐겨찾기 제거 실패:', err);
      showError('즐겨찾기 처리에 실패했습니다.');
    } finally {
      setShowConfirmModal(false);
    }
  };

  const showImage = imageUrl && !imgError;

  return (
    <>
      <div
        onClick={handleClick}
        className="relative bg-white rounded-xl shadow overflow-hidden flex cursor-pointer hover:shadow-lg transition"
      >
        {/* 이미지 영역 */}
        <div className="relative w-24 h-24 flex-shrink-0">
          {showImage ? (
            <img
              src={imageUrl}
              alt={destination || 'No Image'}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-[10px] text-gray-500">
              No Image
            </div>
          )}

          <div className="absolute top-1 right-1" onClick={handleToggleFavorite}>
            <FavoriteButton
              isActive={isFavorite}
              toggleFavorite={() => {}}
              aria-label={isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
            />
          </div>
        </div>

        <div className="flex-1 p-3">
          <h3 className="text-sm font-bold text-gray-800">{destination}</h3>
          {address && <p className="text-xs text-gray-500">{address}</p>}
          {tel && <p className="text-xs text-gray-500">☎ {tel}</p>}
          {(opentime || closetime) && (
            <p className="text-xs text-gray-500">
              {opentime || '-'} ~ {closetime || '-'}
            </p>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={handleCancelRemove}
        onConfirm={handleConfirmRemove}
        title="즐겨찾기 해제"
        message={
          <>
            <span className="font-medium">"{destination}"</span>을(를) 
            즐겨찾기에서 제거하시겠습니까?
          </>
        }
        confirmText="제거"
        cancelText="취소"
        confirmButtonClass="bg-red-500 hover:bg-red-600"
      />
    </>
  );
};

export default BookmarkItem;