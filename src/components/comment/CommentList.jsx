import React, { useEffect, useState } from 'react';
import CommentItemList from './CommentItemList';
import { getComments } from '../../api/comment/getComment';
import { deleteComment } from '../../api/comment/deleteComment';
import { createComment } from '../../api/comment/createComment';
import useUserStore from '../../store/userStore';

const CommentList = ({ boardId }) => {
  const [comments, setComments] = useState([]);
  const { userId } = useUserStore();

  // 댓글 조회
  const fetchComments = async () => {
    const res = await getComments(boardId);
    if (res.success && Array.isArray(res.data.comments)) {
      setComments(res.data.comments);
    } else {
      setComments([]);
    }
  };

useEffect(() => {
  const fetch = async () => {
    const res = await getComments(boardId);
    if (res.success) setComments(res.data.comments); // 여기 수정!
  };
  fetch();
}, [boardId]);
  // 댓글 생성
  const handleCreate = async (content) => {
    const res = await createComment({ boardId, content });
    if (res.success) {
      setComments((prev) => [...prev, res.data]);
    }
  };

  // 댓글 삭제
  const handleDelete = async (commentId) => {
    const res = await deleteComment(commentId);
    if (res.success) {
      setComments((prev) => prev.filter((c) => c.commentId !== commentId));
    }
  };

  return (
    <div className="mt-8">
      <h3 className="font-bold text-base mb-3">댓글</h3>
      <CommentItemList comments={comments} userId={userId} onDelete={handleDelete} />
    </div>
  );
};

export default CommentList;
