import axios from 'axios';
import { API_BASE_URL } from '../config';
import { getItem } from '../../utils/localStorage';

export async function deleteComment(commentId) {
  if (!commentId) throw new Error('commentId 없음');

  const accessToken = getItem('accessToken', '');
  try {
    const res = await axios.delete(`${API_BASE_URL}/comment/${commentId}`, {
      headers: {
        Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
        'Content-Type': 'application/json',
      },
      withCredentials: false,
    });

    return { success: true, data: res.data };
  } catch (error) {
    console.error('[deleteComment] 실패:', error?.response?.data || error.message);
    return { success: false, error: error?.response?.data || '댓글 삭제 실패' };
  }
}
