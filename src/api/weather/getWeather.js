import axios from 'axios';
import { API_BASE_URL } from '../config';
import { getItem } from '../../utils/localStorage';

export const getWeather = async (city) => {
  const accessToken = getItem('accessToken');

  if (!city || typeof city !== 'string') {
    console.warn('getWeather 호출: 유효하지 않은 city 값', city);
    return { success: false, error: '도시명이 유효하지 않습니다.' };
  }

  // 도시명 정규화 - 여러 패턴 시도
  const cityVariants = [
    city.trim(), // 원본
    city.trim().replace(/시$/, ''), 
    city.trim().replace(/(시|군|구)$/, ''), 
  ];

  const uniqueCityVariants = [...new Set(cityVariants)];


  for (const cityVariant of uniqueCityVariants) {
    try {
      
      const res = await axios.get(`${API_BASE_URL}/weather/current`, {
        params: { city: cityVariant },
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        timeout: 10000, 
      });

      return { success: true, data: res.data };
      
    } catch (error) {
      
      // 500 에러가 아닌 경우 (404, 400 등)
      if (error.response?.status !== 500) {
        continue;
      }
      
      // 500 에러인 경우 서
      console.error('서버 내부 오류 (500) - API 호출 중단');
      break;
    }
  }

  // 모든 시도 실패
  return { 
    success: false, 
    error: {
      code: 'WEATHER_API_FAILED',
      message: '날씨 정보를 가져올 수 없습니다. 잠시 후 다시 시도해주세요.',
      originalCity: city
    }
  };
};