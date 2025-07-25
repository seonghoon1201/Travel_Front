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
};

const useUserStore = create((set) => ({
  ...initialState,

  login: (userData) => {
    set(userData);
    Object.entries(userData).forEach(([key, value]) => {
      setItem(key, value);
    });
  },

  logout: () => {
    const cleared = {};
    Object.keys(initialState).forEach((key) => {
      cleared[key] = '';
      removeItem(key);
    });
    set(cleared);
  },

  initializeFromStorage: () => {
    const restored = {};
    Object.keys(initialState).forEach((key) => {
      restored[key] = getItem(key, '');
    });
    set(restored);
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
