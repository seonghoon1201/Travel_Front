// src/store/userStore.js
import { create } from 'zustand';
import { getItem, setItem, removeItem } from '../utils/localStorage';
import usePlanStore from './planStore';
import useCartStore from './cartStore';

// 토큰 정규화: "Bearer " 접두어 제거 + 트림
const stripBearer = (raw) => {
  if (!raw) return '';
  const s = String(raw).trim();
  return s.replace(/^Bearer\s+/i, '').trim();
};

const trackedKeys = [
  'accessToken',
  'refreshToken',
  'nickname',
  'profileImageUrl',
  'userRole',
  'userEmail',
  'userName',
];

const initialState = {
  accessToken: stripBearer(getItem('accessToken', '')),
  refreshToken: getItem('refreshToken', ''),
  nickname: getItem('nickname', ''),
  profileImageUrl: getItem('profileImageUrl', ''),
  userRole: getItem('userRole', ''),
  userEmail: getItem('userEmail', ''),
  userName: getItem('userName', ''),
  // 로그인 여부는 accessToken 존재로 판정
  isLoggedIn: !!stripBearer(getItem('accessToken', '')),
};

const useUserStore = create((set, get) => ({
  ...initialState,

  // 안전한 로그인 업데이트: 명시 키만 저장
  login: (userData = {}) => {
    const next = {
      accessToken: stripBearer(
        userData.accessToken ?? getItem('accessToken', '')
      ),
      refreshToken: userData.refreshToken ?? getItem('refreshToken', ''),
      nickname: userData.nickname ?? getItem('nickname', ''),
      profileImageUrl:
        userData.profileImageUrl ?? getItem('profileImageUrl', ''),
      userRole: userData.userRole ?? getItem('userRole', ''),
      userEmail: userData.userEmail ?? getItem('userEmail', ''),
      userName: userData.userName ?? getItem('userName', ''),
    };
    set((state) => ({
      ...state,
      ...next,
      isLoggedIn: !!next.accessToken,
    }));
    // persist 선택 저장
    trackedKeys.forEach((k) => setItem(k, next[k] ?? ''));
  },

  // 토큰만 바꿀 상황(리프레시)에 편한 헬퍼
  setTokens: ({ accessToken, refreshToken }) => {
    const at = stripBearer(accessToken);
    const rt = refreshToken ?? getItem('refreshToken', '');
    set((state) => ({
      ...state,
      accessToken: at,
      refreshToken: rt,
      isLoggedIn: !!at,
    }));
    setItem('accessToken', at);
    setItem('refreshToken', rt);
  },

  // ✅ 로그아웃: 사용자 상태 + 플랜/카트 모두 정리
  logout: () => {
    set((state) => ({
      ...state,
      accessToken: '',
      refreshToken: '',
      nickname: '',
      profileImageUrl: '',
      userRole: '',
      userEmail: '',
      userName: '',
      isLoggedIn: false,
    }));
    trackedKeys.forEach((k) => removeItem(k));

    try {
      // 플랜/카트 세션 저장소까지 삭제
      usePlanStore.getState().clearPersisted();
      useCartStore.getState().clearPersisted();
    } catch (e) {
      // noop
    }
  },

  // (선택) 새로고침 복원 — 사실 초기화에서 이미 복원되므로 없어도 OK
  initializeFromStorage: () => {
    const restored = {};
    trackedKeys.forEach((k) => (restored[k] = getItem(k, '')));
    restored.accessToken = stripBearer(restored.accessToken);
    set((state) => ({
      ...state,
      ...restored,
      isLoggedIn: !!restored.accessToken,
    }));
  },

  // 토큰 준비 여부를 컴포넌트에서 쉽게 확인
  hasValidAccessToken: () => !!stripBearer(getItem('accessToken', '')),
}));

export default useUserStore;
