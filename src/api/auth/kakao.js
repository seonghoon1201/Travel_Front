// src/api/auth/kakao.js
import http from '../../utils/authAxios';

// 카카오 콜백(코드 교환)
export const kakaoCallback = async (code) => {
  const { data } = await http.post('/auth/kakao/callback', { code });
  return data; // { jwtDto, userNickname, userProfileImage, userRole, userEmail, userName, ... }
};

// 프론트에서 카카오 로그인 시작할 때 쓰는 로그인 URL
export const getKakaoLoginUrl = () => `${http.defaults.baseURL}/auth/kakao/login`;
