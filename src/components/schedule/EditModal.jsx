import { useState } from 'react';
import EditTitle from './edit/EditTitle';
import EditDate from './edit/EditDate';

const EditModal = ({ onClose }) => {
  const [modalType, setModalType] = useState(null); // 'title', 'city' 등

  // 모달 내에서 서브 모달 전환
  if (modalType === 'title') {
    return (
      <EditTitle
        currentTitle="제주도 여행"
        onClose={() => setModalType(null)}
        onSave={(newTitle) => {
          console.log('저장된 제목:', newTitle);
          setModalType(null);
          onClose();
        }}
      />
    );
  }

  if (modalType === 'date') {
    return (
      <EditDate
        currentDates={[]}
        currentPlace=""
        currentTime={{ ampm: 'AM', hour: '', minute: '' }}
        onClose={() => setModalType(null)}
        onSave={(data) => {
          console.log('저장된 날짜 정보:', data);
          setModalType(null);
          onClose();
        }}
      />
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/30"
      onClick={onClose}
    >
      <div
        className="bg-white w-full rounded-t-xl p-6"
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
