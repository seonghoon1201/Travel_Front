import React from 'react';

const DefaultLayout = ({ children }) => {
  return (
    <div className="bg-background min-h-screen flex flex-col w-full font-pretendard ">
      <div className="w-full mx-auto">{children}</div>
    </div>
  );
};

export default DefaultLayout;

// <DefaultLayout>
//  <div className="w-full max-w-sm mx-auto">
//    <Page내용>
//  </div>
// </DefaultLayout>
