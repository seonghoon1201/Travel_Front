import React, { useMemo, useState } from 'react';
import { X, ChevronRight, CheckCircle } from 'lucide-react';
import { useNavigate } from "react-router-dom";

const ScheduleSelectModal = ({
  open,
  onClose,
  trips = [],
  selectedId,
}) => {
  const navigate = useNavigate();

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const { upcoming, past } = useMemo(() => {
    const u = [];
    const p = [];
    (trips || []).forEach((t) => {
      const start = new Date(t.startDate);
      start.setHours(0, 0, 0, 0);
      const tripWithWritten = {
        ...t,
        isWritten: t.boarded === true
      };
      (start >= today ? u : p).push(tripWithWritten);
    });
    return { upcoming: u, past: p };
  }, [trips, today]);

  const [tempSelected, setTempSelected] = useState(selectedId || null);

  if (!open) return null;

  const Section = ({ title, items }) => (
    <div className="mt-3">
      <p className="text-xs font-semibold text-gray-500 mb-2">{title}</p>
      <div className="space-y-2 max-h-44 overflow-auto pr-1">
        {items.length === 0 ? (
          <p className="text-xs text-gray-400 pl-1">없습니다.</p>
        ) : (
          items.map((t) => (
            <label
              key={t.scheduleId}
              className={`flex items-center gap-3 p-2 border rounded-lg cursor-pointer ${
                t.isWritten 
                  ? 'border-green-200 bg-green-50/50' 
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="schedule"
                value={t.scheduleId}
                checked={tempSelected === t.scheduleId}
                onChange={() => setTempSelected(t.scheduleId)}
                disabled={t.isWritten} 
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`text-sm font-medium truncate ${
                    t.isWritten ? 'text-gray-500' : ''
                  }`}>
                    {t.scheduleName}
                  </p>
                  {t.isWritten && (
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  )}
                </div>
                <p className={`text-xs ${
                  t.isWritten ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {t.startDate} ~ {t.endDate}
                </p>
                {t.isWritten && (
                  <p className="text-xs text-green-600 font-medium">
                    일기 작성 완료
                  </p>
                )}
              </div>
              <ChevronRight className={`w-4 h-4 ${
                t.isWritten ? 'text-gray-300' : 'text-gray-400'
              }`} />
            </label>
          ))
        )}
      </div>
    </div>
  );

  const hasAvailableSchedules = trips.some(t => !t.boarded);

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/30">
      <div className="w-full max-w-md bg-white rounded-t-2xl md:rounded-2xl shadow-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-semibold">일정 선택</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X />
          </button>
        </div>

        {trips.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-gray-500 mb-4">
              아직 등록된 여행 일정이 없습니다.
            </p>
            <button
              onClick={() => (window.location.href = '/plan/create')}
              className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-sky-500 text-white"
            >
              일정 만들기
            </button>
          </div>
        ) : !hasAvailableSchedules ? (
          <div className="py-8 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-sm text-gray-500 mb-2">
              모든 여행 일정의 일기를 작성하셨습니다!
            </p>
            <p className="text-xs text-gray-400">
              새로운 여행 일정을 만들어보세요.
            </p>
            <button
              onClick={() => (window.location.href = '/plan/create')}
              className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-sky-500 text-white mt-4"
            >
              새 일정 만들기
            </button>
          </div>
        ) : (
          <>
            <Section title="다가오는 여행" items={upcoming} />
            <Section title="지난 여행" items={past} />

            <div className="mt-3 p-1 bg-blue-50 rounded-lg flex items-center">
              <p className="text-xs text-blue-700">
                💡 이미 일기를 작성한 일정은 선택할 수 없습니다.
              </p>
            </div>


            <div className="mt-4 flex gap-2">
              <button
                onClick={onClose}
                className="w-1/2 py-2 rounded-xl border border-gray-200 text-sm"
              >
                취소
              </button>
              <button
                onClick={() => {
                  const selected = trips.find((t) => t.scheduleId === tempSelected);
                  if (selected && !selected.boarded) {
                    navigate(`/write/travel/diary?scheduleId=${selected.scheduleId}`);
                  }
                }}
                className="w-1/2 py-2 rounded-xl bg-sky-500 text-white text-sm disabled:opacity-50"
                disabled={!tempSelected || trips.find(t => t.scheduleId === tempSelected)?.boarded}
              >
                선택 완료
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ScheduleSelectModal;