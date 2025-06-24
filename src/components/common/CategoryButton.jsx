import React from 'react';

const CategoryButton = ({ label, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-full text-sm font-semibold transition
        ${isActive ? 'bg-blue-400 text-white' : 'bg-blue-100 text-gray-500'}
      `}
    >
      {label}
    </button>
  );
};

export default CategoryButton;
