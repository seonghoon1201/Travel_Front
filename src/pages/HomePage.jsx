import React from 'react';
import { CalendarPlus } from 'lucide-react';
import '../styles/HomePage.css';

//test용
import kakaoIcon from '../assets/kakao_icon.png';

import MainHeader from '../components/header/MainHeader';
import LocationSection from '../components/location/LocationSection';
import TravelDiaryList from '../components/traveldiarymain/TravelDiaryList';

const HomePage = () => {
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
      <MainHeader />
      <main className="w-full max-w-screen-sm mx-auto px-4 py-6">
        <LocationSection
          title="요즘 핫플"
          locations={dummyLocations}
          showMore={true}
        />
        <LocationSection
          title="저예산 추천 여행지"
          locations={dummyLocations}
          showMore={true}
        />
        <TravelDiaryList
          title="여행 일기"
          diaries={dummyDiaries}
          showMore={true}
        />
        {/* 하단 여행하기 section */}
        <div className="w-full flex items-center justify-between px-2 mt-3">
          {/* 왼쪽 텍스트  (60%) */}
          <div className="w-3/5 flex flex-col items-start">
            <h3 className="font-jalnongothic text-xl text-[#143447] mb-2">
              친구와 함께 여행하기
            </h3>
            <p className="font-noonnu text-gray-500 mb-2">
              여행 경비 공유하고 일정짜기
            </p>
            <button className="font-pretendard bg-primary text-white px-5 py-2 rounded-full shadow transition flex items-center gap-x-2">
              <CalendarPlus className="w-5 h-5" />
              <span>일정 짜기</span>
            </button>
          </div>

          {/* 오른쪽 이미지 (40%) */}
          <div className="w-2/5 flex justify-end">
            <img
              src={require('../assets/main_picture.png')}
              alt="메인 이미지"
              className="w-full h-auto object-contain max-w-xs"
            />
          </div>
        </div>
      </main>
    </>
  );
};

export default HomePage;
