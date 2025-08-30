import axios from 'axios';
import { API_BASE_URL } from '../config';
import { getItem } from '../../utils/localStorage';
import { normalizeBoardId } from '../../utils/normalizeBoardId';

export const getDiaryDetail = async (boardId) => {
  const token = getItem('accessToken');
  const id = normalizeBoardId(boardId); 

  try {
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await axios.get(`${API_BASE_URL}/board/${encodeURIComponent(id)}`, {
      headers,
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
