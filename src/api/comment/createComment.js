import axios from 'axios';
import { API_BASE_URL } from '../config';
import { getItem } from '../../utils/localStorage';

export async function createComment({ boardId, content }) {
  if (!boardId) throw new Error('boardId 없음');
  const text = (content ?? '').trim();
  if (!text) throw new Error('댓글 내용을 입력해주세요.');

  const accessToken = getItem('accessToken', '');
  try {
    const res = await axios.post(
      `${API_BASE_URL}/comment/${boardId}`,
      { content: text },
      {
        headers: {
          Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
          'Content-Type': 'application/json',
        },
        withCredentials: false,
      }
    );

    return { success: true, data: res.data, status: res.status };
  } catch (error) {
    console.error('[createComment] 실패:', error?.response?.data || error.message);
    return {
      success: false,
      error: error?.response?.data || { code: 'REQUEST_FAILED', message: '댓글 작성 실패' },
      status: error?.response?.status,
    };
  }
}
