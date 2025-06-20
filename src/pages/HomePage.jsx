import React from 'react';
import Main from '../components/header/Main';

const HomePage = () => {
  return (
    <>
      <Main className="w-full max-w-screen-sm mx-auto px-4 py-6">
        <h2 className="text-lg font-bold text-gray-800">홈 화면</h2>
        <p className="mt-2 text-sm text-gray-600">
          여기는 모바일 화면을 기준으로 구성된 홈입니다.
        </p>
      </Main>
    </>
  );
};

export default HomePage;
