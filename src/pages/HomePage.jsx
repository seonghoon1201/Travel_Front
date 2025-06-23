import React from 'react';
import '../styles/HomePage.css';

//test용
import kakaoIcon from '../assets/kakao_icon.png';
import MainHeader from '../components/header/MainHeader';
import LocationSection from '../components/location/LocationSection';

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
      </main>
    </>
  );
};

export default HomePage;
