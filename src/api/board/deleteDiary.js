import axios from 'axios';
import { API_BASE_URL } from '../config';
import { getItem } from '../../utils/localStorage';

export const deleteDiary = async (boardId) => {
  const token = getItem('accessToken');
  if (!token) {
    console.error('토큰이 없습니다. 로그인 상태를 확인하세요.');
    throw new Error('Unauthorized');
  }

  try {
    const res = await axios.delete(`${API_BASE_URL}/board/${boardId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error) {
    console.error('게시글 삭제 실패:', error.response?.data || error.message);
    throw error;
  }
};