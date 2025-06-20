import React from "react";

const PrimaryButton = ({ children, className = "", ...props }) => {
  return (
    <button
      className={`bg-button hover:bg-primary text-white w-full text-center py-2.5 rounded-xl text-sm font-semibold transition ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};


export default PrimaryButton;
