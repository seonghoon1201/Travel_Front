import authAxios from '../../utils/authAxios';

export async function getFavorites({ page = 0, size = 20 } = {}) {
  const res = await authAxios.get('/favorites', {
    params: { page, size },
  });
  return res?.data ?? { favorites: [], totalCount: 0 };
}
