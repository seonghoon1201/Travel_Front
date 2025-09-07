// src/api/auth/user.js
import http from '../../utils/authAxios';

export async function registerUser(payload) {
  const { data } = await http.post('/user/register', payload);
  return data;
}

export async function loginUser({ email, password }) {
  // 스웨거: POST /user/login
  const { data } = await http.post('/user/login', { email, password });
  return data;
}

export async function resetPassword({ email, password }) {
  const { data } = await http.patch('/user/password', { email, password });
  return data;
}
