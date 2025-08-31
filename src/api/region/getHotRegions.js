import axios from 'axios';
import { API_BASE_URL } from '../config';

export const getHotRegions = async (limit = 10) => {
  try {
    const res = await axios.get(`${API_BASE_URL}/regions/hot/${limit}`);
    return { success: true, data: res.data.hotRegions };
  } catch (error) {
    console.error('핫플 조회 실패:', error.response?.data || error.message);
    return { success: false, error: error.response?.data };
  }
};
