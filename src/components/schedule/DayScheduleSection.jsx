import { useState } from 'react';
import PlanCard from './PlanCard';
import EditPlanCard from './EditPlanCard';
import { Trash2 } from 'lucide-react';

const DayScheduleSection = ({ day, dayIndex }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [checkedMap, setCheckedMap] = useState({});

  const toggleCheck = (planId) => {
    setCheckedMap((prev) => ({
      ...prev,
      [planId]: !prev[planId],
    }));
  };

  return (
    <div className="mb-6">
      {/* 상단 날짜 + 편집 버튼 */}
      <div className="flex items-center mb-2">
        <p className="text-sm text-[#9CA3AF] mr-2">day {dayIndex + 1}</p>
        <p className="text-sm font-medium">{day.date}</p>
        <button
          className="ml-auto text-sm text-[#9CA3AF]"
          onClick={() => setIsEditing((prev) => !prev)}
        >
          {isEditing ? '완료' : '편집'}
        </button>
      </div>

      <div className="space-y-3">
        {day.plans.map((plan, idx) =>
          isEditing ? (
            <EditPlanCard
              key={plan.id}
              plan={plan}
              checked={!!checkedMap[plan.id]}
              onCheck={() => toggleCheck(plan.id)}
            />
          ) : (
            <PlanCard
              key={plan.id}
              plan={plan}
              index={idx}
              isLast={idx === day.plans.length - 1}
            />
          )
        )}

        {isEditing && (
          <div className="mt-4">
            <button className="w-full py-3 text-red-500 border-t border-gray-200 flex items-center justify-center gap-1 text-sm">
                <Trash2 className="w-4 h-4" />
                <span>삭제하기</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DayScheduleSection;
