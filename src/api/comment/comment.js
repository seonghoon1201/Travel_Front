import axios from 'axios';
import { API_BASE_URL } from '../config';
import { getItem } from '../../utils/localStorage';

const baseUrl = `${API_BASE_URL}/comment`;

function getAuthHeaders() {
  const accessToken = getItem('accessToken', '');
  return {
    Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
    'Content-Type': 'application/json',
  };
}


export async function createComment({ boardId, content }) {
  if (!boardId) throw new Error('boardId 없음');
  const text = (content ?? '').trim();
  if (!text) throw new Error('댓글 내용을 입력해주세요.');

  try {
    const res = await axios.post(
      `${baseUrl}/${boardId}`,
      { content: text },
      { headers: getAuthHeaders() }
    );
    return { success: true, data: res.data, status: res.status };
  } catch (error) {
    console.error('[createComment] 실패:', error?.response?.data || error.message);
    return {
      success: false,
      error: error?.response?.data || { code: 'REQUEST_FAILED', message: '댓글 작성 실패' },
      status: error?.response?.status,
    };
  }
}


export async function deleteComment(commentId) {
  if (!commentId) throw new Error('commentId 없음');

  try {
    const res = await axios.delete(`${baseUrl}/${commentId}`, {
      headers: getAuthHeaders(),
    });
    return { success: true, data: res.data };
  } catch (error) {
    console.error('[deleteComment] 실패:', error?.response?.data || error.message);
    return { success: false, error: error?.response?.data || '댓글 삭제 실패' };
  }
}


export async function getComments(boardId, page = 0, size = 5) {
  if (!boardId) throw new Error('boardId 없음');

  try {
    const res = await axios.get(`${baseUrl}/${boardId}`, {
      params: { page, size },
      headers: getAuthHeaders(),
    });

    const raw = res.data || {};
    const comments = Array.isArray(raw.comments)
      ? raw.comments
      : Array.isArray(raw)
      ? raw
      : [];

    const hasNext = Boolean(raw.hasNextComment);

    return { success: true, data: { comments, hasNext } };
  } catch (error) {
    console.error('[getComments] 실패:', error?.response?.data || error.message);
    return { success: false, error: error?.response?.data || '댓글 조회 실패' };
  }
}


export async function updateComment(commentId, content) {
  if (!commentId) throw new Error('commentId 없음');
  if (!content || !content.trim()) throw new Error('수정할 내용이 없음');

  try {
    const res = await axios.put(
      `${baseUrl}/${commentId}`,
      { content },
      { headers: getAuthHeaders() }
    );
    return { success: true, data: res.data };
  } catch (error) {
    console.error('[updateComment] 실패:', error?.response?.data || error.message);
    return { success: false, error: error?.response?.data || '댓글 수정 실패' };
  }
}

export default {
  createComment,
  deleteComment,
  getComments,
  updateComment,
};
