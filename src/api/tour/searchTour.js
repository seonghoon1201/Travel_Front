import axios from 'axios';
import { API_BASE_URL } from '../config';
import { getItem } from '../../utils/localStorage';

/**
 * 투어 정보 검색
 * @param {Object} params
 * @param {string} params.keyword 검색 키워드
 * @param {string} params.region 지역명
 * @param {string} params.category 카테고리 (예: 관광지)
 * @param {number} params.page 페이지 번호
 * @param {number} params.size 페이지 크기
 */
export const searchTours = async ({
  keyword = '',
  region = '',
  category = '',
  page = 0,
  size = 10,
}) => {
  const accessToken = getItem('accessToken');

  try {
    const res = await axios.get(`${API_BASE_URL}/tour/search`, {
      params: {
        keyword,
        region,
        category,
        page,
        size,
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return { success: true, data: res.data };
  } catch (error) {
    console.error('투어 검색 실패:', error.response?.data || error.message);
    return { success: false, error: error.response?.data || '투어 검색 실패' };
  }
};
