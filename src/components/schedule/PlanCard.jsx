import { useState } from 'react';
import PlaceDetailModal from './PlaceDetailModal';

const PlanCard = ({ plan, index, isLast  }) => {
  const [showModal, setShowModal] = useState(false);
  const colorList = ['#5E87EB', '#F97316', '#10B981', '#EC4899', '#FACC15'];
  const color = colorList[index % colorList.length];

  return (
    <div className="relative ">
      {/* 번호 + 선 */}
      <div className="absolute left-4 top-3 flex flex-col items-center z-10">
        <div
          className="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center"
          style={{ backgroundColor: color }}
        >
          {index + 1}
        </div>

        {/* 거리 표시 (다음 계획이 있다면) */}
        {plan.distance && (
          <>
            <div className="h-6 border-l border-gray-300 mt-1"></div>
            <div className="text-[10px] text-gray-400 mt-1">{plan.distance}</div>
          </>
        )}
      </div>

        {/* 카드 본문 */}
        <div
          onClick={() => setShowModal(true)}
          className="ml-16 bg-white rounded-lg border border-[#E5E7EB] px-4 py-3 shadow-sm cursor-pointer"
        >
          <p className="font-medium text-sm">{plan.name}</p>
          <p className="text-[11px] text-gray-400 mt-1">관광 | 제주</p>

          {plan.memo && (
            <div className="text-xs text-gray-600 mt-2 whitespace-pre-line">
              {plan.memo}
            </div>
          )}
        </div>
        {/* isLast 마지막 index에만 추가 */}
        <div className="ml-16">
        {isLast && (
          <div className="mt-2 flex gap-2">
            <button className="flex-1 text-xs text-gray-400 border border-gray-200 py-1 rounded">
            장소 추가
            </button>
            <button className="flex-1 text-xs text-gray-400 border border-gray-200 py-1 rounded">
            메모 추가
            </button>
        </div>
        )}
        </div>
        {showModal && (
          <PlaceDetailModal place={plan} onClose={() => setShowModal(false)} />
        )}
    </div>
  );
};

export default PlanCard;
