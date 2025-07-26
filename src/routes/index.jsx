import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import SearchPage from '../pages/SearchPage';
import Splash from '../pages/Splash';
import LoginPage from '../pages/Login_and_Signup/LoginPage';
import SignUpPage from '../pages/Login_and_Signup/SignUpPage';
import KakaoCallbackPage from '../pages/Login_and_Signup/KakaoCallbackPage';
import FindPasswordPage from '../pages/Login_and_Signup/FindPasswordPage';
import VerifyCodePage from '../pages/Login_and_Signup/VerifyCodePage';
import ResetPasswordPage from '../pages/Login_and_Signup/ResetPasswordPage';
import MyPage from '../pages/MyPage';
import EditProfile from '../pages/EditProfilePage';
import AuthChecker from '../components/auth/AuthChecker';

import HotBoardPage from '../pages/Board/HotBoardPage';
import RegionDetailPage from '../pages/Board/RegionDetailPage';
import BudgetBoardPage from '../pages/Board/BudgetBoardPage';
import PlaceDetail from '../pages/Board/PlaceDetail';

import TravelDiaryBoardPage from '../pages/Travel_Diary/TravelDiaryBoardPage';
import TravelDiaryDetailPage from '../pages/Travel_Diary/TravelDiaryDetailPage';
import WriteTravelDiaryPage from '../pages/Travel_Diary/WriteTravelDiaryPage';
import UpdateTravelDiaryPage from '../pages/Travel_Diary/UpdateTravelDiaryPage';
import PlanLocationPage from '../pages/Plan/PlanLocationPage';
import PlanDatePage from '../pages/Plan/PlanDatePage';
import PlanStylePage from '../pages/Plan/PlanStylePage';
import PlanInvitePage from '../pages/Plan/PlanInvitePage';
import PlanBudgetPage from '../pages/Plan/PlanBudgetPage';
import PlanCartPage from '../pages/Plan/PlanCartPage';

import ScheduleResultPage from '../pages/Schedule/ScheduleResultPage';
import AddPlace from '../pages/Schedule/AddPlace';

const AppRoutes = () => (
  <Router>
    <AuthChecker />
    <Routes>
      <Route path="/splash" element={<Splash />} />
      <Route path="/" element={<HomePage />} />

      <Route path="/search" element={<SearchPage />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />

      <Route path="/find-password" element={<FindPasswordPage />} />
      <Route path="/find-password/verify" element={<VerifyCodePage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route path="/mypage" element={<MyPage />} />
      <Route path="/edit/profile" element={<EditProfile />} />

      <Route path="/board/hot" element={<HotBoardPage />} />
      <Route path="/region/detail/:city" element={<RegionDetailPage />} />
      <Route path="/board/budget" element={<BudgetBoardPage />} />
      <Route path="/place/detail/:contentID" element={<PlaceDetail />} />

      <Route path="/board/travel/diary" element={<TravelDiaryBoardPage />} />
      <Route
        path="/board/travel/diary/:id"
        element={<TravelDiaryDetailPage />}
      />
      <Route path="/write/travel/diary" element={<WriteTravelDiaryPage />} />
      <Route
        path="/update/travel/diary/:boardId"
        element={<UpdateTravelDiaryPage />}
      />

      <Route path="/plan/location" element={<PlanLocationPage />} />
      <Route path="/kakao/callback" element={<KakaoCallbackPage />} />
      <Route path="/plan/date" element={<PlanDatePage />} />
      <Route path="/plan/style" element={<PlanStylePage />} />
      <Route path="/plan/invite" element={<PlanInvitePage />} />
      <Route path="/plan/budget" element={<PlanBudgetPage />} />
      <Route path="/plan/cart" element={<PlanCartPage />} />

      <Route path="/plan/schedule" element={<ScheduleResultPage />} />
      <Route path="/plan/add" element={<AddPlace />} />
    </Routes>
  </Router>
);

export default AppRoutes;
