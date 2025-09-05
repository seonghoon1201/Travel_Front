// src/api/favorite/getFavorites.js
import authAxios from '../../utils/authAxios';

/**
 * GET /favorites
 */
export async function getFavorites({ page = 0, size = 20 } = {}) {
  const res = await authAxios.get('/favorites', {
    params: { page, size },
  });
  return res?.data ?? { favorites: [], totalCount: 0 };
}
