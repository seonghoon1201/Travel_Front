import axios from 'axios';
import { API_BASE_URL } from '../config';
import { getItem } from '../../utils/localStorage';

/**
 * 댓글 수정 API
 * @param {string} commentId - 수정할 댓글 ID
 * @param {string} content - 수정할 댓글 내용
 * @returns {Promise<{ success: boolean, data?: any, error?: any }>}
 */
export const updateComment = async (commentId, content) => {
  const token = getItem('accessToken');

  if (!token) {
    console.error('토큰이 없습니다. 로그인 상태를 확인하세요.');
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const res = await axios.put(
      `${API_BASE_URL}/comment/${commentId}`,
      { content },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return { success: true, data: res.data };
  } catch (error) {
    console.error('댓글 수정 실패:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data || '댓글 수정 실패',
    };
  }
};
