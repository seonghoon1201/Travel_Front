import axios from 'axios';
import { API_BASE_URL } from '../config';
import { getItem } from '../../utils/localStorage';

export const deleteComment = async (commentId) => {
  const token = getItem('accessToken');

  try {
    const res = await axios.delete(`${API_BASE_URL}/comment/${commentId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return { success: true, data: res.data };
  } catch (error) {
    console.error('댓글 삭제 실패:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data || '댓글 삭제 실패',
    };
  }
};
