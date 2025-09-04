import React from 'react';

const DEFAULT_IMAGE = '/images/default_place.jpg';

const RegionSummary = ({ title, description = '', regionImage = '' }) => {
  return (
    <div className="bg-white px-4 pt-6 pb-4 rounded-xl shadow">
      {/* 대표 이미지 (없으면 기본 이미지) */}
      <img
        src={regionImage || DEFAULT_IMAGE}
        alt={`${title} 대표 이미지`}
        className="w-full h-48 object-cover rounded-lg mb-4"
        onError={(e) => {
          e.currentTarget.src = DEFAULT_IMAGE;
        }}
      />

      <h2 className="text-xl font-bold text-gray-800">{title}</h2>

      <p className="mt-2 text-sm text-gray-600 whitespace-pre-line leading-relaxed">
        {description || '설명이 아직 없습니다.'}
      </p>
    </div>
  );
};

export default RegionSummary;
