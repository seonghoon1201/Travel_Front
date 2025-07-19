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
        // ✅ 백엔드로 POST 요청 (JSON 형식)
        const res = await axios.post('http://localhost:8080/auth/kakao/callback', {
          code,
        });
        const {
          jwtDto: { accessToken, refreshToken },
          userNickname: nickname,
          userProfileImage: profileImageUrl,
          userRole,
          userEmail,
          userName,
        } = res.data;

        // ✅ 상태 저장 (Zustand)
        // ✅ 상태 저장 (Zustand)
        login({
          accessToken,
          refreshToken,
          nickname,
          profileImageUrl,
          userRole,
          userEmail,
          userName,
          isLoggedIn: true, // ✅ 로그인 상태 표시
        });


        // ✅ 로컬스토리지 저장
        setItem('accessToken', accessToken);
        setItem('refreshToken', refreshToken);
        setItem('nickname', nickname);
        setItem('profileImageUrl', profileImageUrl);

        // ✅ 홈으로 이동
        navigate('/');
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
