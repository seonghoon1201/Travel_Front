import axios from 'axios';
import { API_BASE_URL } from '../config';
import { getItem } from '../../utils/localStorage';

export async function getComments(boardId) {
  if (!boardId) throw new Error('boardId 없음');

  const accessToken = getItem('accessToken', '');
  try {
    const res = await axios.get(`${API_BASE_URL}/comment/${boardId}`, {
      headers: {
        Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
        'Content-Type': 'application/json',
      },
      withCredentials: false,
    });

    // 응답 형태가 { comments: [] } 또는 [] 둘 다 수용
    const comments = Array.isArray(res.data?.comments) ? res.data.comments
                    : Array.isArray(res.data) ? res.data
                    : [];
    return { success: true, data: { comments } };
  } catch (error) {
    console.error('[getComments] 실패:', error?.response?.data || error.message);
    return { success: false, error: error?.response?.data || '댓글 조회 실패' };
  }
}
