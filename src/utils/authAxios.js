import axios from 'axios';
import { API_BASE_URL } from '../api/config';
import useUserStore from '../store/userStore';

const BASE_URL = API_BASE_URL || process.env.REACT_APP_API_BASE_URL || '';

const authAxios = axios.create({ baseURL: BASE_URL });

// 공개 엔드포인트(Authorization 붙이면 안 되는 요청) ✅
const PUBLIC_PATHS = [
  '/user/login',
  '/user/register',
  '/user/password',
  '/auth/kakao/callback',
  '/mail/send',
  '/mail/verify',
  '/mail/check-email',
];

const jwtRegex = /^[A-Za-z0-9\-_]+=*\.[A-Za-z0-9\-_]+=*\.[A-Za-z0-9\-_+=/]*$/;

function normalizeBearer(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const stripped = raw.replace(/^Bearer\s+/i, '').trim();
  if (!jwtRegex.test(stripped)) return null;
  return `Bearer ${stripped}`;
}

// ---- request interceptor ----
authAxios.interceptors.request.use((config) => {
  const url = config?.url || '';
  const isPublic =
    config.__skipAuth || PUBLIC_PATHS.some((p) => url.startsWith(p));

  // 공개 요청이면 Authorization 제거
  if (isPublic) {
    if (config.headers?.Authorization) delete config.headers.Authorization;
    return config;
  }

  // 그 외엔 토큰 부착
  const raw = useUserStore.getState().accessToken;
  const bearer = normalizeBearer(raw);

  if (bearer) {
    config.headers = config.headers || {};
    config.headers.Authorization = bearer;
  } else if (config.headers?.Authorization) {
    delete config.headers.Authorization;
  }
  return config;
});

// ---- response interceptor ----
let refreshPromise = null;

authAxios.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    if (!error.response) return Promise.reject(error);
    if (error.response.status !== 401 || originalRequest?._retry) {
      return Promise.reject(error);
    }

    const refreshToken = useUserStore.getState().refreshToken;
    if (!refreshToken) {
      useUserStore.getState().logout?.();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
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

      if (typeof useUserStore.getState().login === 'function') {
        useUserStore.getState().login({ accessToken: newRaw, refreshToken });
      } else {
        useUserStore.setState({ accessToken: newRaw });
      }

      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = newBearer;

      return authAxios(originalRequest);
    } catch (e) {
      refreshPromise = null;
      useUserStore.getState().logout?.();
      return Promise.reject(e);
    }
  }
);

export default authAxios;
