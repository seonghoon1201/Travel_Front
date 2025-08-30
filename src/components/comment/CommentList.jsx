// src/components/comment/CommentList.jsx
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
  const { nickname, profileImageUrl } = useUserStore();

  const safeId = normalizeBoardId(boardId);

  // 댓글 조회 (showSpinner=false면 UI 스피너 없이 조용히 갱신)
  const fetchComments = async (showSpinner = true) => {
    try {
      if (!safeId) {
        setComments([]);
        return;
      }
      if (showSpinner) setLoading(true);

      const res = await getComments(safeId);
      const raw =
        (Array.isArray(res?.data?.comments) && res.data.comments) ||
        (Array.isArray(res?.data) && res.data) ||
        [];

      const list = raw
        .map((c) => ({
          commentId: c.commentId ?? c.id ?? crypto.randomUUID(),
          content: c.content ?? '',
          userNickname: c.userNickname ?? c.nickname ?? '익명',
          userProfileImage: c.userProfileImage ?? c.profileImageUrl ?? '',
          createdAt: c.createdAt ?? null,
        }))
        // 최신순으로 정렬(원하면 asc로 바꿔도 됨)
        .sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));

      setComments(list);
    } catch (e) {
      console.error('댓글 조회 에러:', e);
      setComments([]);
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeId]);

  // 낙관적 업데이트 + 이후 동기화
  const handleCreate = async (content) => {
    try {
      if (!safeId) {
        alert('잘못된 게시글 ID입니다.');
        return;
      }

      // 1) 화면에 먼저 추가 (임시 ID)
      const tempId = `temp-${Date.now()}`;
      const optimistic = {
        commentId: tempId,
        content,
        userNickname: nickname || '나',
        userProfileImage: profileImageUrl || '',
        createdAt: new Date().toISOString(),
        _pending: true, // (선택) UI에서 흐림 처리 등에 사용 가능
      };
      setComments((prev) => [...prev, optimistic]);

      // 2) 서버 저장
      const res = await createComment({ boardId: safeId, content });
      const c = res?.data;

      if (c && typeof c === 'object') {
        // 3A) 서버가 댓글 객체를 반환 → 임시 아이템을 실제 아이템으로 교체
        const real = {
          commentId: c.commentId ?? c.id ?? optimistic.commentId,
          content: c.content ?? optimistic.content,
          userNickname: c.userNickname ?? optimistic.userNickname,
          userProfileImage: c.userProfileImage ?? optimistic.userProfileImage,
          createdAt: c.createdAt ?? optimistic.createdAt,
        };
        setComments((prev) =>
          prev.map((x) => (x.commentId === tempId ? real : x))
        );
      } else {
        // 3B) 객체가 없거나 전파 지연 가능성 → 잠깐 기다렸다가 조용히 재조회
        await new Promise((r) => setTimeout(r, 300));
        await fetchComments(false);
      }
    } catch (e) {
      console.error('댓글 생성 에러:', e);
      // 실패 시 임시 아이템 롤백
      setComments((prev) => prev.filter((x) => !String(x.commentId).startsWith('temp-')));
      alert(e?.message || '댓글 작성 실패');
    }
  };

  const handleDelete = async (commentId) => {
    try {
      const res = await deleteComment(commentId);
      if (res?.success) {
        setComments((prev) => prev.filter((c) => c.commentId !== commentId));
      }
    } catch (e) {
      console.error('댓글 삭제 에러:', e);
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

      {comments.length === 0 ? (
        <div className="text-gray-500 py-4">
          아직 댓글이 없습니다. 첫 댓글을 작성해보세요!
        </div>
      ) : (
        <CommentItemList comments={comments} onDelete={handleDelete} />
      )}

      <CommentInput onSubmit={handleCreate} disabled={loading} />

      {/* 디버깅용 - 필요 없으면 제거 */}
      <div className="mt-4 p-2 bg-gray-100 rounded text-xs">
        <div>boardId: {boardId}</div>
        <div>댓글 수: {comments.length}</div>
      </div>
    </div>
  );
};

export default CommentList;
