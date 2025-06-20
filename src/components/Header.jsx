import React from 'react';
import { Menu } from 'antd';
import { Home, Calendar, User } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-white shadow p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-primary">여담</h1>
        <Menu mode="horizontal">
          <Menu.Item key="home" icon={<Home size={18} />}>홈</Menu.Item>
          <Menu.Item key="plan" icon={<Calendar size={18} />}>일정</Menu.Item>
          <Menu.Item key="mypage" icon={<User size={18} />}>마이페이지</Menu.Item>
        </Menu>
      </div>
    </header>
  );
};

export default Header;
