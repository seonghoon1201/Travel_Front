import axios from 'axios';
import { API_BASE_URL } from '../config';
import { getItem } from '../../utils/localStorage';

export const getComments = async (boardId, page = 1, size = 50) => { // size 50으로 변경
  const token = getItem('accessToken');

  try {
    const res = await axios.get(`${API_BASE_URL}/comment/${boardId}`, {
      params: { page, size },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return { success: true, data: res.data };
  } catch (error) {
    console.error('댓글 조회 실패:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data || '댓글 조회 실패',
    };
  }
};
