// src/api/auth/kakao.js
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import http from '../../utils/authAxios';

// ✅ 백엔드의 /auth/kakao/login 으로 302 리다이렉트를 받으러 간다.
//    (우리 앱은 그 URL 자체로 이동/열기만 하면 됨)
export const getKakaoLoginUrl = () =>
  `${http.defaults.baseURL}/auth/kakao/login`;

// ✅ state를 JSON → URIComponent 로 안전하게 얹어 전달
export const getKakaoLoginUrlWithState = (stateObj) => {
  const base = getKakaoLoginUrl();
  const url = new URL(base);
  const state = encodeURIComponent(
    JSON.stringify(stateObj || { redirect: '/' })
  );
  url.searchParams.set('state', state);
  return url.toString();
};

// ✅ 네이티브/웹 공통: 로그인 플로우 시작(선택 사용)
//    - 네이티브: Custom Tab로 열기 (콜백은 App Links로 앱 복귀)
//    - 웹: location 이동
export async function startKakaoLogin(stateObj) {
  const loginUrl = getKakaoLoginUrlWithState(stateObj);
  if (Capacitor.isNativePlatform()) {
    await Browser.open({ url: loginUrl, presentationStyle: 'fullscreen' });
  } else {
    window.location.href = loginUrl;
  }
}

// ✅ 콜백 처리 (code/state/redirect 모두 지원)
//    - 백엔드가 access/refresh/token & 유저정보를 반환한다고 가정
export async function kakaoCallback({ code, state, redirect }) {
  if (!code) throw new Error('인가 코드(code)가 없습니다.');
  const payload = { code };
  if (state !== undefined) payload.state = state;
  if (redirect !== undefined) payload.redirect = redirect;

  // 백엔드 엔드포인트는 실제 서버와 맞춰주세요.
  // 예: POST /auth/kakao/callback  → { jwtDto, userNickname, ... }
  const { data } = await http.post('/auth/kakao/callback', payload);
  return data;
}
