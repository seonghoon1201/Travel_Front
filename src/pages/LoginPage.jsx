import React from 'react';
import logo from '../assets/logo.png'; // 로고 이미지
import PrimaryButton from '../components/common/PrimaryButton';

const LoginPage = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="w-[90%] max-w-sm mx-auto text-center">

        <img src={logo} alt="여담 로고" className="w-60 mx-auto mb-3" />

        <div className="text-left mb-3">
          <label className="text-sm text-text font-semibold">이메일</label>
          <input
            type="email"
            placeholder="이메일을 입력해 주세요."
            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="text-left mb-5">
          <label className="text-sm text-text font-semibold">비밀번호</label>
          <input
            type="password"
            placeholder="비밀번호를 입력해 주세요."
            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <PrimaryButton>로그인</PrimaryButton>

        <button className="w-full mt-3 py-2.5 rounded-xl bg-yellow-300 text-sm font-semibold text-black hover:brightness-95 transition flex items-center justify-center gap-2">
        <img src={require("../assets/kakao_icon.png")} alt="kakao" className="w-5 h-5" />
        카카오로 이용하기
        </button>

        <div className="mt-5 text-sm text-gray-500 flex justify-center space-x-4">
          <button className="hover:underline">비밀번호 찾기</button>
          <span className="text-gray-300">|</span>
          <button className="hover:underline">회원가입</button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
