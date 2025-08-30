import axios from 'axios';
import { API_BASE_URL } from '../config';
import { getItem } from '../../utils/localStorage';

export async function getComments(boardId, page = 0, size = 5) {
  if (!boardId) throw new Error('boardId 없음');

  const accessToken = getItem('accessToken', '');
  try {
    const res = await axios.get(`${API_BASE_URL}/comment/${boardId}`, {
      params: { page, size },
      headers: {
        Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
        'Content-Type': 'application/json',
      },
      withCredentials: false,
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
