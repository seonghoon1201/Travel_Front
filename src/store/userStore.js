import { create } from 'zustand';
import { getItem, setItem, removeItem } from '../utils/localStorage';

const initialState = {
  accessToken: getItem('accessToken', ''),
  refreshToken: getItem('refreshToken', ''),
  nickname: getItem('nickname', ''),
  profileImageUrl: getItem('profileImageUrl', ''),
  userRole: getItem('userRole', ''),
  userEmail: getItem('userEmail', ''),
  userName: getItem('userName', ''),
  // Boolean 상태로 로그인 여부 저장
  isLoggedIn: !!getItem('accessToken', ''),
};

const useUserStore = create((set) => ({
  ...initialState,

  // 로그인 시 모든 데이터 저장 + 로그인 상태 true
  login: (userData) => {
    set({ ...userData, isLoggedIn: true });
    Object.entries(userData).forEach(([key, value]) => {
      setItem(key, value);
    });
    setItem('isLoggedIn', true);
  },

  // 로그아웃 시 모든 데이터 초기화 + 로그인 상태 false
  logout: () => {
    const cleared = {};
    Object.keys(initialState).forEach((key) => {
      cleared[key] = '';
      removeItem(key);
    });
    cleared.isLoggedIn = false;
    removeItem('isLoggedIn');
    set(cleared);
  },

  // 새로고침 시 저장된 값 복원
  initializeFromStorage: () => {
    const restored = {};
    Object.keys(initialState).forEach((key) => {
      restored[key] = getItem(key, '');
    });
    set({
      ...restored,
      isLoggedIn: !!getItem('accessToken', ''),
    });
  },

  setNickname: (nickname) => {
    set({ nickname });
    setItem('nickname', nickname);
  },

  setProfileImageUrl: (url) => {
    set({ profileImageUrl: url });
    setItem('profileImageUrl', url);
  },
}));

export default useUserStore;
