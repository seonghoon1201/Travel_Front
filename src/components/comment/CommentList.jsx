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

// 최신순(내림차순) 정렬 함수: 최근(createdAt)이 위로
const byNewest = (a, b) =>
  new Date(b.createdAt || 0) - new Date(a.createdAt || 0);

const CommentList = ({ boardId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [moreLoading, setMoreLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);

  const { nickname, profileImageUrl } = useUserStore();
  const safeId = normalizeBoardId(boardId);

  // 이미 로드된 commentId 중복 방지용
  const commentMap = useMemo(() => {
    const map = new Map();
    comments.forEach((c) => map.set(String(c.commentId), true));
    return map;
  }, [comments]);

  const toItem = (c) => ({
    commentId: c.commentId ?? c.id ?? crypto.randomUUID(),
    content: c.content ?? '',
    userNickname: c.userNickname ?? c.nickname ?? '익명',
    userProfileImage: c.userProfileImage ?? c.profileImageUrl ?? '',
    createdAt: c.createdAt ?? null,
  });

  // 최초 로드 / board 변경 시
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

  // 더 보기
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
      merged.sort(byNewest); // 병합 후 최신순 보장
      return merged;
    });

    setHasNext(Boolean(res?.data?.hasNext));
    setPage(nextPage);
    setMoreLoading(false);
  };

  // 작성(낙관적 업데이트: 위에 바로 추가)
  const handleCreate = async (content) => {
    try {
      if (!safeId) return alert('잘못된 게시글 ID입니다.');

      const tempId = `temp-${Date.now()}`;
      const optimistic = {
        commentId: tempId,
        content,
        userNickname: nickname || '나',
        userProfileImage: profileImageUrl || '',
        createdAt: new Date().toISOString(),
        _pending: true,
      };

      // 최신이 위이므로 앞에 추가
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
          const replaced = prev.map((x) =>
            x.commentId === tempId ? real : x
          );
          replaced.sort(byNewest);
          return replaced;
        });
      } else {
        // 서버가 객체를 즉시 안 주면 첫 페이지 재동기화 (최신순 유지)
        const sync = await getComments(safeId, 0, PAGE_SIZE);
        const synced = (sync?.data?.comments || []).map(toItem);
        synced.sort(byNewest);
        setComments(synced);
        setPage(0);
        setHasNext(Boolean(sync?.data?.hasNext));
      }
    } catch (e) {
      console.error('댓글 생성 에러:', e);
      // 실패 시 임시 아이템 롤백
      setComments((prev) =>
        prev.filter((x) => !String(x.commentId).startsWith('temp-'))
      );
      alert(e?.message || '댓글 작성 실패');
    }
  };

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
        <>
          <CommentItemList comments={comments} onDelete={handleDelete} />
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

    </div>
  );
};

export default CommentList;
