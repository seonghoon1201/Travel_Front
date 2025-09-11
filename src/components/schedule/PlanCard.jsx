import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PlaceDetailModal from './PlaceDetailModal';
import MemoModal from '../modal/MemoModal';
import useScheduleStore from '../../store/scheduleStore';
import { updateScheduleItem } from '../../api';
import { message } from 'antd';

const PlanCard = ({ plan, index, isLast, canEdit = false }) => {

  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [showMemoModal, setShowMemoModal] = useState(false);
  const [memo, setMemo] = useState(plan.memo || '');

  const detail = useScheduleStore((s) => s.detail);
  const scheduleId = String(detail?.scheduleId ?? detail?.id ?? '');
  const patchItems = useScheduleStore((s) => s.patchItems);

  const isZeroBased = (() => {
    const items = Array.isArray(detail?.scheduleItems)
      ? detail.scheduleItems
      : [];
    return (
      items.some((it) => Number(it.dayNumber) === 0) ||
      items.some((it) => Number(it.order) === 0)
    );
  })();

  const colorList = ['#5E87EB', '#F97316', '#10B981', '#EC4899', '#FACC15'];
  const color = colorList[index % colorList.length];
  const badgeNumber = index + 1;

  const meta =
    plan.metaLabel ||
    [plan?.tema || plan?.category, plan?.regionName || plan?.region]
      .map((v) => (v ?? '').toString().trim())
      .filter(Boolean)
      .join(' | ');

  const handleSaveMemo = async (newMemo) => {
    if (!canEdit) return;
    
    try {
      const serverDay = isZeroBased
        ? Math.max(0, Number(plan.dayNumber) - 1) // plan.dayNumber는 UI 1-베이스
        : Number(plan.dayNumber) || 1;

      const serverOrder = Number.isFinite(Number(plan.order))
        ? Number(plan.order)
        : index + (isZeroBased ? 0 : 1);

      await updateScheduleItem({
        scheduleItemId: plan.id,
        scheduleId,
        contentId: String(plan.contentId),
        dayNumber: serverDay,
        memo: newMemo,
        cost: Number(plan.cost ?? 0),
        order: serverOrder,
      });

      setMemo(newMemo);
      patchItems([{ scheduleItemId: plan.id, memo: newMemo }]);
      message.success('메모를 저장했어요.');
    } catch (e) {
      console.error('[memo save] fail', e?.response?.data || e);
      message.error('메모 저장에 실패했어요.');
    }
  };

  const handleAddPlace = () => {
    if (!canEdit) return; 
    
    navigate('/plan/add', {
      state: {
        scheduleId,
        dayNumber: Number(plan?.dayNumber) || 1,
        // 지역코드는 없으면 AddPlace가 상세 조회로 보완
      },
    });
  };

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

        {(memo || plan.memo) && (
          <div className="text-xs text-gray-600 mt-2 whitespace-pre-line">
            {memo || plan.memo}
          </div>
        )}

        {canEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMemoModal(true);
            }}
            className="absolute bottom-2 right-2 text-[11px] text-blue-300 border border-gray-300 px-2 py-0.5 rounded"
          >
            +메모
          </button>
        )}
      </div>

      {/* 마지막 카드에만 하단 버튼 - canEdit 권한이 있을 때만 표시 */}
      <div className="ml-16">
        {isLast && canEdit && (
          <div className="mt-2 flex gap-2 ">
            <button
              className="flex-1 text-xs text-gray-400 border border-gray-200 py-1 rounded"
              onClick={handleAddPlace}
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
            latitude: plan.latitude ?? plan.lat ?? plan.mapY,
            longitude: plan.longitude ?? plan.lng ?? plan.mapX,
          }}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* 메모 모달 - canEdit 권한이 있을 때만 표시 */}
      {showMemoModal && canEdit && (
        <MemoModal
          defaultValue={memo}
          onClose={() => setShowMemoModal(false)}
          onSave={handleSaveMemo}
        />
      )}
    </div>
  );
};

export default PlanCard;