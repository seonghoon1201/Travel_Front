// src/api/board/diary.js
import http from '../../utils/authAxios';

export const getDiary = async (page = 0, size = 20) => {
  const { data } = await http.get('/board', { params: { page, size } });
  return { success: true, data };
};

export const getDiaryDetail = async (boardId) => {
  try {
    const { data } = await http.get(`/board/${boardId}`);
    return { success: true, data };
  } catch (error) {
    console.error('여행일기 상세 조회 실패:', error.response?.data || error.message);
    return { success: false, error: error.response?.data || '조회 실패' };
  }
};

export const writeDiary = async (payload) => {
  const { data } = await http.post('/board', payload);
  return { success: true, data };
};

export const updateDiary = async (boardId, payload) => {
  const { data } = await http.put(`/board/${boardId}`, payload);
  return { success: true, data };
};



export default {
  getDiary,
  getDiaryDetail,
  writeDiary,
  updateDiary,
};
