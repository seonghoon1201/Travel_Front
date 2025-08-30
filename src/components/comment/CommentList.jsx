import React, { useEffect, useState } from 'react';
import CommentItemList from './CommentItemList';
import CommentInput from './CommentInput';
import { getComments } from '../../api/comment/getComment';
import { deleteComment } from '../../api/comment/deleteComment';
import { createComment } from '../../api/comment/createComment';
import useUserStore from '../../store/userStore';
import { normalizeBoardId } from '../../utils/normalizeBoardId';


const CommentList = ({ boardId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userId, token } = useUserStore();

  // 댓글 조회
  const fetchComments = async () => {
    try {
      setLoading(true);
      console.log('댓글 조회 시작, boardId:', boardId); // 디버깅
      
      const res = await getComments(boardId);
      console.log('댓글 API 응답:', res); // 디버깅
      
      if (res?.success) {
        // 응답 구조 확인
        const commentData = res.data?.comments || res.data || [];
        console.log('댓글 데이터:', commentData); // 디버깅
        
        if (Array.isArray(commentData)) {
          setComments(commentData);
        } else {
          console.warn('댓글 데이터가 배열이 아님:', commentData);
          setComments([]);
        }
      } else {
        console.warn('댓글 조회 실패:', res);
        setComments([]);
      }
    } catch (error) {
      console.error('댓글 조회 에러:', error);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (boardId) {
      fetchComments();
    }
  }, [boardId]);

  // 댓글 생성
  const handleCreate = async (content) => {
    try {
      const safeId = normalizeBoardId(boardId);
      if (!safeId || safeId === 'anonymousUser') {
        alert('잘못된 게시글 ID입니다.');
        return;
      }

      await createComment({ boardId: safeId, content });
      await fetchComments();
    } catch (e) {
      console.error('댓글 생성 에러:', e);
    }
  };

  // 댓글 삭제
  const handleDelete = async (commentId) => {
    try {
      const res = await deleteComment(commentId);
      if (res?.success) {
        setComments((prev) => prev.filter((c) => c.commentId !== commentId));
      }
    } catch (error) {
      console.error('댓글 삭제 에러:', error);
    }
  };

  if (loading) {
    return (
      <div className="mt-8">
        <h3 className="font-bold text-base mb-3">댓글</h3>
        <div className="text-gray-500">댓글을 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h3 className="font-bold text-base mb-3">
        댓글 {comments.length > 0 && `(${comments.length})`}
      </h3>
      
      {/* 댓글 목록 */}
      {comments.length === 0 ? (
        <div className="text-gray-500 py-4">아직 댓글이 없습니다. 첫 댓글을 작성해보세요!</div>
      ) : (
        <CommentItemList 
          comments={comments} 
          userId={userId} 
          onDelete={handleDelete} 
        />
      )}

      {/* 댓글 작성 */}
      <CommentInput 
        onSubmit={handleCreate}
        disabled={loading}
      />
      
      {/* 디버깅용 - 나중에 제거 */}
      <div className="mt-4 p-2 bg-gray-100 rounded text-xs">
        <div>boardId: {boardId}</div>
        <div>userId: {userId}</div>
        <div>댓글 수: {comments.length}</div>
      </div>
    </div>
  );
};

export default CommentList;