import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

import BackHeader from '../components/header/BackHeader';
import ProfileSummary from '../components/profile/ProfileSummary';
import TabMenu from '../components/modal/TapMenu';
import MyTravelSection from '../components/mypage/MyTravelSection';
import MyDiarySection from '../components/mypage/MyDiarySection';
import MyBookmarkSection from '../components/mypage/MyBookmarkSection';

const MyPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('myTrip');

  useEffect(() => {
    const tabFromURL = searchParams.get('tab');
    if (
      tabFromURL === 'myTrip' ||
      tabFromURL === 'myDiary' ||
      tabFromURL === 'myBookmark'
    ) {
      setActiveTab(tabFromURL);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen font-pretendard">
      <div className="px-4 py-6">
        <BackHeader
          showRightButton={true}
          rightButtonText="프로필 편집"
          onRightButtonClick={() => navigate('/edit/profile')}
        />
      </div>

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
