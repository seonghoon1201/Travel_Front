import axios from 'axios';
import { API_BASE_URL } from '../config';

export const uploadProfileImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await axios.post(`${API_BASE_URL}/file/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return {
      success: true,
      imageUrl: response.data.imageUrl,
    };
  } catch (error) {
    console.error('파일 업로드 실패:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data || '파일 업로드 실패',
    };
  }
};
