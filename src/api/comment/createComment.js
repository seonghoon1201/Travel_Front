import axios from 'axios';
import { API_BASE_URL } from '../config';

const client = axios.create({ baseURL: API_BASE_URL, withCredentials: true });

export async function createComment({ boardId, content, accessToken }) {
  if (!boardId) throw new Error('boardId 없음');
  const text = (content ?? '').trim();
  if (!text) throw new Error('댓글 내용을 입력해주세요.');

  const headers = { 'Content-Type': 'application/json' };
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  try {
    const res = await client.post(`/comment/${boardId}`, { content: text }, { headers });
    return { success: true, data: res.data, status: res.status };
  } catch (error) {
    const status = error?.response?.status;
    const data = error?.response?.data;
    console.error('[createComment] 에러 응답:', status, data);
    throw new Error(data?.message || data?.error || `요청 실패(${status})`);
  }
}
