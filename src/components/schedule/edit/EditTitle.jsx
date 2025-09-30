import { useState } from 'react';

const EditTitle = ({ currentTitle, onClose, onSave }) => {
  const [title, setTitle] = useState(currentTitle || '');

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/30"
      onClick={onClose}
    >
      <div
        className="bg-white w-full mx-auto rounded-t-xl px-4 sm:px-6 md:px-8 pt-6 pb-3 overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-sm text-gray-500 mb-2">여행 제목 수정</p>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-lg font-bold focus:outline-none"
        />

        <div className="border-t mt-6 flex justify-between text-sm text-gray-500 footer-safe">
          <button
            onClick={onClose}
            className="w-1/2 py-3 border-r hover:bg-gray-50"
          >
            취소
          </button>
          <button
            onClick={() => {
              onSave(title);
              onClose();
            }}
            className="w-1/2 py-3 text-blue-500 hover:bg-blue-50"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditTitle;
