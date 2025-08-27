import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/HomePage.css';

import kakaoIcon from '../assets/kakao_icon.png';

import DefaultLayout from '../layouts/DefaultLayout';
import MainHeader from '../components/header/MainHeader';
import SideMenu from '../components/modal/SideMenu';
import CreateScheduleCard from '../components/mypage/CreateScheduleCard';
import LocationSection from '../components/location/LocationSection';
import TravelDiaryList from '../components/traveldiary/TravelDiaryList';

import useUserStore from '../store/userStore';

const HomePage = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const initializeFromStorage = useUserStore(
    (state) => state.initializeFromStorage
  );

  useEffect(() => {
    useUserStore.getState().initializeFromStorage();
  }, []);

  const dummyLocations = [
    { city: '제주특별자치도', name: '제주도', image: kakaoIcon },
    { city: '부산', name: '부산', image: kakaoIcon },
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
      <DefaultLayout>
        <div className="w-full max-w-sm mx-auto">

          <MainHeader isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
          <div className="max-w-md w-full mx-auto mt-[1rem]">

            {isMenuOpen && <SideMenu onClose={() => setIsMenuOpen(false)} />}

            <main className="w-full">
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
              <TravelDiaryList title="여행 일기" showMore={true} />
            </main>
          </div>
        </div>
      </DefaultLayout>
    </>
  );
};

export default HomePage;
