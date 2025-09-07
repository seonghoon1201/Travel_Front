import http from '../../utils/authAxios';

// 회원가입
export async function registerUser(payload) {
  const { data } = await http.post('/user/register', payload, {
    __skipAuth: true,
  });
  return data;
}

// 이메일/비밀번호 로그인  ✅ /user/login 로 수정 + 토큰 미부착
export async function loginUser({ email, password }) {
  const { data } = await http.post(
    '/user/login',
    { email, password },
    { __skipAuth: true } // 이 요청은 Authorization 헤더 붙이지 않음
  );
  return data;
}

// 카카오 로그인 URL (프론트에서 리다이렉트용)
export function getKakaoLoginUrl() {
  return `${process.env.REACT_APP_API_BASE_URL}/auth/kakao/login`;
}

// 카카오 콜백 (인가코드 → jwt)
export async function kakaoCallback({ code }) {
  const { data } = await http.post(
    '/auth/kakao/callback',
    { code },
    { __skipAuth: true }
  );
  return data;
}

// 비밀번호 재설정
export async function resetPassword({ email, password }) {
  const { data } = await http.patch(
    '/user/password',
    { email, password },
    { __skipAuth: true }
  );
  return data;
}
