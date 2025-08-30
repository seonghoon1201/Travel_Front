import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import dayjs from 'dayjs';
import defaultProfile from '../../assets/profile_default.png';

const CommentItemList = ({ comments, userId, onDelete }) => {
  return (
    <div className="space-y-2">
      {comments.map((comment) => (
        <div key={comment.commentId} className="flex items-start gap-2 py-2">
          {/* 프로필 이미지 */}
          <img
            src={comment.userProfileImage || defaultProfile}
            alt="profile"
            className="w-8 h-8 rounded-full object-cover"
          />

          {/* 본문 */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">{comment.userNickname}</span>
              <span className="text-xs text-gray-400">
                {dayjs(comment.createdAt).isValid()
                  ? dayjs(comment.createdAt).format('YYYY.MM.DD HH:mm')
                  : '날짜 오류'}
              </span>
            </div>
            <p className="text-sm">{comment.content}</p>
          </div>

          {/* 삭제 버튼 (본인 댓글만 표시) */}
          {userId === comment.userId && (
            <button
              className="p-1 text-gray-400 hover:text-gray-600"
              onClick={() => onDelete(comment.commentId)}
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default CommentItemList;
