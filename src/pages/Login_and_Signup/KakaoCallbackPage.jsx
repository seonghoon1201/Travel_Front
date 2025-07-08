import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useUserStore from '../../store/userStore';
import { setItem } from '../../utils/localStorage';

const KakaoCallbackPage = () => {
  const navigate = useNavigate();
  const login = useUserStore((state) => state.login);

  useEffect(() => {
    const fetchKakaoLogin = async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get('code');

      if (!code) {
        alert('카카오 인증 코드가 없습니다.');
        navigate('/login');
        return;
      }

      try {
        const res = await axios.get('http://124.49.210.216/auth/kakao/callback', {
          params: { code },
        });

        const {
          jwtDto: { accessToken, refreshToken },
          userNickname: nickname,
          userProfileImage: profileImageUrl,
          userRole,
          userEmail,
          userName,
        } = res.data;

        // ✅ Zustand store 저장
        login({
          accessToken,
          refreshToken,
          nickname,
          profileImageUrl,
          userRole,
          userEmail,
          userName,
        });

        // ✅ localStorage 저장 (원한다면 최소한으로)
        setItem('accessToken', accessToken);
        setItem('nickname', nickname);

        navigate('/home');
      } catch (error) {
        console.error('카카오 로그인 실패:', error);
        alert('카카오 로그인에 실패했습니다. 인가코드가 만료되었거나 서버 오류입니다.');
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
