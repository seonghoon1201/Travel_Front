import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/HomePage.css';

//test용
import kakaoIcon from '../assets/kakao_icon.png';

import MainHeader from '../components/header/MainHeader';
import SideMenu from '../components/modal/SideMenu';
import CreateScheduleCard from '../components/mypage/CreateScheduleCard';
import LocationSection from '../components/location/LocationSection';
import TravelDiaryList from '../components/traveldiary/TravelDiaryList';

import useUserStore from '../store/userStore';
import { getItem } from '../utils/localStorage';

const HomePage = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const setState = useUserStore.setState;

  useEffect(() => {
    useUserStore.getState().initializeFromStorage();
  }, []);

  //더미값 test
  const dummyLocations = [
    { name: '제주도', image: kakaoIcon },
    { name: '부산', image: kakaoIcon },
    { name: '강릉', image: kakaoIcon },
    { name: '강릉', image: kakaoIcon },
    { name: '강릉', image: kakaoIcon },
    { name: '강릉', image: kakaoIcon },
    { name: '강릉', image: kakaoIcon },
    { name: '강릉', image: kakaoIcon },
    { name: '강릉', image: kakaoIcon },
    { name: '강릉', image: kakaoIcon },
    { name: '강릉', image: kakaoIcon },
  ];
  //더미값 test
  const dummyDiaries = [
    {
      id: 1,
      title: '6월의 제주',
      image: '/images/jeju.png',
    },
    {
      id: 2,
      title: '6월의 제주',
      image: '',
    },
    {
      id: 3,
      title: '6월의 제주',
      image: '/images/jeju.png',
    },
    {
      id: 4,
      title: '6월의 제주',
      image: '/images/jeju.png',
    },
    {
      id: 5,
      title: '6월의 제주',
      image: '/images/jeju.png',
    },
    {
      id: 6,
      title: '6월의 제주',
      image: '/images/jeju.png',
    },
  ];

  return (
    <>
      <MainHeader isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
      {isMenuOpen && <SideMenu onClose={() => setIsMenuOpen(false)} />}
      <main className="w-full p-2">
        <CreateScheduleCard />

        <LocationSection
          title="요즘 핫플"
          type="hot"
          locations={dummyLocations}
          showMore={true}
          navigateTo="/board/hot"
        />
        <LocationSection
          title="저예산 추천 여행지"
          type="budget"
          locations={dummyLocations}
          showMore={true}
          navigateTo="/board/budget"
        />
        <TravelDiaryList
          title="여행 일기"
          diaries={dummyDiaries}
          showMore={true}
        />
      </main>
    </>
  );
};

export default HomePage;
