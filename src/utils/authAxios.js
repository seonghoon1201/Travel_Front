// utils/authAxios.js
import axios from 'axios';
import { API_BASE_URL } from '../api/config';
import useUserStore from '../store/userStore';

// 한 곳으로 통일
const BASE_URL = API_BASE_URL || process.env.REACT_APP_API_BASE_URL || '';

const authAxios = axios.create({
  baseURL: BASE_URL,
});

// ---- helpers ----
const jwtRegex = /^[A-Za-z0-9\-_]+=*\.[A-Za-z0-9\-_]+=*\.[A-Za-z0-9\-_+=/]*$/; // 간단 JWT 형태 체크

function normalizeBearer(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const stripped = raw.replace(/^Bearer\s+/i, '').trim();
  // accessToken은 JWT일 확률이 높음: 맞으면 사용, 아니면 null
  if (!jwtRegex.test(stripped)) return null;
  return `Bearer ${stripped}`;
}

// 동시 401 대응: 리프레시 1회만
let refreshPromise = null;

// ---- request interceptor ----
authAxios.interceptors.request.use((config) => {
  const raw = useUserStore.getState().accessToken;
  const bearer = normalizeBearer(raw);

  // 유효할 때만 붙임
  if (bearer) {
    config.headers = config.headers || {};
    config.headers.Authorization = bearer;
  } else if (config.headers?.Authorization) {
    delete config.headers.Authorization;
  }

  return config;
});

// ---- response interceptor ----
authAxios.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    // 네트워크/타임아웃 등은 그대로
    if (!error.response) return Promise.reject(error);

    // 이미 재시도했거나 401이 아니면 그대로
    if (error.response.status !== 401 || originalRequest?._retry) {
      return Promise.reject(error);
    }

    // 리프레시 토큰 확인(형태는 서비스마다 다르므로 간단히 존재만 확인)
    const refreshToken = useUserStore.getState().refreshToken;
    if (!refreshToken) {
      useUserStore.getState().logout?.();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      // 동시에 여러 401이 왔을 때 리프레시 1회만 수행
      if (!refreshPromise) {
        refreshPromise = axios.post(`${BASE_URL}/user/refresh`, {
          refreshToken,
        });
      }
      const { data } = await refreshPromise;
      refreshPromise = null;

      const newRaw = data?.accessToken;
      const newBearer = normalizeBearer(newRaw);
      if (!newBearer)
        throw new Error('리프레시 응답에 accessToken 없음/형식 오류');

      // 스토어는 필요한 필드만 업데이트 (전체 state 스프레드 금지)
      if (typeof useUserStore.getState().login === 'function') {
        useUserStore.getState().login({
          accessToken: newRaw,
          refreshToken, // 기존 유지(혹시 응답에 새 RT가 오면 그걸 사용)
        });
      } else {
        // fallback
        useUserStore.setState({ accessToken: newRaw });
      }

      // 재시도 요청에 새 토큰 주입
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = newBearer;

      return authAxios(originalRequest);
    } catch (refreshErr) {
      refreshPromise = null;
      console.error('리프레시 실패/만료', refreshErr);
      useUserStore.getState().logout?.();
      // 서비스 정책에 맞게 로그인으로 이동
      window.location.replace(`${BASE_URL}/auth/kakao/login`);
      return Promise.reject(refreshErr);
    }
  }
);

export default authAxios;
