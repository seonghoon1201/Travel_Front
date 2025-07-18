import React from 'react';

const EditDelete = ({ onClose, onDelete }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl w-[300px] text-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-sm text-gray-800 mb-6 leading-relaxed">
          일정에 등록된 장소들이 삭제됩니다.
          <br />
          일정을 삭제하겠습니까?
        </p>
        <div className="flex border-t border-gray-200 divide-x mt-1">
          <button
            onClick={onClose}
            className="w-1/2 py-3 text-sm text-red-400 font-medium"
          >
            취소
          </button>
          <button
            onClick={() => {
              onDelete();
              onClose();
            }}
            className="w-1/2 py-3 text-sm text-blue-500 font-medium"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditDelete;
