import React, { useState } from 'react';
import { Send } from 'lucide-react';
import useUserStore from '../../store/userStore';
import defaultProfile from '../../assets/profile_default.png';
// (선택) 상대경로일 수 있으면 API_BASE_URL로 절대경로화
import { API_BASE_URL } from '../../api/config';

const normalizeUrl = (u) => {
  if (!u || typeof u !== 'string') return '';
  const s = u.trim();
  if (/^https?:\/\//i.test(s)) return s;
  if (s.startsWith('//')) return `https:${s}`;
  if (s.startsWith('/')) return `${API_BASE_URL}${s}`;
  return s;
};

const CommentInput = ({ onSubmit, disabled = false }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ store에서 profileImageUrl 그대로 사용
  const profileImageUrl = useUserStore((state) => state.profileImageUrl);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = content.trim();
    if (!text) return;
    try {
      setIsSubmitting(true);
      await onSubmit(text);
      setContent('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="border-t pt-4 mt-4">
      <form onSubmit={handleSubmit}>
        <div className="flex items-start gap-3">
          <img
            src={normalizeUrl(profileImageUrl) || defaultProfile}
            alt="내 프로필"
            className="w-8 h-8 rounded-full object-cover bg-gray-200"
            onError={(e) => { e.currentTarget.src = defaultProfile; }}
          />
          <div className="flex-1">
            <div className="relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="댓글을 작성해주세요..."
                disabled={disabled || isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                rows={2}
                maxLength={500}
              />
              <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                {content.length}/500
              </div>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-500">Shift + Enter로 줄바꿈</span>
              <button
                type="submit"
                disabled={!content.trim() || disabled || isSubmitting}
                className="flex items-center gap-1 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    작성 중...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    댓글 작성
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CommentInput;
