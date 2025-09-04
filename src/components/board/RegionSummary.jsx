import React from 'react';

const DEFAULT_IMAGE = '/images/default_place.jpg';

const RegionSummary = ({ title, description = '', regionImage = '' }) => {
  return (
    <div className="bg-white px-4 pt-6 pb-4 rounded-xl shadow">
      {regionImage ? (
        <img
          src={regionImage}
          alt={`${title} 대표 이미지`}
          className="w-full h-48 object-cover rounded-lg mb-4"
          onError={(e) => {
            e.currentTarget.src = DEFAULT_IMAGE;
          }}
        />
      ) : (
        <div className="w-full h-48 rounded-lg mb-4 bg-gray-200 flex items-center justify-center text-sm text-gray-500">
          No Image
        </div>
      )}

      <h2 className="text-xl font-bold text-gray-800">{title}</h2>

      <p className="mt-2 text-sm text-gray-600 whitespace-pre-line leading-relaxed">
        {description || '설명이 아직 없습니다.'}
      </p>
    </div>
  );
};

export default RegionSummary;
