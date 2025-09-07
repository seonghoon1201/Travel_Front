import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import DefaultLayout from '../layouts/DefaultLayout';
import BackHeader from '../components/header/BackHeader';
import ProfileSummary from '../components/profile/ProfileSummary';
import TabMenu from '../components/modal/TapMenu';
import MyTravelSection from '../components/mypage/MyTravelSection';
import MyDiarySection from '../components/mypage/MyDiarySection';
import MyBookmarkSection from '../components/mypage/MyBookmarkSection';

import useUserStore from '../store/userStore';

const MyPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('myTrip');

  const nickname = useUserStore((state) => state.nickname);

  // URL 쿼리로 activeTab 갱신
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'myTrip' || tab === 'myDiary' || tab === 'myBookmark') {
      setActiveTab(tab);
    }
  }, [location]);

  // 탭 상태에 따라 URL 변경
  useEffect(() => {
    navigate(`/mypage?tab=${activeTab}`, { replace: true });
  }, [activeTab, navigate]);

  return (
    <DefaultLayout>
      <div className="w-full mx-auto ">
        <BackHeader
          showRightButton={true}
          rightButtonText="프로필 편집"
          onRightButtonClick={() => navigate('/edit/profile')}
        />
        <div></div>

        <ProfileSummary nickname={nickname} />
        <TabMenu activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* 탭별 콘텐츠 렌더링 */}
        {activeTab === 'myTrip' && <MyTravelSection />}
        {activeTab === 'myDiary' && <MyDiarySection />}
        {activeTab === 'myBookmark' && <MyBookmarkSection />}
      </div>
    </DefaultLayout>
  );
};

export default MyPage;
