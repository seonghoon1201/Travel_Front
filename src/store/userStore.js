import { create } from 'zustand';
import { getItem, setItem, removeItem, clearAll } from '../utils/localStorage';

const useUserStore = create((set) => ({
  accessToken: getItem('accessToken'),
  refreshToken: getItem('refreshToken'),
  nickname: getItem('nickname'),
  profileImageUrl: getItem('profileImageUrl'),

  isLoggedIn: !!getItem('accessToken'),

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
