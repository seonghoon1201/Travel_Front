import { GripVertical } from 'lucide-react';

const EditPlanCard = ({ plan, checked, onCheck, dragHandleProps }) => {
  return (
    <div className="flex items-center w-full gap-2 px-1">
      {/* 체크박스 */}
      <label className="relative flex items-center cursor-pointer mt-1">
        <input
          type="checkbox"
          className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded-full checked:bg-blue-500 checked:border-blue-500 transition-all"
          checked={checked}
          onChange={onCheck}
        />
        <svg
          className="absolute top-0 left-0 w-5 h-5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="3"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </label>

      {/* 카드 본문 */}
      <div className="flex-1 w-full bg-white rounded-lg border px-4 py-3 shadow-sm">
        <p className="font-medium text-sm">{plan.name}</p>
        <p className="text-[11px] text-gray-400 mt-1">관광 | 제주</p>
        {plan.memo && (
          <div className="text-xs text-gray-600 mt-2 whitespace-pre-line">
            {plan.memo}
          </div>
        )}
      </div>

      {/* 드래그 핸들 */}
      <div className="mt-2 text-gray-300 cursor-grab" {...dragHandleProps}>
        <GripVertical className="w-4 h-4" />
      </div>
    </div>
  );
};

export default EditPlanCard;
