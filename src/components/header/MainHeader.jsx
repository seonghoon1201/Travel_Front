import React from 'react';
import { Search, Menu } from 'lucide-react';

import logo from '../../assets/main_logo.png';
import SideMenu from '../modal/SideMenu';
import { useNavigate } from 'react-router-dom';

const MainHeader = ({ isMenuOpen, setIsMenuOpen }) => {
  const navigate = useNavigate();

  const onMenuClick = () => {
    setIsMenuOpen(true);
  };

  return (
    <>
      <header className="flex items-center justify-between bg-[#E2F2FA] h-20 px-4 sm:px-6 md:px-8">
        {/* 왼쪽: 로고 */}
        <div className="flex items-center">
          <img 
            src={logo} 
            alt="여담 로고" 
            className="h-16 sm:h-14 md:h-16" 
          />
        </div>

        {/* 오른쪽: 검색, 메뉴 아이콘 */}
        <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
          <button 
            type="button" 
            onClick={() => navigate('/search')}
            className="p-2 sm:p-2.5 md:p-3 rounded-lg hover:bg-white/20 transition-colors"
          >
            <Search className="w-5 h-5 sm:w-6 sm:h-6 text-[#143447]" />
          </button>
          <button 
            type="button" 
            onClick={onMenuClick}
            className="p-2 sm:p-2.5 md:p-3 rounded-lg hover:bg-white/20 transition-colors"
          >
            <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-[#143447]" />
          </button>
        </div>
      </header>

      {isMenuOpen && <SideMenu onClose={() => setIsMenuOpen(false)} />}
    </>
  );
};

export default MainHeader;