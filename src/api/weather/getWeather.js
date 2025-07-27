import axios from 'axios';
import { API_BASE_URL } from '../config';
import { getItem } from '../../utils/localStorage';

/** 도시 이름으로 현재 날씨 조회
 * @param {string} city 도시명
 */
export const getWeather = async (city) => {
  const accessToken = getItem('accessToken');

  try {
    const res = await axios.get(`${API_BASE_URL}/weather/current`, {
      params: { city },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return { success: true, data: res.data };
  } catch (error) {
    console.error('날씨 조회 실패:', error.response?.data || error.message);
    return { success: false, error: error.response?.data || '날씨 조회 실패' };
  }
};
