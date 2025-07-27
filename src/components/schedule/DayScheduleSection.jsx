import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import PlanCard from './PlanCard';
import EditPlanCard from './EditPlanCard';
import { Trash2 } from 'lucide-react';

const DayScheduleSection = ({ day, dayIndex }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [checkedMap, setCheckedMap] = useState({});
  const [plans, setPlans] = useState(day.plans); // ✅ 드래그용 상태

  const toggleCheck = (planId) => {
    setCheckedMap((prev) => ({
      ...prev,
      [planId]: !prev[planId],
    }));
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const newPlans = Array.from(plans);
    const [moved] = newPlans.splice(result.source.index, 1);
    newPlans.splice(result.destination.index, 0, moved);
    setPlans(newPlans);
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

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId={`day-${dayIndex}`}>
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
              {plans.map((plan, idx) => (
                <Draggable key={plan.id} draggableId={String(plan.id)} index={idx}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="flex items-center gap-2"
                    >
                      {isEditing ? (
                        <EditPlanCard
                          plan={plan}
                          checked={!!checkedMap[plan.id]}
                          onCheck={() => toggleCheck(plan.id)}
                          dragHandleProps={provided.dragHandleProps}
                        />
                      ) : (
                        <div {...provided.dragHandleProps} className="w-full">
                          <PlanCard
                            plan={plan}
                            index={idx}
                            isLast={idx === plans.length - 1}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {isEditing && (
        <div className="mt-4">
          <button className="w-full py-3 text-red-500 border-t border-gray-200 flex items-center justify-center gap-1 text-sm">
            <Trash2 className="w-4 h-4" />
            <span>삭제하기</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default DayScheduleSection;
