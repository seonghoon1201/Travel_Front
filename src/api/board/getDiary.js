import axios from 'axios';
import { API_BASE_URL } from '../config';
import { getItem } from '../../utils/localStorage';

export const getDiary = async (page = 0, size = 10) => {
  const accessToken = getItem('accessToken');

  try {
    // 토큰이 있을 때만 Authorization 헤더 추가
    const headers = {};
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    const res = await axios.get(`${API_BASE_URL}/board`, {
      params: { page, size },
      headers,
    });

    // 게시글이 없는 경우
    if (!res.data || (Array.isArray(res.data.content) && res.data.content.length === 0)) {
      return { success: true, data: [], message: '게시글이 없습니다.' };
    }

    return { success: true, data: res.data };
  } catch (error) {
    console.error('여행일기 조회 실패:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data || '여행일기 조회 실패',
    };
  }
};
