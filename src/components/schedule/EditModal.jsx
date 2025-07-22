import { useState } from 'react';

import EditTitle from './edit/EditTitle';
import EditDate from './edit/EditDate';
import EditStyle from './edit/EditStyle';
import EditDelete from './edit/EditDelete';

const EditModal = ({ onClose }) => {
  const [modalType, setModalType] = useState(null);

  const dummyCompanion = '친구와';
  const dummyStyles = ['맛집 탐방', '힐링 여행'];
  const dummyTransport = '자동차';

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

  if (modalType === 'style') {
    return (
      <EditStyle
        currentCompanion={dummyCompanion}
        currentStyles={dummyStyles}
        currentTransport={dummyTransport}
        onClose={() => setModalType(null)}
        onSave={(data) => {
          console.log('저장된 스타일:', data);
          setModalType(null);
          onClose();
        }}
      />
    );
  }

  if (modalType === 'delete') {
    return (
      <EditDelete
        onClose={() => setModalType(null)}
        onDelete={() => {
          console.log('일정 삭제 실행');
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
        className="bg-white w-full max-w-sm mx-auto rounded-t-xl px-6 pt-6 pb-3 overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={modalType ? 'hidden' : ''}>
          <p className="text-sm pb-3 text-gray-500 mb-4">편집</p>
          <ul className="text-gray-700 space-y-8">
            <li>
              <button onClick={() => setModalType('title')}>
                여행 제목 수정
              </button>
            </li>
            <li>
              <button onClick={() => setModalType('date')}>
                여행 일정 수정
              </button>
            </li>
            <li>
              <button onClick={() => setModalType('style')}>
                여행 스타일 수정
              </button>
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
    </div>
  );
};

export default EditModal;
