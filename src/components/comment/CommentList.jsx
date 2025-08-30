// src/components/comment/CommentList.jsx
import React, { useEffect, useState, useMemo } from 'react';
import CommentItemList from './CommentItemList';
import CommentInput from './CommentInput';
import { getComments } from '../../api/comment/getComment';
import { deleteComment } from '../../api/comment/deleteComment';
import { createComment } from '../../api/comment/createComment';
import useUserStore from '../../store/userStore';
import { normalizeBoardId } from '../../utils/normalizeBoardId';

const PAGE_SIZE = 5;
const byNewest = (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0);

const CommentList = ({ boardId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [moreLoading, setMoreLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);

  // ✅ userId, nickname, profileImageUrl 모두 가져오기
  const { userId: currentUserId, nickname, profileImageUrl } = useUserStore();
  const safeId = normalizeBoardId(boardId);

  const commentMap = useMemo(() => {
    const map = new Map();
    comments.forEach((c) => map.set(String(c.commentId), true));
    return map;
  }, [comments]);

  // ✅ userId 매핑 추가
  const toItem = (c) => ({
    commentId: c.commentId ?? c.id ?? crypto.randomUUID(),
    content: c.content ?? '',
    userId: c.userId ?? c.writerId ?? c.authorId ?? null,
    userNickname: c.userNickname ?? c.nickname ?? '익명',
    userProfileImage: c.userProfileImage ?? c.profileImageUrl ?? '',
    createdAt: c.createdAt ?? null,
  });

  useEffect(() => {
    const init = async () => {
      if (!safeId) {
        setComments([]);
        setHasNext(false);
        setLoading(false);
        return;
      }
      setLoading(true);
      setPage(0);
      const res = await getComments(safeId, 0, PAGE_SIZE);
      const list = Array.isArray(res?.data?.comments)
        ? res.data.comments.map(toItem)
        : [];
      list.sort(byNewest);
      setComments(list);
      setHasNext(Boolean(res?.data?.hasNext));
      setLoading(false);
    };
    init();
  }, [safeId]);

  const loadMore = async () => {
    if (!hasNext || moreLoading) return;
    setMoreLoading(true);
    const nextPage = page + 1;
    const res = await getComments(safeId, nextPage, PAGE_SIZE);

    const more = (res?.data?.comments || [])
      .map(toItem)
      .filter((c) => !commentMap.get(String(c.commentId)));

    setComments((prev) => {
      const merged = [...prev, ...more];
      merged.sort(byNewest);
      return merged;
    });

    setHasNext(Boolean(res?.data?.hasNext));
    setPage(nextPage);
    setMoreLoading(false);
  };

  // 작성
  const handleCreate = async (content) => {
    try {
      if (!safeId) return alert('잘못된 게시글 ID입니다.');

      const tempId = `temp-${Date.now()}`;
      const optimistic = {
        commentId: tempId,
        content,
        userId: currentUserId ?? null,
        userNickname: nickname || '나',
        userProfileImage: profileImageUrl || '',
        createdAt: new Date().toISOString(),
        _pending: true,
      };

      setComments((prev) => {
        const next = [optimistic, ...prev];
        next.sort(byNewest);
        return next;
      });

      const res = await createComment({ boardId: safeId, content });
      const c = res?.data;

      if (c && typeof c === 'object') {
        const real = toItem(c);
        setComments((prev) => {
          const replaced = prev.map((x) => (x.commentId === tempId ? real : x));
          replaced.sort(byNewest);
          return replaced;
        });
      } else {
        const sync = await getComments(safeId, 0, PAGE_SIZE);
        const synced = (sync?.data?.comments || []).map(toItem);
        synced.sort(byNewest);
        setComments(synced);
        setPage(0);
        setHasNext(Boolean(sync?.data?.hasNext));
      }
    } catch (e) {
      console.error('댓글 생성 에러:', e);
      setComments((prev) => prev.filter((x) => !String(x.commentId).startsWith('temp-')));
      alert(e?.message || '댓글 작성 실패');
    }
  };

  // ✅ 삭제 (모달에서 호출)
  const handleDelete = async (commentId) => {
    try {
      const res = await deleteComment(commentId);
      if (res?.success) {
        setComments((prev) => {
          const next = prev.filter((c) => c.commentId !== commentId);
          next.sort(byNewest);
          return next;
        });
      }
    } catch (e) {
      console.error('댓글 삭제 에러:', e);
    }
  };

  // ✅ 수정 (임시: prompt로 내용 입력 → 로컬만 반영 / 필요하면 update API 연결)
  const handleEdit = async (commentId) => {
    const target = comments.find((c) => c.commentId === commentId);
    if (!target) return;
    const nextContent = window.prompt('댓글을 수정하세요:', target.content);
    if (nextContent == null || nextContent === target.content) return;

    // TODO: updateComment(commentId, nextContent) 호출로 서버 반영
    setComments((prev) => {
      const next = prev.map((c) =>
        c.commentId === commentId ? { ...c, content: nextContent } : c
      );
      next.sort(byNewest);
      return next;
    });
  };

  // ✅ 신고 (임시)
  const handleReport = async (commentId) => {
    // TODO: reportComment(commentId) API 연동
    alert('신고가 접수되었습니다. (데모)');
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
        <div className="text-gray-500 py-4">아직 댓글이 없습니다. 첫 댓글을 작성해보세요!</div>
      ) : (
        <>
          {/* ✅ 모달 콜백들 내려보내기 */}
          <CommentItemList
            comments={comments}
            userId={currentUserId}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onReport={handleReport}
          />
          {hasNext && (
            <div className="mt-3">
              <button
                onClick={loadMore}
                disabled={moreLoading}
                className="px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200 text-sm"
              >
                {moreLoading ? '불러오는 중...' : '댓글 더 보기'}
              </button>
            </div>
          )}
        </>
      )}

      <CommentInput onSubmit={handleCreate} disabled={loading || moreLoading} />

      <div className="mt-4 p-2 bg-gray-100 rounded text-xs">
        <div>boardId: {boardId}</div>
        <div>댓글 수(현재 로드): {comments.length}</div>
        <div>현재 페이지: {page}</div>
        <div>hasNext: {String(hasNext)}</div>
      </div>
    </div>
  );
};

export default CommentList;
