import axios from 'axios';
import { API_BASE_URL } from '../config';
import { getItem } from '../../utils/localStorage';

export const writeDiary = async ({ title, content, tag, imageUrl }) => {
  const accessToken = getItem('accessToken');
  try {
    const response = await axios.post(
      `${API_BASE_URL}/board`,
      { title, content, tag, imageUrl },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return { success: true, data: response.data };
  } catch (error) {
    console.error('여행일기 작성 실패:', error.response?.data || error.message);
    return { success: false, error: error.response?.data || '작성 실패' };
  }
};
