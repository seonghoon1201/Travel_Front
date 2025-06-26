import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import Splash from '../pages/Splash';
import LoginPage from '../pages/Login_and_Signup/LoginPage';
import SignUpPage from '../pages/Login_and_Signup/SignUpPage';
import KakaoCallbackPage from '../pages/Login_and_Signup/KakaoCallbackPage';
import FindPasswordPage from '../pages/Login_and_Signup/FindPasswordPage';
import VerifyCodePage from '../pages/Login_and_Signup/VerifyCodePage';
import ResetPasswordPage from '../pages/Login_and_Signup/ResetPasswordPage';
import MyPage from '../pages/MyPage';
import EditProfile from '../pages/EditProfile';
import HotBoard from '../pages/HotBoard';
import PlanLocationPage from '../pages/Plan/PlanLocationPage';
import PlanDatePage from '../pages/Plan/PlanDatePage';
import PlanStylePage from '../pages/Plan/PlanStylePage';
import PlanInvitePage from '../pages/Plan/PlanInvitePage';

const AppRoutes = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Splash />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/find-password" element={<FindPasswordPage />} />
      <Route path="/find-password/verify" element={<VerifyCodePage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/mypage" element={<MyPage />} />
      <Route path="/edit/profile" element={<EditProfile />} />
      <Route path="/board/hot" element={<HotBoard />} />
      <Route path="/plan/location" element={<PlanLocationPage />} />
      <Route path="/kakao/callback" element={<KakaoCallbackPage />} />
      <Route path="/plan/date" element={<PlanDatePage />} />
      <Route path="/plan/style" element={<PlanStylePage />} />
      <Route path="/plan/invite" element={<PlanInvitePage />} />
    </Routes>
  </Router>
);

export default AppRoutes;
