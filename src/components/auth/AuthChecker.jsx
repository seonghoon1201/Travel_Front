import { useEffect } from 'react';
import useUserStore from '../../store/userStore';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const AuthChecker = () => {
  const { accessToken, logout } = useUserStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (accessToken) {
      try {
        const decoded = jwtDecode(accessToken);
        const exp = decoded.exp * 1000;

        if (Date.now() >= exp) {
          alert('세션이 만료되어 자동 로그아웃 되었습니다.');
          logout();
          navigate('/login');
        }
      } catch (e) {
        console.error('토큰 해석 오류:', e);
        logout();
        navigate('/login');
      }
    }
  }, [accessToken]);

  return null;
};

export default AuthChecker;
