import { X } from 'lucide-react';
import PrimaryButton from '../common/PrimaryButton';

const PlaceDetailModal = ({ place, onClose }) => {
  // 모달 바깥쪽 클릭시 닫히기
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleFindRoute = () => {
    const kakaoUrl = `https://map.kakao.com/link/to/${place.name},${place.mapY},${place.mapX}`;
    window.open(kakaoUrl, '_blank');
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-end"
      onClick={handleOverlayClick}
    >
      {/* 모달 본문 */}
      <div className="w-full bg-white rounded-t-2xl p-5 shadow-lg max-h-[60%] overflow-y-auto">
        {/* 닫기 버튼 */}
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-base font-semibold">{place.name}</h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 장소 상세정보 */}
        <div className="text-sm text-gray-500 mb-4">
          {/* 추후에 api 연동해서 영업시간 및 주소 붙히기 */}
          <p className="mb-1">영업시간 | {place.hours || '정보 없음'}</p>
          <p className="mb-1">{place.address || '주소 정보 없음'}</p>
        </div>

        {/* 길찾기 버튼 */}
        <PrimaryButton onClick={handleFindRoute}>길찾기</PrimaryButton>
      </div>
    </div>
  );
};

export default PlaceDetailModal;
