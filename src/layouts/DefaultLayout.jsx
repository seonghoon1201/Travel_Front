// src/layouts/DefaultLayout.jsx
import React from 'react';

const DefaultLayout = ({ children }) => {
  return (
    <div className="min-h-svh w-full bg-background text-foreground">
      <div className="w-full">{children}</div>
    </div>
  );
};

export default DefaultLayout;
