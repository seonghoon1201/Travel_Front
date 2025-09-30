import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PrimaryButton from '../common/PrimaryButton';

const PlaceDetailModal = ({ place, onClose }) => {
  const navigate = useNavigate();

  // 오버레이 클릭 시 닫기
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  // ✅ 자세히 보기: /place/detail/:contentId
  const handleDetail = () => {
    const cid = String(place?.contentId || '').trim();
    if (!cid) return;
    onClose?.();
    navigate(`/place/detail/${encodeURIComponent(cid)}`);
  };

  // ✅ 카카오맵 길찾기 (mapY=위도, mapX=경도)
  const handleFindRoute = () => {
    const lat = Number(place?.mapY ?? place?.lat ?? place?.latitude);
    const lng = Number(place?.mapX ?? place?.lng ?? place?.longitude);
    const title = place?.name || place?.title || '목적지';

    if (Number.isNaN(lat) || Number.isNaN(lng)) return;

    // 카카오맵: https://map.kakao.com/link/to/{이름},{위도},{경도}
    const kakaoUrl = `https://map.kakao.com/link/to/${encodeURIComponent(
      title
    )},${lat},${lng}`;
    window.open(kakaoUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex justify-center items-end"
      onClick={handleOverlayClick}
    >
      {/* 바텀시트 */}
      <div className="w-full bg-white rounded-t-2xl p-5 shadow-lg max-h-[60%] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-base font-semibold">
            {place?.name || place?.title}
          </h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 정보 */}
        <div className="text-sm text-gray-500 mb-4">
          <p className="mb-1">{place?.address || '주소 정보 없음'}</p>
        </div>

        {/* 푸터 버튼: 자세히 보기 | 길찾기 */}
        <div className="flex gap-2 footer-safe">
          <button
            onClick={handleDetail}
            className="flex-1 h-11 rounded-lg border border-gray-200 text-sm"
          >
            자세히 보기
          </button>
          <PrimaryButton onClick={handleFindRoute} className="flex-1 h-11">
            길찾기
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};

export default PlaceDetailModal;
