// src/api/auth/mail.js
import http from '../../utils/authAxios';

// 이메일 중복 확인 (true면 중복)
export async function checkEmail({ email }) {
  const { data } = await http.get('/mail/check-email', { params: { email } });
  return data === true;
}

// 인증코드 전송
export async function sendAuthCode({ email }) {
  const { data } = await http.post('/mail/send', { email });
  return data;
}

// 인증코드 검증
export async function verifyAuthCode({ token }) {
  const { data } = await http.post('/mail/verify', { token });
  return data;
}
