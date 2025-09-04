import React, { useMemo, useState } from 'react';
import { X, ChevronRight } from 'lucide-react';
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
      (start >= today ? u : p).push(t);
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
              className="flex items-center gap-3 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="radio"
                name="schedule"
                value={t.scheduleId}
                checked={tempSelected === t.scheduleId}
                onChange={() => setTempSelected(t.scheduleId)}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{t.scheduleName}</p>
                <p className="text-xs text-gray-500">
                  {t.startDate} ~ {t.endDate}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </label>
          ))
        )}
      </div>
    </div>
  );

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
        ) : (
          <>
            <Section title="다가오는 여행" items={upcoming} />
            <Section title="지난 여행" items={past} />

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
                  if (selected) {
                    // ✅ 쿼리스트링 방식으로 이동
                    navigate(`/write/travel/diary?scheduleId=${selected.scheduleId}`);
                  }
                }}
                className="w-1/2 py-2 rounded-xl bg-sky-500 text-white text-sm disabled:opacity-50"
                disabled={!tempSelected}
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
