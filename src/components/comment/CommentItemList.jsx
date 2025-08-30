import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import dayjs from 'dayjs';

const CommentItemList = ({ comments, userId, onDelete }) => {

  if (!Array.isArray(comments)) {
    console.warn('comments가 배열이 아닙니다:', comments);
    return <div className="text-red-500">댓글 데이터 오류</div>;
  }

  if (comments.length === 0) {
    return <div className="text-gray-500">댓글이 없습니다.</div>;
  }

  return (
    <div className="space-y-2">
      {comments.map((comment, index) => {
        
        return (
          <div key={comment.commentId || `comment-${index}`} className="flex items-start gap-2 py-2">
            {/* 프로필 이미지 */}
            <img
              src={comment.userProfileImage }
              alt="profile"
              className="w-8 h-8 rounded-full object-cover bg-gray-200"

            />

            {/* 본문 */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">
                  {comment.userNickname || '익명'}
                </span>
                <span className="text-xs text-gray-400">
                  {comment.createdAt && dayjs(comment.createdAt).isValid()
                    ? dayjs(comment.createdAt).format('MM.DD HH:mm')
                    : '시간 정보 없음'}
                </span>
              </div>
              <p className="text-sm mt-1">
                {comment.content || '내용 없음'}
              </p>
            </div>

            {/* 삭제 버튼 (본인 댓글만 표시) */}
            {userId && comment.userId && userId === comment.userId && (
              <button
                className="p-1 text-gray-400 hover:text-gray-600"
                onClick={() => onDelete(comment.commentId)}
                title="댓글 삭제"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            )}

          </div>
        );
      })}
    </div>
  );
};

export default CommentItemList;