import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWikipediaData } from '../../utils/wikiApi';

// 더미 도시 리스트 (핫플 대상 도시)
const hotCities = ['', '부산광역시', '서울특별시', '광주광역시'];

const HotPlaceSection = () => {
  const navigate = useNavigate();
  const [places, setPlaces] = useState([]);

  useEffect(() => {
    const loadWikipediaData = async () => {
      try {
        const results = await Promise.all(
          hotCities.map(async (city) => {
            const data = await fetchWikipediaData(city);
            return {
              city: data.title,
              image: data.imageUrl, // 위키에서 받아온 이미지
              summary: data.extract, // 요약 (필요 시 상세에서 사용)
            };
          })
        );
        setPlaces(results);
      } catch (err) {
        console.error('핫플 데이터 로드 실패:', err);
      }
    };

    loadWikipediaData();
  }, []);

  const handleClick = (city) => {
    navigate(`/region/detail/${encodeURIComponent(city)}`);
  };

  return (
    <section className="mb-5">
      <div className="flex justify-between items-center px-3">
        <h3 className="text-base font-semibold">요즘 핫플</h3>
        <button className="text-sm text-gray-500">+ 더보기</button>
      </div>

      <div className="flex gap-3 overflow-x-auto px-3 mt-2">
        {places.map((item, idx) => (
          <div
            key={idx}
            className="flex-shrink-0 w-20 text-center cursor-pointer"
            onClick={() => handleClick(item.city)}
          >
            <img
              src={item.image || '/images/default_place.jpg'}
              alt={item.city}
              className="w-20 h-20 rounded-full object-cover mb-1"
            />
            <p className="text-xs">{item.city}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HotPlaceSection;
