import axios from 'axios';
import { API_BASE_URL } from '../config';
import { getItem } from '../../utils/localStorage';

export const createComment = async ({ boardId, content }) => {
  const token = getItem('accessToken');
  try {
    const res = await axios.post(
      `${API_BASE_URL}/comment`, // ← boardId는 바디로 보냄
      { boardId, content },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return { success: true, data: res.data };
  } catch (error) {
    console.error('댓글 작성 실패:', error.message);
    return { success: false };
  }
};