import React, { useState } from 'react';
import { Search, Menu } from 'lucide-react';

import logo from '../../assets/main_logo.png';
import SideMenu from '../modal/SideMenu';

const MainHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="flex items-center justify-between px-4 py-2 bg-[#E2F2FA]">
      {/* 왼쪽: 전체 로고 이미지 */}
      <img src={logo} alt="여담 로고" className="h-16" />

      {/* 오른쪽: 아이콘 2개 */}
      <div className="flex space-x-5">
        {/* 검색 */}
        <button type="button">
          <Search className="w-6 h-6 text-[#143447]" />
        </button>
        {/* 햄버거 */}
        <button type="button" onClick={() => setIsMenuOpen(true)}>
          <Menu className="w-6 h-6 text-[#143447]" />
        </button>

        {isMenuOpen && <SideMenu onClose={() => setIsMenuOpen(false)} />}
      </div>
    </header>
  );
};

export default MainHeader;
