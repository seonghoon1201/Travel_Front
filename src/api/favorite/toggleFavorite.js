import authAxios from '../../utils/authAxios';

/**
 * 즐겨찾기 토글
 * @param {string} contentId -
 * @returns {Promise<{ message: string, favorite: boolean }>}
 */
export async function toggleFavorite(contentId) {
  if (!contentId) throw new Error('contentId가 필요합니다.');

  const res = await authAxios.post('/favorites/toggle', { contentId });
  return res?.data;
}
