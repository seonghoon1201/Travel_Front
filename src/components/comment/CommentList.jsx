import React, { useEffect, useState, useMemo, useRef } from 'react';
import CommentItemList from './CommentItemList';
import CommentInput from './CommentInput';
import { getComments } from '../../api/comment/getComment';
import { deleteComment } from '../../api/comment/deleteComment';
import { createComment } from '../../api/comment/createComment';
import { updateComment } from '../../api/comment/updateComment';
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
  const [totalCount, setTotalCount] = useState(0);
  const commentSectionRef = useRef(null);

  const { userId: currentUserId, nickname, profileImageUrl } = useUserStore();
  const safeId = normalizeBoardId(boardId);

  const commentMap = useMemo(() => {
    const map = new Map();
    comments.forEach((c) => map.set(String(c.commentId), true));
    return map;
  }, [comments]);

  const toItem = (c) => ({
    commentId: c.commentId ?? c.id ?? crypto.randomUUID(),
    content: c.content ?? '',
    userId: c.userId ?? c.writerId ?? c.authorId ?? null,
    userNickname: c.userNickname ?? c.nickname ?? '익명',
    userProfileImage: c.userProfileImage ?? c.profileImageUrl ?? '',
    createdAt: c.createdAt ?? null,
  });

  // 최초 로드
  const loadInitialComments = async () => {
    if (!safeId) {
      setComments([]);
      setHasNext(false);
      setTotalCount(0);
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
    setTotalCount(res?.data?.totalCount ?? list.length); 
    setLoading(false);
  };

  useEffect(() => {
    loadInitialComments();
  }, [safeId]);

  // loadMore 함수 수정 부분
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
  setTotalCount((prev) => {
    const currentLoaded = comments.length + more.length;
    return res?.data?.hasNext ? Math.max(prev, currentLoaded) : currentLoaded;
  });
  setPage(nextPage);
  setMoreLoading(false);
};

  const scrollToTopAndReset = async () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    await loadInitialComments();
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

      setComments((prev) => [optimistic, ...prev].sort(byNewest));
      setTotalCount(prev => prev + 1); 

      const res = await createComment({ boardId: safeId, content });
      const c = res?.data;

      if (c && typeof c === 'object') {
        const real = toItem(c);
        setComments((prev) =>
          prev.map((x) => (x.commentId === tempId ? real : x)).sort(byNewest)
        );
      } else {
       
        const sync = await getComments(safeId, 0, PAGE_SIZE);
        const synced = (sync?.data?.comments || []).map(toItem);
        synced.sort(byNewest);
        setComments(synced);
        setPage(0);
        setHasNext(Boolean(sync?.data?.hasNext));
        setTotalCount(sync?.data?.totalCount ?? synced.length);
      }
    } catch (e) {
      console.error('댓글 생성 에러:', e);
      setComments((prev) =>
        prev.filter((x) => !String(x.commentId).startsWith('temp-'))
      );
      setTotalCount(prev => Math.max(0, prev - 1)); 
    }
  };

  const handleDelete = async (commentId) => {
    try {
      const res = await deleteComment(commentId);
      if (res?.success) {
        setComments((prev) =>
          prev.filter((c) => c.commentId !== commentId).sort(byNewest)
        );
        setTotalCount(prev => Math.max(0, prev - 1));
      }
    } catch (e) {
      console.error('댓글 삭제 에러:', e);
    }
  };

  const handleEdit = async (commentId, newContent) => {
    if (!newContent) return;
    const res = await updateComment(commentId, newContent);
    if (res?.success) {
      setComments((prev) =>
        prev.map((c) =>
          c.commentId === commentId ? { ...c, content: newContent } : c
        ).sort(byNewest)
      );
    } else {
      alert(res?.error || '댓글 수정 실패');
    }
  };

  // 신고 (임시)
  const handleReport = async (commentId) => {
    alert('신고가 접수되었습니다.');
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
    <div className="mt-8" ref={commentSectionRef}>
      <h3 className="font-bold text-base mb-3">
        댓글 {totalCount > 0 && `(${totalCount})`}
      </h3>

      {comments.length === 0 ? (
        <div className="text-gray-500 py-4">
          아직 댓글이 없습니다. 첫 댓글을 작성해보세요!
        </div>
      ) : (
        <>
          <CommentItemList
            comments={comments}
            userId={currentUserId}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onReport={handleReport}
          />
          {(hasNext || page > 0) && (
            <div className="mt-3 flex justify-between items-center">
              {hasNext && (
                <button
                  onClick={loadMore}
                  disabled={moreLoading}
                  className="px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200 text-sm"
                >
                  {moreLoading ? '불러오는 중...' : '댓글 더 보기'}
                </button>
              )}

              {page > 0 && (
                <button
                  onClick={scrollToTopAndReset}
                  className="px-3 py-1.5 rounded bg-primary hover:bg-blue-200 text-white text-sm font-medium"
                >
                  ↑ 맨 위로
                </button>
              )}
            </div>
          )}

        </>
      )}

      <div className="pb-1"> 
        <CommentInput onSubmit={handleCreate} disabled={loading || moreLoading} />
      </div>
    </div>
  );
};

export default CommentList;