import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { kakaoCallback } from '../../api';
import useUserStore from '../../store/userStore';

// ✅ state에서 redirect를 복원하는 유틸
function parseRedirectFromState(state) {
  if (!state) return null;
  try {
    const decoded = decodeURIComponent(state);

    // 1) JSON 형태: {"redirect":"/invite?scheduleId=..."}
    if (decoded.startsWith('{')) {
      const obj = JSON.parse(decoded);
      return obj.redirect || null;
    }

    // 2) 쿼리스트링 형태: "redirect=/invite?scheduleId=..."
    if (decoded.includes('redirect=')) {
      const sp = new URLSearchParams(decoded);
      return sp.get('redirect');
    }

    // 3) 경로만 온 경우: "/invite?scheduleId=..."
    if (decoded.startsWith('/')) return decoded;

    return null;
  } catch {
    return null;
  }
}

const KakaoCallbackPage = () => {
  const navigate = useNavigate();
  const login = useUserStore((state) => state.login);
  const [msg, contextHolder] = message.useMessage();

  // 플래그 ref로 호출 1회 제한
  const isCalled = useRef(false);

  useEffect(() => {
    const fetchKakaoLogin = async () => {
      if (isCalled.current) return;
      isCalled.current = true;

      const url = new URL(window.location.href);
      const code = url.searchParams.get('code');
      const redirectQuery = url.searchParams.get('redirect'); // ✅ 쿼리로 전달된 redirect
      const stateParam = url.searchParams.get('state'); // ✅ OAuth 표준 state
      const stateRedirect = parseRedirectFromState(stateParam);

      if (!code) {
        msg.error('카카오 인증 코드가 없습니다.');
        navigate('/login');
        return;
      }

      const hide = msg.loading('카카오 로그인 처리 중...', 0);
      try {
        const data = await kakaoCallback({ code });
        const jwtDto = data?.jwtDto;
        if (!jwtDto) throw new Error('jwtDto가 응답에 없습니다.');

        const { accessToken, refreshToken } = jwtDto;
        const nickname = data?.userNickname || '';
        const profileImageUrl = data?.userProfileImage || '';
        const userRole = data?.userRole || '';
        const userEmail = data?.userEmail || '';
        const userName = data?.userName || '';

        // 스토어 세팅
        login({
          accessToken,
          refreshToken,
          nickname,
          profileImageUrl,
          userRole,
          userEmail,
          userName,
          isLoggedIn: true,
        });

        // ✅ 이동 대상 계산
        let next = redirectQuery || stateRedirect || '/';
        try {
          const raw = localStorage.getItem('pendingScheduleInvite');
          const saved = raw ? JSON.parse(raw) : null;
          if (!redirectQuery && !stateRedirect) {
            if (saved?.redirect) next = saved.redirect;
            else if (saved?.scheduleId)
              next = `/invite?scheduleId=${saved.scheduleId}`;
          }
          // 사용한 pending은 정리
          localStorage.removeItem('pendingScheduleInvite');
        } catch {
          // noop
        }

        hide();
        msg.success('카카오 로그인에 성공했습니다.');
        navigate(next, { replace: true });
      } catch (error) {
        hide();
        msg.error(
          '카카오 로그인에 실패했습니다. 인가코드가 만료되었거나 서버 오류입니다.'
        );
        navigate('/login');
      }
    };

    fetchKakaoLogin();
  }, [navigate, login, msg]);

  return (
    <div className="flex justify-center items-center h-screen">
      {contextHolder}
      <p className="text-gray-600">카카오 로그인 처리 중입니다...</p>
    </div>
  );
};

export default KakaoCallbackPage;
