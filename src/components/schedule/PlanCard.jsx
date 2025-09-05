import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PlaceDetailModal from './PlaceDetailModal';
import MemoModal from '../modal/MemoModal';

const PlanCard = ({ plan, index, isLast }) => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const [showMemoModal, setShowMemoModal] = useState(false);
  const [memo, setMemo] = useState(plan.memo || '');

  const colorList = ['#5E87EB', '#F97316', '#10B981', '#EC4899', '#FACC15'];
  const color = colorList[index % colorList.length];

  
  const badgeNumber = index + 1;

  // ✅ 메타 라벨: tema | regionName (DayScheduleSection에서 metaLabel을 넘기면 우선)
  const meta =
    plan.metaLabel ||
    [plan?.tema || plan?.category, plan?.regionName || plan?.region]
      .map((v) => (v ?? '').toString().trim())
      .filter(Boolean)
      .join(' | ');

  return (
    <div className="relative ">
      {/* 번호 + 세로선 */}
      <div className="absolute left-4 top-3 flex flex-col items-center z-10">
        <div
          className="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center"
          style={{ backgroundColor: color }}
        >
          {badgeNumber}
        </div>

        {/* 거리 표시 (다음 계획이 있다면) */}
        {plan.distance && (
          <>
            <div className="h-6 border-l border-gray-300 mt-1"></div>
            <div className="text-[10px] text-gray-400 mt-1">
              {plan.distance}
            </div>
          </>
        )}
      </div>

      {/* 카드 본문 */}
      <div
        onClick={() => setShowModal(true)}
        className="relative ml-16 bg-white rounded-lg border border-[#E5E7EB] px-4 py-3 shadow-sm cursor-pointer"
      >
        <p className="font-medium text-sm">{plan.name}</p>
        {meta && <p className="text-[11px] text-gray-400 mt-1">{meta}</p>}

        {plan.memo && (
          <div className="text-xs text-gray-600 mt-2 whitespace-pre-line">
            {plan.memo}
          </div>
        )}

        {/* 메모 버튼 */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMemoModal(true);
          }}
          className="absolute bottom-2 right-2 text-[11px] text-blue-300 border border-gray-300 px-2 py-0.5 rounded"
        >
          +메모
        </button>
      </div>

      {/* 마지막 카드에만 하단 버튼 */}
      <div className="ml-16">
        {isLast && (
          <div className="mt-2 flex gap-2 ">
            <button
              className="flex-1 text-xs text-gray-400 border border-gray-200 py-1 rounded"
              onClick={() => navigate('/plan/add')}
            >
              장소 추가
            </button>
          </div>
        )}
      </div>

      {/* 상세 모달 */}
      {showModal && (
        <PlaceDetailModal
          place={{
            ...plan,
            mapX: plan.lng,
            mapY: plan.lat,
          }}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* 메모 모달 */}
      {showMemoModal && (
        <MemoModal
          defaultValue={memo}
          onClose={() => setShowMemoModal(false)}
          onSave={(newMemo) => {
            setMemo(newMemo);
          }}
        />
      )}
    </div>
  );
};

export default PlanCard;
