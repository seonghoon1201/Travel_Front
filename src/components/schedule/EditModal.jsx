import { useState } from 'react';
import { message } from 'antd';
import EditTitle from './edit/EditTitle';
import EditDate from './edit/EditDate';
import EditDelete from './edit/EditDelete';
import useScheduleStore from '../../store/scheduleStore';
import { getSchedule, updateScheduleAll, deleteSchedule } from '../../api';
import { useNavigate } from 'react-router-dom';

const EditModal = ({ onClose }) => {
  const [modalType, setModalType] = useState(null);

  const navigate = useNavigate();

  const detail = useScheduleStore((s) => s.detail);
  const setDetail = useScheduleStore((s) => s.setDetail);

  const scheduleId = String(detail?.scheduleId ?? detail?.id ?? '');
  const currentTitle = detail?.scheduleName ?? '';
  const currentDates = [
    detail?.startDate ? new Date(detail.startDate) : null,
    detail?.endDate ? new Date(detail.endDate) : null,
  ];

  // PUT /schedule/update 는 일부필드만 보내면 오류나는 서버가 많아.
  // 안전하게 현재 값을 기반으로 payload를 만들고 수정값을 덮어쓴다.
  const basePayload = {
    scheduleId,
    scheduleName: detail?.scheduleName ?? '',
    startDate: detail?.startDate ?? '',
    endDate: detail?.endDate ?? '',
    budget: detail?.budget ?? 0,
    groupId: detail?.groupId ?? null,
    startPlace: detail?.startPlace ?? '',
    scheduleType: detail?.scheduleType ?? null,
    scheduleStyle: detail?.scheduleStyle ?? null,
  };

  // ----- 서브 모달: 제목 -----
  if (modalType === 'title') {
    return (
      <EditTitle
        currentTitle={currentTitle}
        onClose={() => setModalType(null)}
        onSave={async (newTitle) => {
          const val = (newTitle ?? '').trim();
          if (!val) return message.warning('제목을 입력해 주세요.');
          try {
            await updateScheduleAll({ ...basePayload, scheduleName: val });
            const fresh = await getSchedule(scheduleId);
            setDetail(fresh);
            message.success('제목을 수정했어요.');
          } catch (e) {
            console.error('[update title] fail', e?.response?.data || e);
            message.error('제목 수정에 실패했어요.');
          } finally {
            setModalType(null);
            onClose();
          }
        }}
      />
    );
  }

  // ----- 서브 모달: 날짜 -----
  if (modalType === 'date') {
    return (
      <EditDate
        currentDates={currentDates}
        onClose={() => setModalType(null)}
        onSave={async ({ startDate, endDate }) => {
          try {
            await updateScheduleAll({ ...basePayload, startDate, endDate });
            const fresh = await getSchedule(scheduleId);
            setDetail(fresh);
            message.success('여행 일정을 수정했어요.');
          } catch (e) {
            console.error('[update dates] fail', e?.response?.data || e);
            message.error('일정 수정에 실패했어요.');
          } finally {
            setModalType(null);
            onClose();
          }
        }}
      />
    );
  }

  // ----- 서브 모달: 삭제(네 기존 로직 유지, 여기선 API 경로만 연결하면 됨) -----
  if (modalType === 'delete') {
    return (
      <EditDelete
        onClose={() => setModalType(null)}
        onDelete={async () => {
          try {
            if (!scheduleId) {
              message.error('scheduleId가 비어 있어요.');
              return;
            }
            await deleteSchedule(scheduleId); // ✅ DELETE /schedule/delete
            message.success('일정을 삭제했어요.');
            setDetail(null); // 상태 정리
            navigate(-1);
            message.success('일정을 삭제했어요.');
          } catch (e) {
            console.error('[delete schedule] fail', e?.response?.data || e);
            message.error('일정 삭제에 실패했어요.');
          } finally {
            setModalType(null);
            onClose();
          }
        }}
      />
    );
  }

  // ----- 메인 모달(메뉴): 스타일 수정 제거 -----
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/30"
      onClick={onClose}
    >
      <div
        className="bg-white w-full mx-auto rounded-t-xl px-4 sm:px-6 md:px-8 pt-6 pb-3 overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-sm pb-3 text-gray-500 mb-4">편집</p>
        <ul className="text-gray-700 space-y-8">
          <li>
            <button onClick={() => setModalType('title')}>
              여행 제목 수정
            </button>
          </li>
          <li>
            <button onClick={() => setModalType('date')}>여행 일정 수정</button>
          </li>
          <li className="text-red-500">
            <button onClick={() => setModalType('delete')}>여행 삭제</button>
          </li>
        </ul>
        <button
          onClick={onClose}
          className="mt-6 w-full py-2 text-sm text-gray-500 border-t border-gray-200"
        >
          닫기
        </button>
      </div>
    </div>
  );
};

export default EditModal;
