import { useState } from 'react';

const MemoModal = ({ onClose, onSave, defaultValue = '' }) => {
  const [memo, setMemo] = useState(defaultValue);

  const handleSave = () => {
    onSave(memo);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-[300px] p-4 shadow-lg">
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="내용을 입력하세요"
          className="w-full h-40 resize-none text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
        />

        <div className="border-t mt-4 flex justify-between text-sm text-gray-500">
          <button
            onClick={onClose}
            className="w-1/2 py-2 border-r hover:bg-gray-50"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="w-1/2 py-2 text-blue-500 hover:bg-blue-50"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemoModal;
