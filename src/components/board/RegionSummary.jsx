import React, { useEffect, useState } from 'react';
import { fetchWikipediaData } from '../../utils/wikiApi';

const RegionSummary = ({ title }) => {
  const [summary, setSummary] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const { extract, imageUrl } = await fetchWikipediaData(title);
      // 내용 너무 많아서 한 단락 추출
      const trimmed = extract.split('\n\n').slice(0, 1).join('\n\n');
      setSummary(trimmed);
      setImageUrl(imageUrl);
      setLoading(false);
    };

    if (title) loadData();
  }, [title]);

  const toggleExpanded = () => setExpanded((prev) => !prev);
  // 200자 이상 더보기, 간략히 보기 버튼
  const MAX_LENGTH = 200;
  const isLong = summary.length > MAX_LENGTH;
  const displayText =
    expanded || !isLong ? summary : summary.slice(0, MAX_LENGTH) + '...';

  return (
    <div className="bg-white px-4 pt-6 pb-4 rounded-xl shadow">
      {/* 이미지 대표 1개만 추출 가능 */}
      {imageUrl && (
        <img
          src={imageUrl}
          alt={`${title} 대표 이미지`}
          className="w-full h-48 object-cover rounded-lg mb-4"
        />
      )}
      <h2 className="text-xl font-bold text-gray-800">{title}</h2>
      <p className="mt-2 text-sm text-gray-600 whitespace-pre-line leading-relaxed">
        {loading ? '불러오는 중...' : displayText}
      </p>
      {isLong && (
        <button
          onClick={toggleExpanded}
          className="mt-2 text-blue-600 text-sm font-medium hover:underline"
        >
          {expanded ? '간단히' : '더보기'}
        </button>
      )}
    </div>
  );
};

export default RegionSummary;
