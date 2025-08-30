import axios from 'axios';
import { API_BASE_URL } from '../config';
import { getItem } from '../../utils/localStorage';

/**
 * 댓글 수정
 * @param {string|number} commentId 댓글 ID
 * @param {string} content 수정할 내용
 */
export async function updateComment(commentId, content) {
  const accessToken = getItem('accessToken', '');
  try {
    const res = await axios.put(
      `${API_BASE_URL}/comment/${commentId}`,
      { content },
      {
        headers: {
          Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
          'Content-Type': 'application/json',
        },
      }
    );
    return { success: true, data: res.data };
  } catch (error) {
    console.error('[updateComment] 실패:', error?.response?.data || error.message);
    return { success: false, error: error?.response?.data || '댓글 수정 실패' };
  }
}
