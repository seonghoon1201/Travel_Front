import axios from 'axios';
import { API_BASE_URL } from '../config';

export const getHotRegions = async (limit = 100) => {
  try {
    const res = await axios.get(`${API_BASE_URL}/regions/hot/${limit}`);
    return { success: true, data: res.data?.hotRegions ?? [] };
  } catch (err) {
    console.error('핫플 지역 조회 실패:', err.response?.data || err.message);
    return { success: false, error: err.response?.data || err.message };
  }
};
