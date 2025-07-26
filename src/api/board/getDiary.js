import axios from 'axios';
import { API_BASE_URL } from '../config';
import { getItem } from '../../utils/localStorage';

/**
 * 여행일기 목록 조회
 * @param {number} page 페이지 번호
 * @param {number} size 페이지 크기
 */
export const getDiary = async (page = 0, size = 10) => {
  const accessToken = getItem('accessToken');

  try {
    const res = await axios.get(`${API_BASE_URL}/board`, {
      params: { page, size },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return { success: true, data: res.data };
  } catch (error) {
    console.error('여행일기 조회 실패:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data || '여행일기 조회 실패',
    };
  }
};
