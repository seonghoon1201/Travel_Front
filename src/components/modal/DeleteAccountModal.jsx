import React, { useEffect, useCallback } from 'react';
import { Trash2, X } from 'lucide-react';

const DeleteAccountModal = ({ open, onClose, onConfirm, loading = false }) => {
  // ESC로 닫기
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  const stop = useCallback((e) => e.stopPropagation(), []);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      aria-modal="true"
      role="dialog"
      onClick={onClose}
    >
      {/* dim */}
      <div className="absolute inset-0 bg-black/50" />

      {/* dialog */}
      <div
        className="relative z-[101] w-[88%] max-w-[360px] rounded-2xl bg-white p-6 shadow-xl"
        onClick={stop}
      >
        {/* close */}
        <button
          className="absolute right-3 top-3 p-1 rounded-md hover:bg-gray-100"
          onClick={onClose}
          aria-label="닫기"
        >
          <X className="w-5 h-5" />
        </button>

        {/* icon */}
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100">
          <Trash2 className="w-8 h-8 text-rose-500" />
        </div>

        {/* title */}
        <h2 className="text-center text-lg font-extrabold text-gray-900 mb-2">
          정말 탈퇴하시겠어요?
        </h2>
        <p className="text-center text-sm text-gray-500 mb-6 leading-6">
          탈퇴 버튼 선택 시 계정은 삭제되며<br />복구되지 않습니다.
        </p>

        {/* actions */}
        <div className="flex flex-col gap-3">
          <button
            className="h-11 rounded-xl bg-rose-500 text-white font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? '처리 중…' : '탈퇴'}
          </button>
          <button
            className="h-11 rounded-xl bg-gray-100 text-gray-600 font-semibold"
            onClick={onClose}
            disabled={loading}
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountModal;
