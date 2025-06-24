import React, { useState } from 'react';

import BackHeader from '../components/header/BackHeader';
import ProfileSummary from '../components/profile/ProfileSummary';
import TabMenu from '../components/modal/TapMenu';
import MyTravelSection from '../components/mypage/MyTravelSection';
import MyDiarySection from '../components/mypage/MyDiarySection';
import MyBookmarkSection from '../components/mypage/MyBookmarkSection';

const MyPage = () => {
  const [activeTab, setActiveTab] = useState('myTrip');

  return (
    <div className="min-h-screen font-pretendard">
      <BackHeader />
      <ProfileSummary />
      <TabMenu activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* 탭별 콘텐츠 렌더링 */}
      {activeTab === 'myTrip' && <MyTravelSection />}
      {activeTab === 'myDiary' && <MyDiarySection />}
      {activeTab === 'myBookmark' && <MyBookmarkSection />}
    </div>
  );
};

export default MyPage;
