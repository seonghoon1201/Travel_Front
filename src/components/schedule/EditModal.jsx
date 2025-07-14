import React from 'react';

const EditModal = ({ onClose }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-30"
      onClick={onClose}
    >
      <div
        className="bg-white w-full rounded-t-xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-sm pb-3 text-gray-500 mb-4">편집</p>
        <ul className="text-gray-700 space-y-8">
          <li>여행 도시 추가 및 편집</li>
          <li>여행 제목 수정</li>
          <li>여행 날짜 수정</li>
          <li>여행 스타일 등록 및 수정</li>
          <li>여행 삭제</li>
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
