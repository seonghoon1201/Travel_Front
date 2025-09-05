import React from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import CommentActionModal from '../../components/modal/CommentActionModal';

dayjs.extend(utc);
dayjs.extend(timezone);

const CommentItem = ({ comment, onDelete, onEdit, onReport }) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState(comment.content);

  return (
    <div className="flex items-start gap-2 py-2">
      {/* 프로필 이미지 */}
      <img
        src={comment.userProfileImage}
        alt="profile"
        className="w-8 h-8 rounded-full object-cover bg-gray-200"
      />

      {/* 본문 */}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{comment.userNickname || '익명'}</span>
          <span className="text-xs text-gray-400">
            {comment.createdAt && dayjs(comment.createdAt).isValid()
              ? dayjs.utc(comment.createdAt).tz('Asia/Seoul').format('MM.DD HH:mm')
              : '시간 정보 없음'}
          </span>
        </div>

        {isEditing ? (
          <div className="mt-1">
            <textarea
              className="w-full border rounded p-1 text-sm"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
            />
           <div className="flex gap-2 mt-1 text-xs justify-end">
              <button
                className="px-2 py-1 bg-primary text-white rounded"
                onClick={() => {
                  onEdit(comment.commentId, editValue);
                  setIsEditing(false);
                }}
              >
                저장
              </button>
              <button
                className="px-2 py-1 bg-gray-200 rounded"
                onClick={() => {
                  setEditValue(comment.content);
                  setIsEditing(false);
                }}
              >
                취소
              </button>
            </div>

          </div>
        ) : (
          <p className="text-sm mt-1">{comment.content || '내용 없음'}</p>
        )}
      </div>

      {/* 액션 메뉴 */}
      <CommentActionModal
        commentId={comment.commentId}
        writerUserId={comment.userId}
        writerNickname={comment.userNickname}
        onDelete={onDelete}
        onEdit={() => setIsEditing(true)} 
        onReport={onReport}
      />
    </div>
  );
};

const CommentItemList = ({ comments, onDelete, onEdit, onReport }) => {
  if (!Array.isArray(comments)) {
    console.warn('comments가 배열이 아닙니다:', comments);
    return <div className="text-red-500">댓글 데이터 오류</div>;
  }

  if (comments.length === 0) {
    return <div className="text-gray-500">댓글이 없습니다.</div>;
  }

  return (
    <div className="space-y-1">
      {comments.map((comment, index) => (
        <CommentItem
          key={comment.commentId || `comment-${index}`}
          comment={comment}
          onDelete={onDelete}
          onEdit={onEdit}
          onReport={onReport}
        />
      ))}
    </div>
  );
};

export default CommentItemList;
