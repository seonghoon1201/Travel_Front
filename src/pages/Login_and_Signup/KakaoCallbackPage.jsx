import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useUserStore from '../../store/userStore';
import { setItem } from '../../utils/localStorage';

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
        const res = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/auth/kakao/callback`,
          { code }
        );

        console.log('카카오 로그인 응답:', res.data);

        const jwtDto = res.data?.jwtDto;
        if (!jwtDto) {
          throw new Error('jwtDto가 응답에 없습니다.');
        }

        const { accessToken, refreshToken } = jwtDto;
        const nickname = res.data?.userNickname || '';
        const profileImageUrl = res.data?.userProfileImage || '';
        const userRole = res.data?.userRole || '';
        const userEmail = res.data?.userEmail || '';
        const userName = res.data?.userName || '';

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

        setItem('accessToken', accessToken);
        setItem('refreshToken', refreshToken);
        setItem('nickname', nickname);
        setItem('profileImageUrl', profileImageUrl);

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
