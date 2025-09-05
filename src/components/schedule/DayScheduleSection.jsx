import { useState, useEffect, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Input, InputNumber, Modal, message } from 'antd';
import PlanCard from './PlanCard';
import EditPlanCard from './EditPlanCard';
import { Trash2, Plus } from 'lucide-react';
import useScheduleStore from '../../store/scheduleStore';
import {
  createScheduleItem,
  updateScheduleItem,
  deleteScheduleItem,
} from '../../api';

const timeToString = (v) => (v || '').toString().trim() || null;

const DayScheduleSection = ({ day, dayIndex }) => {
  const scheduleStore = useScheduleStore();
  const detail = scheduleStore.detail;

  const scheduleId = useMemo(
    () => String(detail?.scheduleId ?? detail?.id ?? ''),
    [detail]
  );

  const [isEditing, setIsEditing] = useState(false);
  const [checkedMap, setCheckedMap] = useState({});
  const [plans, setPlans] = useState(day.plans); // 드래그/편집용 로컬 상태

  // 추가/수정 모달 상태
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // { ...plan }
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    contentId: '',
    memo: '',
    cost: 0,
    startTime: '',
    endTime: '',
  });

  useEffect(() => {
    setPlans(day.plans);
    setCheckedMap({});
  }, [dayIndex, day.plans]);

  const toggleCheck = (planId) => {
    setCheckedMap((prev) => ({ ...prev, [planId]: !prev[planId] }));
  };

  // === Reorder: 드래그 끝 ===
  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const newPlans = Array.from(plans);
    const [moved] = newPlans.splice(result.source.index, 1);
    newPlans.splice(result.destination.index, 0, moved);

    // 로컬 즉시 반영
    setPlans(newPlans);

    // 서버에 order 업데이트 (변경된 항목만)
    try {
      const dayNumber = dayIndex + 1;
      // 새 순서대로 order 1..N 재부여
      const batched = [];
      newPlans.forEach((p, idx) => {
        const newOrder = idx + 1;
        if (Number(p.order) !== newOrder || Number(p.dayNumber) !== dayNumber) {
          batched.push(
            updateScheduleItem({
              scheduleItemId: p.id, // scheduleItemId
              scheduleId, // 스케줄 ID
              contentId: String(p.contentId),
              dayNumber, // 현재 Day
              startTime: timeToString(p.startTime),
              endTime: timeToString(p.endTime),
              memo: p.memo ?? '',
              cost: Number(p.cost ?? 0),
              order: newOrder,
            })
          );
        }
      });
      if (batched.length) await Promise.all(batched);

      // 로컬 also 동기화
      setPlans((cur) =>
        cur.map((p, idx) => ({ ...p, order: idx + 1, dayNumber }))
      );
      message.success('순서를 저장했어요.');
    } catch (e) {
      console.error('[reorder] fail', e?.response?.data || e);
      message.error('순서 저장에 실패했어요.');
      // 실패 시 되돌림
      setPlans(day.plans);
    }
  };

  // === 편집(메모/가격/시간) ===
  const openEdit = (plan) => {
    if (!isEditing) return;
    setEditTarget({
      ...plan,
      cost: Number(plan.cost ?? 0),
      startTime: plan.startTime || '',
      endTime: plan.endTime || '',
      memo: plan.memo || '',
    });
    setEditModalOpen(true);
  };

  const saveEdit = async () => {
    const p = editTarget;
    try {
      await updateScheduleItem({
        scheduleItemId: p.id,
        scheduleId,
        contentId: String(p.contentId),
        dayNumber: dayIndex + 1,
        startTime: timeToString(p.startTime),
        endTime: timeToString(p.endTime),
        memo: p.memo ?? '',
        cost: Number(p.cost ?? 0),
        order:
          Number(p.order ?? 0) || plans.findIndex((x) => x.id === p.id) + 1,
      });
      // 로컬 업데이트
      setPlans((cur) =>
        cur.map((it) => (it.id === p.id ? { ...it, ...p } : it))
      );
      setEditModalOpen(false);
      message.success('수정했어요.');
    } catch (e) {
      console.error('[update] fail', e?.response?.data || e);
      message.error('수정에 실패했어요.');
    }
  };

  // === 삭제 ===
  const doDelete = async () => {
    const ids = Object.entries(checkedMap)
      .filter(([, v]) => v)
      .map(([k]) => k);
    if (!ids.length) return message.info('삭제할 항목을 선택하세요.');

    try {
      await Promise.all(ids.map((id) => deleteScheduleItem(scheduleId, id)));
      // 로컬 반영
      const rest = plans.filter((p) => !ids.includes(String(p.id)));
      // 빈 자리 없이 order 재부여 + 서버 반영
      setPlans(rest);
      const dayNumber = dayIndex + 1;
      await Promise.all(
        rest.map((p, idx) =>
          updateScheduleItem({
            scheduleItemId: p.id,
            scheduleId,
            contentId: String(p.contentId),
            dayNumber,
            startTime: timeToString(p.startTime),
            endTime: timeToString(p.endTime),
            memo: p.memo ?? '',
            cost: Number(p.cost ?? 0),
            order: idx + 1,
          })
        )
      );
      message.success('삭제했어요.');
      setCheckedMap({});
    } catch (e) {
      console.error('[delete] fail', e?.response?.data || e);
      message.error('삭제에 실패했어요.');
    }
  };

  // === 추가 ===
  const openAdd = () => {
    setAddForm({
      contentId: '',
      memo: '',
      cost: 0,
      startTime: '',
      endTime: '',
    });
    setAddModalOpen(true);
  };

  const saveAdd = async () => {
    try {
      const dayNumber = dayIndex + 1;
      const order = plans.length + 1;
      const body = {
        contentId: String(addForm.contentId).trim(),
        dayNumber,
        memo: addForm.memo || '',
        cost: Number(addForm.cost || 0),
        order,
        startTime: timeToString(addForm.startTime),
        endTime: timeToString(addForm.endTime),
      };
      if (!body.contentId) return message.warning('contentId를 입력하세요.');

      await createScheduleItem(scheduleId, body);

      // 로컬에 새 항목 추가 (간단한 정보만; placeIndex가 있으면 화면에서 자동 보강됨)
      const newItem = {
        id: crypto.randomUUID?.() || `temp-${Date.now()}`, // 서버 재조회 전 임시
        title: body.contentId,
        name: body.contentId,
        memo: body.memo,
        cost: body.cost,
        startTime: body.startTime,
        endTime: body.endTime,
        contentId: body.contentId,
        order,
        dayNumber,
      };
      setPlans((cur) => [...cur, newItem]);
      setAddModalOpen(false);
      message.success('추가했어요.');
    } catch (e) {
      console.error('[create] fail', e?.response?.data || e);
      message.error('추가에 실패했어요.');
    }
  };

  return (
    <div className="w-full mb-6">
      {/* 상단 날짜 + 편집 버튼 */}
      <div className="flex items-center mb-2">
        <p className="text-sm text-[#9CA3AF] mr-2">day {dayIndex + 1}</p>
        <p className="text-sm font-medium">{day.date}</p>
        <div className="ml-auto flex items-center gap-3">
          {isEditing && (
            <button
              className="text-sm text-primary flex items-center gap-1"
              onClick={openAdd}
              title="일정 추가"
            >
              <Plus className="w-4 h-4" /> 추가
            </button>
          )}
          <button
            className="text-sm text-[#9CA3AF]"
            onClick={() => setIsEditing((prev) => !prev)}
          >
            {isEditing ? '완료' : '편집'}
          </button>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId={`day-${dayIndex}`}>
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-3 w-full"
            >
              {plans.map((plan, idx) => {
                const normalizedPlan = {
                  ...plan,
                  category: (plan?.tema ?? plan?.category ?? '').toString(),
                  region: (plan?.regionName ?? plan?.region ?? '').toString(),
                  metaLabel: [plan?.tema, plan?.regionName]
                    .map((v) => (v ?? '').toString().trim())
                    .filter(Boolean)
                    .join(' | '),
                };

                const dragHandle = (dragProps) => (
                  <div
                    {...dragProps}
                    className="cursor-grab active:cursor-grabbing"
                  >
                    {/* 빈 노드: EditPlanCard 안에서 핸들러 바인딩하는 경우 그대로 전달 */}
                  </div>
                );

                return (
                  <Draggable
                    key={String(normalizedPlan.id)}
                    draggableId={String(normalizedPlan.id)}
                    index={idx}
                  >
                    {(provided2) => (
                      <div
                        ref={provided2.innerRef}
                        {...provided2.draggableProps}
                        className="flex items-center gap-2 w-full"
                        onClick={() => openEdit(normalizedPlan)}
                      >
                        {isEditing ? (
                          <div className="w-full">
                            <EditPlanCard
                              plan={normalizedPlan}
                              checked={!!checkedMap[normalizedPlan.id]}
                              onCheck={() => toggleCheck(normalizedPlan.id)}
                              dragHandleProps={provided2.dragHandleProps}
                            />
                          </div>
                        ) : (
                          <div
                            {...provided2.dragHandleProps}
                            className="w-full"
                          >
                            <PlanCard
                              plan={normalizedPlan}
                              index={idx}
                              isLast={idx === plans.length - 1}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {isEditing && (
        <div className="mt-4">
          <button
            onClick={doDelete}
            className="w-full py-3 text-red-500 border-t border-gray-200 flex items-center justify-center gap-1 text-sm"
          >
            <Trash2 className="w-4 h-4" />
            <span>삭제하기</span>
          </button>
        </div>
      )}

      {/* ===== 수정 모달 ===== */}
      <Modal
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        onOk={saveEdit}
        okText="수정"
        cancelText="닫기"
        title="일정 수정"
      >
        {editTarget && (
          <div className="space-y-3">
            <div>
              <div className="text-xs text-gray-500">메모</div>
              <Input
                value={editTarget.memo}
                onChange={(e) =>
                  setEditTarget((p) => ({ ...p, memo: e.target.value }))
                }
                placeholder="메모를 입력하세요"
              />
            </div>
            <div>
              <div className="text-xs text-gray-500">가격(원)</div>
              <InputNumber
                className="w-full"
                min={0}
                value={Number(editTarget.cost || 0)}
                onChange={(v) =>
                  setEditTarget((p) => ({ ...p, cost: Number(v || 0) }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-xs text-gray-500">시작시간(HH:mm)</div>
                <Input
                  value={editTarget.startTime || ''}
                  onChange={(e) =>
                    setEditTarget((p) => ({ ...p, startTime: e.target.value }))
                  }
                  placeholder="09:30"
                />
              </div>
              <div>
                <div className="text-xs text-gray-500">종료시간(HH:mm)</div>
                <Input
                  value={editTarget.endTime || ''}
                  onChange={(e) =>
                    setEditTarget((p) => ({ ...p, endTime: e.target.value }))
                  }
                  placeholder="11:00"
                />
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ===== 추가 모달 ===== */}
      <Modal
        open={addModalOpen}
        onCancel={() => setAddModalOpen(false)}
        onOk={saveAdd}
        okText="추가"
        cancelText="닫기"
        title="스케줄 추가"
      >
        <div className="space-y-3">
          <div>
            <div className="text-xs text-gray-500">contentId</div>
            <Input
              value={addForm.contentId}
              onChange={(e) =>
                setAddForm((f) => ({ ...f, contentId: e.target.value }))
              }
              placeholder="예: 123456"
            />
          </div>
          <div>
            <div className="text-xs text-gray-500">메모</div>
            <Input
              value={addForm.memo}
              onChange={(e) =>
                setAddForm((f) => ({ ...f, memo: e.target.value }))
              }
              placeholder="메모를 입력하세요"
            />
          </div>
          <div>
            <div className="text-xs text-gray-500">가격(원)</div>
            <InputNumber
              className="w-full"
              min={0}
              value={Number(addForm.cost || 0)}
              onChange={(v) =>
                setAddForm((f) => ({ ...f, cost: Number(v || 0) }))
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-xs text-gray-500">시작시간(HH:mm)</div>
              <Input
                value={addForm.startTime}
                onChange={(e) =>
                  setAddForm((f) => ({ ...f, startTime: e.target.value }))
                }
                placeholder="09:30"
              />
            </div>
            <div>
              <div className="text-xs text-gray-500">종료시간(HH:mm)</div>
              <Input
                value={addForm.endTime}
                onChange={(e) =>
                  setAddForm((f) => ({ ...f, endTime: e.target.value }))
                }
                placeholder="11:00"
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DayScheduleSection;
