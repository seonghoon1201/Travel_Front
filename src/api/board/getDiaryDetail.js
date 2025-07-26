import axios from 'axios';
import { API_BASE_URL } from '../config';
import { getItem } from '../../utils/localStorage';

export const getDiaryDetail = async (boardId) => {
  const accessToken = getItem('accessToken');

  try {
    const res = await axios.get(`${API_BASE_URL}/board/${boardId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return { success: true, data: res.data };
  } catch (error) {
    console.error(
      '여행일기 상세 조회 실패:',
      error.response?.data || error.message
    );
    return { success: false, error: error.response?.data || '조회 실패' };
  }
};
