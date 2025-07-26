import axios from 'axios';
import { API_BASE_URL } from '../config';
import { getItem } from '../../utils/localStorage';

export const updateDiary = async (boardId, updateData) => {
  const token = getItem('accessToken');
  try {
    const res = await axios.put(
      `${API_BASE_URL}/board/${boardId}`,
      updateData,
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      }
    );
    return { success: true, data: res.data };
  } catch (error) {
    console.error('게시글 수정 실패:', {
      status: error.response?.status,
      data: error.response?.data,
    });
    return { success: false, error: error.response?.data || '수정 실패' };
  }
};
