// src/layouts/DefaultLayout.jsx
import React from 'react';

const DefaultLayout = ({ children }) => {
  return (
    <div
      className="
        bg-background text-foreground
        min-h-svh w-full
        font-pretendard
        flex flex-col
        pt-[env(safe-area-inset-top)]
        pb-[max(env(safe-area-inset-bottom),0.75rem)]
      "
    >
      {/* 내부는 너가 원하듯 w-full만 유지 */}
      <div className="w-full">{children}</div>
    </div>
  );
};

export default DefaultLayout;
