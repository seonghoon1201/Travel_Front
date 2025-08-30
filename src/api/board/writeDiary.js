import axios from 'axios';
import { API_BASE_URL } from '../config';
import { getItem } from '../../utils/localStorage';

export const writeDiary = async ({ title, content, tag, imageUrls }) => {
  const accessToken = getItem('accessToken');
  try {
    const response = await axios.post(
      `${API_BASE_URL}/board`,
      { title, content, tag, imageUrls },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = response?.data;
    // 모든 가능성 .. 
    const boardId =
      (typeof data === 'string' && data) ||
      data?.boardId ||                    
      data?.data?.boardId ||               
      data?.id ||                           
      data?.board?.id;                     

  

    return { success: !!boardId, boardId, data };
  } catch (error) {
    console.error('여행일기 작성 실패:', error.response?.data || error.message);
    return { success: false, error: error.response?.data || '작성 실패' };
  }
};
