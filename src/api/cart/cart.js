import http from '../../utils/authAxios';

export async function createCart({ ldongRegnCd, ldongSignguCd }) {
  const lDongRegnCd = String(ldongRegnCd ?? '').trim();
  const lDongSignguCd = String(ldongSignguCd ?? '').trim();

  if (!lDongRegnCd || !lDongSignguCd) {
    const err = new Error(
      '지역 코드가 비었습니다 (lDongRegnCd / lDongSignguCd)'
    );
    err.code = 'INVALID_REGION_CODES';
    throw err;
  }

  const { data } = await http.post('/carts', null, {
    params: { lDongRegnCd, lDongSignguCd }, // ← swagger 그대로 (소문자 l)
  });
  return data; // { cartId, tours, ... }
}

// 특정 cartId 조회
async function getCart(cartId) {
  const { data } = await http.get(`/carts/${cartId}`);
  return data; // { cartId, tours: [...], ... }
}

// 카트 자체 삭제(카트와 모든 투어 삭제)
async function deleteCart(cartId) {
  await http.delete(`/carts/${cartId}`);
}

// 지정 카트에 투어 추가(contentId만)
async function addTourByContentId(cartId, contentId) {
  const { data } = await http.post(`/carts/${cartId}/tours/simple`, null, {
    params: { contentId: String(contentId) },
  });
  return data; // { tourId, message? }
}

// 특정 투어 삭제 (swagger: DELETE /carts/{cartId}/tours/{tourId})
async function removeTour(cartId, tourId) {
  await http.delete(`/carts/${cartId}/tours/${tourId}`);
}

// contentId로 찾아서 제거 (리스트에서 tourId 매칭 후 삭제)
async function removeByContentId(cartId, contentId) {
  const cart = await getCart(cartId);
  const tours = Array.isArray(cart?.tours) ? cart.tours : [];
  const target = tours.find((t) => String(t.contentId) === String(contentId));
  if (!target?.tourId) {
    const err = new Error('해당 contentId의 투어를 찾을 수 없습니다.');
    err.code = 'CART_ITEM_NOT_FOUND';
    throw err;
  }
  await removeTour(cartId, String(target.tourId));
}

const CartAPI = {
  createCart,
  getCart,
  deleteCart,
  addTourByContentId,
  removeTour,
  removeByContentId,
};

export default CartAPI;
