// src/components/schedule/DayScheduleSection.jsx
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { getSchedule } from '../../api';

const toNum = (v) => (typeof v === 'number' ? v : Number(v));

const DayScheduleSection = ({ day, dayIndex }) => {
  const scheduleStore = useScheduleStore();
  const detail = scheduleStore.detail;
  const patchItems = useScheduleStore((s) => s.patchItems);
  const removeItemsById = useScheduleStore((s) => s.removeItemsById);
  const setDetail = useScheduleStore((s) => s.setDetail);

  const scheduleId = useMemo(
    () => String(detail?.scheduleId ?? detail?.id ?? ''),
    [detail]
  );

  // ✅ 서버 0-베이스 여부
  const isZeroBased = useMemo(() => {
    const items = Array.isArray(detail?.scheduleItems)
      ? detail.scheduleItems
      : [];
    return (
      items.some((it) => Number(it.dayNumber) === 0) ||
      items.some((it) => Number(it.order) === 0)
    );
  }, [detail]);

  const [isEditing, setIsEditing] = useState(false);
  const [checkedMap, setCheckedMap] = useState({});
  const [plans, setPlans] = useState(day.plans);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({ contentId: '', memo: '', cost: 0 });

  const navigate = useNavigate();

  useEffect(() => {
    setPlans(day.plans);
    setCheckedMap({});
  }, [dayIndex, day.plans]);

  const toggleCheck = (planId) => {
    setCheckedMap((prev) => ({ ...prev, [planId]: !prev[planId] }));
  };

  const goPlaceDetail = (plan) => {
    const cid = String(plan?.contentId || '').trim();
    if (!cid)
      return message.warning(
        'contentId가 없어 상세 페이지로 이동할 수 없어요.'
      );
    navigate(`/place/detail/${encodeURIComponent(cid)}`);
  };

  // === 드래그 종료: 순서 저장 ===
  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const newPlans = Array.from(plans);
    const [moved] = newPlans.splice(result.source.index, 1);
    newPlans.splice(result.destination.index, 0, moved);
    setPlans(newPlans);

    try {
      const serverDay = isZeroBased ? dayIndex : dayIndex + 1;

      const batched = [];
      const patches = [];
      newPlans.forEach((p, idx) => {
        const newOrder = idx + (isZeroBased ? 0 : 1);
        if (Number(p.order) !== newOrder || Number(p.dayNumber) !== serverDay) {
          batched.push(
            updateScheduleItem({
              scheduleItemId: p.id,
              scheduleId,
              contentId: String(p.contentId),
              dayNumber: serverDay,
              memo: p.memo ?? '',
              cost: Number(p.cost ?? 0),
              order: newOrder,
            })
          );
          patches.push({
            scheduleItemId: p.id,
            order: newOrder,
            dayNumber: serverDay,
          });
        }
      });
      if (batched.length) await Promise.all(batched);
      if (patches.length) patchItems(patches);

      message.success('순서를 저장했어요.');
    } catch (e) {
      console.error('[reorder] fail', e?.response?.data || e);
      message.error('순서 저장에 실패했어요.');
      setPlans(day.plans);
    }
  };

  // === 편집(메모/가격) ===
  const openEdit = (plan) => {
    if (!isEditing) return;
    setEditTarget({
      ...plan,
      cost: Number(plan.cost ?? 0),
      memo: plan.memo || '',
    });
    setEditModalOpen(true);
  };

  const saveEdit = async () => {
    const p = editTarget;
    try {
      const serverDay = isZeroBased ? dayIndex : dayIndex + 1;
      const fallbackOrder = plans.findIndex((x) => x.id === p.id);
      const serverOrder = Number.isFinite(Number(p.order))
        ? Number(p.order)
        : fallbackOrder + (isZeroBased ? 0 : 1);

      await updateScheduleItem({
        scheduleItemId: p.id,
        scheduleId,
        contentId: String(p.contentId),
        dayNumber: serverDay,
        memo: p.memo ?? '',
        cost: Number(p.cost ?? 0),
        order: serverOrder,
      });

      setPlans((cur) =>
        cur.map((it) => (it.id === p.id ? { ...it, ...p } : it))
      );
      patchItems([
        { scheduleItemId: p.id, memo: p.memo ?? '', cost: Number(p.cost ?? 0) },
      ]);

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

      const rest = plans.filter((p) => !ids.includes(String(p.id)));
      setPlans(rest);

      const serverDay = isZeroBased ? dayIndex : dayIndex + 1;
      await Promise.all(
        rest.map((p, idx) =>
          updateScheduleItem({
            scheduleItemId: p.id,
            scheduleId,
            contentId: String(p.contentId),
            dayNumber: serverDay,
            memo: p.memo ?? '',
            cost: Number(p.cost ?? 0),
            order: idx + (isZeroBased ? 0 : 1),
          })
        )
      );

      removeItemsById(ids);
      patchItems(
        rest.map((p, idx) => ({
          scheduleItemId: p.id,
          order: idx + (isZeroBased ? 0 : 1),
          dayNumber: serverDay,
        }))
      );

      setCheckedMap({});
      message.success('삭제했어요.');
    } catch (e) {
      console.error('[delete] fail', e?.response?.data || e);
      message.error('삭제에 실패했어요.');
    }
  };

  // === 추가(페이지 이동) ===
  const openAdd = () => {
    const scheduleIdStr = String(detail?.scheduleId ?? detail?.id ?? '');
    navigate('/plan/add', {
      state: { scheduleId: scheduleIdStr, dayNumber: dayIndex + 1 },
    });
  };

  // === (직접 contentId 입력해서 추가하는 모달은 남겨두되 서버 재조회로 동기화) ===
  const saveAdd = async () => {
    try {
      const serverDay = isZeroBased ? dayIndex : dayIndex + 1;
      const order = plans.length + (isZeroBased ? 0 : 1);
      const body = {
        contentId: String(addForm.contentId).trim(),
        dayNumber: serverDay,
        memo: addForm.memo || '',
        cost: Number(addForm.cost || 0),
        order,
      };
      if (!body.contentId) return message.warning('contentId를 입력하세요.');

      await createScheduleItem(scheduleId, body);
      const fresh = await getSchedule(scheduleId);
      setDetail(fresh);

      setAddModalOpen(false);
      message.success('추가했어요.');
    } catch (e) {
      console.error('[create] fail', e?.response?.data || e);
      message.error('추가에 실패했어요.');
    }
  };

  return (
    <div className="w-full mb-6">
      {/* 상단 */}
      <div className="flex items-center mb-2">
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
                  contentId: String(plan?.contentId ?? plan?.id ?? ''),
                  dayNumber: dayIndex + 1, // ✅ PlanCard에서 업데이트에 사용
                  lat: toNum(plan?.lat),
                  lng: toNum(plan?.lng),
                  category: (plan?.tema ?? plan?.category ?? '').toString(),
                  region: (plan?.regionName ?? plan?.region ?? '').toString(),
                  metaLabel: [plan?.tema, plan?.regionName]
                    .map((v) => (v ?? '').toString().trim())
                    .filter(Boolean)
                    .join(' | '),
                };

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
                        onClick={() =>
                          isEditing ? openEdit(normalizedPlan) : null
                        }
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
                              onDetail={goPlaceDetail}
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

      {/* 수정 모달 */}
      <Modal
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        onOk={saveEdit}
        okText="수정"
        cancelText="닫기"
        title="일정 수정"
        okButtonProps={{
          className: 'bg-blue-500 hover:bg-blue-600 text-white',
          style: { borderColor: 'transparent' },
        }}
        cancelButtonProps={{ className: 'text-gray-600' }}
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
          </div>
        )}
      </Modal>

      {/* 추가 모달 */}
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
              placeholder="예: 126508"
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
        </div>
      </Modal>
    </div>
  );
};

export default DayScheduleSection;
