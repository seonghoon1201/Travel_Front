import React from "react";
import PrimaryButton from "../common/PrimaryButton";

const CommonModal = ({ isOpen, message, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="font-pretendard fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl p-6 w-80 text-center">
        <p className="text-gray-800 text-sm font-medium whitespace-pre-line mb-4">
          {message}
        </p>
        <PrimaryButton
          onClick={onConfirm}
        >
          확인
        </PrimaryButton>
      </div>
    </div>
  );
};

export default CommonModal;
