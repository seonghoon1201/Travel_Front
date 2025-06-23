import React from 'react';
import { X } from 'lucide-react';

const SideMenu = ({ onClose }) => {
  const isLoggedIn = true; // 실제로는 props나 context로 처리

  return (
    <>
      {/* 배경 오버레이 */}
      <div
        className="fixed inset-0 bg-black bg-opacity-40 z-40"
        onClick={onClose}
      />

      {/* 사이드 메뉴 */}
      <div className="fixed top-0 right-0 h-full w-2/3 bg-white z-50 shadow-lg transition-transform duration-300">
        <div className="flex justify-end p-4">
          <button onClick={onClose}>
            <X className="w-6 h-6 text-gray-700" />
          </button>
        </div>

        <div className="px-6">
          {isLoggedIn ? (
            <>
              <p className="font-bold text-lg mb-4">안녕하세요, 사용자님!</p>
              <ul className="space-y-4">
                <li>나의 여행일지</li>
                <li>찜한 장소</li>
                <li>헬친 목록</li>
                <li className="text-red-500">로그아웃</li>
              </ul>
            </>
          ) : (
            <>
              <p className="font-bold text-lg mb-4">로그인 / 회원가입</p>
              <ul className="space-y-4">
                <li>로그인</li>
                <li>회원가입</li>
              </ul>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default SideMenu;
