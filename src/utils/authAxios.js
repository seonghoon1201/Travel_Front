import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { API_BASE_URL } from '../api/config';
import useUserStore from '../store/userStore';

const authAxios = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
});

authAxios.interceptors.request.use((config) => {
  const token = useUserStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 자동으로 토큰 갱신해주는 인터셉터
authAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      useUserStore.getState().refreshToken
    ) {
      originalRequest._retry = true;

      try {
        const res = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/user/refresh`,
          {
            refreshToken: useUserStore.getState().refreshToken,
          }
        );

        const { accessToken: newAccessToken } = res.data;

        useUserStore.getState().login({
          ...useUserStore.getState(),
          accessToken: newAccessToken,
        });

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return authAxios(originalRequest);
      } catch (refreshError) {
        console.error('리프레시 토큰 만료', refreshError);
        useUserStore.getState().logout();
        window.location.href = `${API_BASE_URL}/auth/kakao/login`;

        // window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default authAxios;
