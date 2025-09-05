import React from 'react';

const DefaultLayout = ({ children }) => {
  return (
    <div className="bg-background min-h-dvh flex flex-col w-full font-pretendard">
      {/* 전체 폭 사용: 내부 래퍼에서 max-w 제거 */}
      <div className="w-full">{children}</div>
    </div>
  );
};

export default DefaultLayout;

// <DefaultLayout>
//  <div className="w-full max-w-sm mx-auto">
//    <Page내용>
//  </div>
// </DefaultLayout>
