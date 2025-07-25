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

  /** 닉네임 변경 (스토어+로컬스토리지) */
  setNickname: (nickname) => {
    set({ nickname });
    setItem('nickname', nickname);
  },

  /** 프로필 이미지 변경 (스토어+로컬스토리지) */
  setProfileImageUrl: (url) => {
    set({ profileImageUrl: url });
    setItem('profileImageUrl', url);
  },

  /** 서버에서 유저 정보 새로 가져와 상태 갱신 */
  fetchUserInfo: async () => {
    const token = getItem('accessToken', '');
    if (!token) return;

    try {
      const response = await fetch('http://localhost:8080/user/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('유저 정보 요청 실패');

      const data = await response.json();

      set({
        nickname: data.userNickname,
        profileImageUrl: data.userProfileImage,
        userEmail: data.email,
        userName: data.userName,
      });

      setItem('nickname', data.userNickname);
      setItem('profileImageUrl', data.userProfileImage);
      setItem('userEmail', data.email);
      setItem('userName', data.userName);
    } catch (err) {
      console.error('fetchUserInfo Error:', err);
    }
  },
}));

export default useUserStore;
