import axios from 'axios';
import { API_BASE_URL } from '../config';
import { getItem } from '../../utils/localStorage';

/**
 * 여행일기 작성
 * @param {Object} params
 * @param {string} params.title
 * @param {string} params.content
 * @param {string} params.tag      
 * @param {string[]} params.imageUrls
 * @param {string} params.scheduleId - UUID
 */
export const writeDiary = async ({ title, content, tag, imageUrls, scheduleId }) => {
  const accessToken = getItem('accessToken');

  const payload = {
    title,
    content,
    tag: tag && tag.trim().length > 0 ? tag : '일반', 
    imageUrls: Array.isArray(imageUrls) ? imageUrls : [],
    scheduleId,
  };

  try {
    const response = await axios.post(
      `${API_BASE_URL}/board`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return { success: true, ...response.data };

  } catch (error) {
    return {
      success: false,
      error: error.response?.data || '여행일기 작성 실패',
    };
  }
};
