import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const BackHeader = ({ title = '' }) => {
  const navigate = useNavigate();

  return (
    <header className="flex items-center px-4 py-3 relative mb-6">
      <button onClick={() => navigate(-1)}>
        <ArrowLeft className="w-5 h-5 text-black" />
      </button>
      <h1 className="font-noonnu text-2xl absolute left-1/2 -translate-x-1/2 font-extrabold">
        {title}
      </h1>
    </header>
  );
};

export default BackHeader;
