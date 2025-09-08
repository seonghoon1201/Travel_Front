import React from 'react';

const TabMenu = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { key: 'myTrip', label: '내 여행' },
    { key: 'myDiary', label: '여행 일기' },
    { key: 'myBookmark', label: '즐겨찾기' },
  ];

  return (
    <div className="font-noonnu flex justify-around border-b border-gray-200">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => setActiveTab(tab.key)}
          className={`py-3 px-2 text-sm  ${
            activeTab === tab.key
              ? 'text-black border-b-2 border-primary'
              : 'text-gray-400'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default TabMenu;
