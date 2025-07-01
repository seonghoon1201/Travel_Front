import { create } from 'zustand';
import { getItem, setItem, removeItem, clearAll } from '../utils/localStorage';

const useUserStore = create((set) => ({
  accessToken: null,
  refreshToken: null,
  nickname: null,
  profileImageUrl: null,
  isLoggedIn: false,

  login: ({ accessToken, refreshToken, nickname, profileImageUrl }) => {
    setItem('accessToken', accessToken);
    setItem('refreshToken', refreshToken);
    setItem('nickname', nickname);
    setItem('profileImageUrl', profileImageUrl);

    set({
      accessToken,
      refreshToken,
      nickname,
      profileImageUrl,
      isLoggedIn: true,
    });
  },

  initializeFromStorage: () => {
    const accessToken = getItem('accessToken');
    const refreshToken = getItem('refreshToken');
    const nickname = getItem('nickname');
    const profileImageUrl = getItem('profileImageUrl');

    if (accessToken) {
      set({
        accessToken,
        refreshToken,
        nickname,
        profileImageUrl,
        isLoggedIn: true,
      });
    }
  },

  logout: () => {
    clearAll();
    set({
      accessToken: null,
      refreshToken: null,
      nickname: null,
      profileImageUrl: null,
      isLoggedIn: false,
    });
  },
}));

export default useUserStore;