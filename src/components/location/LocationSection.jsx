import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchTours } from '../../api/tour/searchTour';

const LocationSection = ({ title }) => {
  const navigate = useNavigate();
  const [places, setPlaces] = useState([]);

  useEffect(() => {
    const fetchTours = async () => {
      const res = await searchTours({
        keyword: '해운대', // 기본값
        region: '부산', // 기본값
        category: '관광지',
        page: 0,
        size: 10,
      });

      if (res.success) {
        console.log('투어 API 응답:', res.data);

        const processed = res.data.content.map((item) => {
          // city 추출 (addr1 첫 단어)
          const city = item.addr1 ? item.addr1.split(' ')[0] : item.title;
          return {
            city,
            name: item.title,
            image: item.firstImage || '/images/default_place.jpg',
          };
        });

        setPlaces(processed);
      } else {
        console.error('투어 API 호출 실패:', res.error);
      }
    };

    fetchTours();
  }, []);

  const locations = [
    { name: '제주도', image: '/images/jeju.png' },
    { name: '부산광역시', image: '/images/busan.png' },
    { name: '광주광역시', image: '/images/gwangju.png' },
  ];

  const handleClick = (city) => {
    navigate(`/region/detail/${encodeURIComponent(city)}`);
  };

  return (
    <section className="mb-5">
      <div className="flex justify-between items-center px-3">
        <h3 className="text-base font-semibold">{title}</h3>
        <button className="text-sm text-gray-500">+ 더보기</button>
      </div>

      <div className="flex gap-3 overflow-x-auto px-3 mt-2">
        {places.map((item, idx) => (
          <div
            key={idx}
            className="flex-shrink-0 w-20 text-center cursor-pointer"
            onClick={() => handleClick(item)}
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-20 h-20 rounded-full object-cover mb-1"
            />
            <p className="text-xs">{item.city}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default LocationSection;
