// src/api/cart/cart.js
import http from '../../utils/authAxios';

const CartAPI = {
  async list() {
    const { data } = await http.get('/cart');
    return data;
  },
  async clearAll() {
    await http.delete('/cart/tours');
  },
  async addSimple(contentId) {
    const { data } = await http.post('/cart/tours/simple', null, {
      params: { contentId },
    });
    return data; // { tourId, message }
  },
  async remove(tourId) {
    await http.delete(`/cart/tours/${tourId}`);
  },
};

export default CartAPI;
