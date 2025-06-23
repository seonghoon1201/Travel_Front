import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import Splash from '../pages/Splash';
import LoginPage from '../pages/Login_and_Signup/LoginPage';
import SignUpPage from '../pages/Login_and_Signup/SignUpPage';
import FindPasswordPage from '../pages/Login_and_Signup/FindPasswordPage';
import VerifyCodePage from "../pages/Login_and_Signup/VerifyCodePage";
import ResetPasswordPage from '../pages/Login_and_Signup/ResetPasswordPage';

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
    </Routes>
  </Router>
);

export default AppRoutes;
