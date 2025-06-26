import React from 'react';

const DefaultLayout = ({ children }) => {
  return (
    <div className="bg-background min-h-screen flex flex-col w-full font-pretendard px-4 py-6">
      <div className="w-full mx-auto">
        {children}
      </div>
    </div>
  );
};

export default DefaultLayout;