// src/api/auth/kakao.js
import http from '../../utils/authAxios';

// 프론트에서 카카오 로그인 시작할 때 이동할 URL
export const getKakaoLoginUrl = () =>
  `${http.defaults.baseURL}/auth/kakao/login`;

// 콜백(code 교환). string 또는 {code} 모두 허용 → 항상 { code }로 보냄
export const kakaoCallback = async (arg) => {
  const code = typeof arg === 'string' ? arg : arg?.code;
  if (!code) throw new Error('kakaoCallback: code가 없습니다.');
  const { data } = await http.post('/auth/kakao/callback', { code });
  return data; // { jwtDto, userNickname, ... }
};
