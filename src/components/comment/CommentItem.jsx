import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import defaultProfile from '../../assets/profile_default.png';
import useUserStore from '../../store/userStore';
import { deleteComment } from '../../api/comment/deleteComment';

const CommentItem = ({
  nickname,
  content,
  createdAt,
  profileImage,
  commentId,
  onDeleteSuccess,
}) => {
  const { nickname: myNickname } = useUserStore();

  const handleDelete = async () => {
    if (window.confirm('댓글을 삭제하시겠습니까?')) {
      const res = await deleteComment(commentId);
      if (res.success) onDeleteSuccess();
      else alert('삭제 실패');
    }
  };

  return (
    <div className="flex items-start gap-2">
      <img
        src={profileImage || defaultProfile}
        alt="profile"
        className="w-8 h-8 rounded-full object-cover"
      />
      <div className="flex-1">
        <div className="flex gap-2 items-center">
          <span className="font-semibold text-sm">{nickname}</span>
          <span className="text-xs text-gray-400">
            {new Date(createdAt).toLocaleDateString('ko-KR')}
          </span>
        </div>
        <p className="text-sm">{content}</p>
      </div>

      {/* 본인 댓글일 때만 더보기 */}
      {nickname === myNickname && (
        <button
          onClick={handleDelete}
          className="p-1 text-gray-400 hover:text-gray-600"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default CommentItem;
