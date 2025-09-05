import axios from 'axios';
import { API_BASE_URL } from '../config';

/**
 * 투어 상세 정보 조회
 * @param {string} contentId - 투어 컨텐츠 ID
 * @returns {Promise} API 응답
 */
export const getTourDetail = async (contentId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/tour/detail/${contentId}`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('getTourDetail 에러:', error);
    return {
      success: false,
      error: error.response?.data?.message || '투어 상세 정보를 불러오는데 실패했습니다.',
      data: null
    };
  }
};