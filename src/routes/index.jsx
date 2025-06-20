import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import Splash from '../pages/Splash';
import LoginPage from '../pages/LoginPage';

const AppRoutes = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Splash />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  </Router>
);

export default AppRoutes;
