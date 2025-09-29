import React, {useState} from 'react';

const DEFAULT_IMAGE = '/images/default_place.jpg';

const RegionSummary = ({ title, description = '', regionImage = '' }) => {
  const [expanded, setExpanded] = useState(false);

  const MAX_LENGTH = 200;
  const isLong = description.length > MAX_LENGTH;
  const displayText = expanded
    ? description
    : description.slice(0, MAX_LENGTH) + (isLong ? '...' : '');
  
  return (
    <div className="bg-white pb-4 rounded-xl shadow">
      {regionImage ? (
        <img
          src={regionImage}
          alt={`${title} 대표 이미지`}
          className="w-full h-48 object-cover rounded-lg mb-4 "
          onError={(e) => {
            e.currentTarget.src = DEFAULT_IMAGE;
          }}
        />
      ) : (
        <div className="w-full h-48 rounded-lg mb-4 bg-gray-200 flex items-center justify-center text-sm text-gray-500">
          No Image
        </div>
      )}

      <h2 className="px-4  text-xl font-bold text-gray-800">{title}</h2>

        <p className="px-4 mt-2 text-sm text-gray-600 whitespace-pre-line leading-relaxed">
        {displayText || '설명이 아직 없습니다.'} 
        {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="ml-4 mt-1 text-sm text-blue-500 hover:underline"
        >
          {expanded ? '접기' : '더보기'}
        </button>
      )}
      </p>


    </div>
  );
};

export default RegionSummary;
