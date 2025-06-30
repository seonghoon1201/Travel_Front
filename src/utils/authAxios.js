import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import useUserStore from '../store/userStore';

const authAxios = axios.create({
  baseURL: 'http://localhost:8080',
});

authAxios.interceptors.request.use((config) => {
  const token = useUserStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 자동 토큰 갱신 인터셉터
authAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // accessToken이 만료됐고, 재시도한 요청이 아니라면
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      useUserStore.getState().refreshToken
    ) {
      originalRequest._retry = true;

      try {
        const res = await axios.post('http://localhost:8080/user/refresh', {
          refreshToken: useUserStore.getState().refreshToken,
        });

        const { accessToken: newAccessToken } = res.data;

        // 상태 및 로컬스토리지 갱신
        useUserStore.getState().login({
          ...useUserStore.getState(),
          accessToken: newAccessToken,
        });

        // Authorization 헤더 다시 설정하고 재시도
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return authAxios(originalRequest);
      } catch (refreshError) {
        console.error('리프레시 토큰 만료', refreshError);
        useUserStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default authAxios;
