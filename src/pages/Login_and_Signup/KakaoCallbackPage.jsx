import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { kakaoCallback } from '../../api';
import useUserStore from '../../store/userStore';

const KakaoCallbackPage = () => {
  const navigate = useNavigate();
  const login = useUserStore((state) => state.login);

  // 플래그 ref로 호출 1회 제한
  const isCalled = useRef(false);

  useEffect(() => {
    const fetchKakaoLogin = async () => {
      if (isCalled.current) return;
      isCalled.current = true;

      const url = new URL(window.location.href);
      const code = url.searchParams.get('code');

      if (!code) {
        alert('카카오 인증 코드가 없습니다.');
        navigate('/login');
        return;
      }

      try {
        const data = await kakaoCallback({code});
        const jwtDto = data?.jwtDto;
        if (!jwtDto) {
          throw new Error('jwtDto가 응답에 없습니다.');
        }

        const { accessToken, refreshToken } = jwtDto;
        const nickname = data?.userNickname || '';
        const profileImageUrl = data?.userProfileImage || '';
        const userRole = data?.userRole || '';
        const userEmail = data?.userEmail || '';
        const userName = data?.userName || '';

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

        navigate('/');
      } catch (error) {
        console.error('카카오 로그인 실패:', error);
        alert(
          '카카오 로그인에 실패했습니다. 인가코드가 만료되었거나 서버 오류입니다.'
        );
        navigate('/login');
      }
    };

    fetchKakaoLogin();
  }, [navigate, login]);

  return (
    <div className="flex justify-center items-center h-screen">
      <p className="text-gray-600">카카오 로그인 처리 중입니다...</p>
    </div>
  );
};

export default KakaoCallbackPage;
