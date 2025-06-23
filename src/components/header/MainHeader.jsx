import React from 'react';
import { Search, Menu } from 'lucide-react';

import logo from '../../assets/main_logo.png';
import SideMenu from '../modal/SideMenu';

const MainHeader = ({ isMenuOpen, setIsMenuOpen }) => {
  const onMenuClick = () => {
    setIsMenuOpen(true);
  };

  return (
    <>
      <header className="flex items-center justify-between px-4 py-2 bg-[#E2F2FA]">
        {/* 왼쪽: 전체 로고 이미지 */}
        <img src={logo} alt="여담 로고" className="h-16" />

        {/* 오른쪽: 아이콘 2개 */}
        <div className="flex space-x-5">
          <button type="button">
            <Search className="w-6 h-6 text-[#143447]" />
          </button>
          <button type="button" onClick={onMenuClick}>
            <Menu className="w-6 h-6 text-[#143447]" />
          </button>
        </div>
      </header>

      {/* ✅ 헤더 바깥에 위치해야 fixed 오버레이가 전체 덮음 */}
      {isMenuOpen && <SideMenu onClose={() => setIsMenuOpen(false)} />}
    </>
  );
};

export default MainHeader;
