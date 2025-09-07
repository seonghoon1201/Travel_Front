import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHotRegions } from '../../api/region/getHotRegions';

const LocationSection = ({ navigateTo = '/board/hot', limit = 10 }) => {
  const navigate = useNavigate();
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState(new Set());

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      
      const res = await getHotRegions(limit);
      if (res.success) {
        
        const dedup = [];
        const seen = new Set();
        for (const item of res.data) {
          const name = item.regionName ?? '';
          if (name && !seen.has(name)) {
            seen.add(name);
            const processedItem = {
              city: name,
              image: item.regionImage || '',
              summary: item.description || '',
              regionId: item.regionId,
              regionCode: item.regionCode,
              ldongRegnCd: item.ldongRegnCd,
              ldongSignguCd: item.ldongSignguCd, 
            };
            
            dedup.push(processedItem);
          }
        }
        setPlaces(dedup);
      } else {
        setPlaces([]); 
      }
      setLoading(false);
    };
    load();
  }, [limit]);

  const handleClick = (city, ldongRegnCd, ldongSignguCd) => {
    navigate(`/region/detail/${encodeURIComponent(city)}`, {
      state: { 
        ldongRegnCd, 
        ldongSignguCd,
        from: 'hotplace' 
      },
    });
  };

  const handleImageError = (index) => {
    setImageErrors(prev => new Set(prev).add(index));
  };

  return (
    <section className="mb-5">
      <div className="flex justify-between items-center ">
        <h2 className="font-jalnongothic">요즘 핫플</h2>
        <button
          className="font-pretendard text-sm text-blue-500 border rounded-full py-0.5"
          onClick={() => navigate(navigateTo)}
        >
          + 더보기
        </button>
      </div>

      {/* 로딩 스켈레톤 */}
      {loading ? (
        <div className="flex gap-2 sm:gap-3 overflow-x-auto px-3 mt-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-16 sm:w-20 md:w-24 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-gray-200 animate-pulse mb-1" />
              <div className="h-3 w-12 mx-auto bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex gap-2 sm:gap-3 overflow-x-auto  mt-2 scrollbar-hide">
          {places.slice(0, 10).map((item, idx) => (
            <div
              key={idx}
              className="flex-shrink-0 w-16 sm:w-20 md:w-24 text-center cursor-pointer"
              onClick={() => handleClick(
                item.city, 
                item.ldongRegnCd, 
                item.ldongSignguCd,  
              )}
            >
              {!item.image || imageErrors.has(idx) ? (
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-gray-200 flex items-center justify-center mb-1">
                  <span className="text-xs sm:text-sm text-gray-500 font-medium">No Image</span>
                </div>
              ) : (
                <img
                  src={item.image}
                  alt={item.city}
                  className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full object-cover mb-1"
                  onError={() => handleImageError(idx)}
                />
              )}
              <p className="text-xs sm:text-sm truncate">{item.city}</p>
            </div>
          ))}

          {/* 데이터가 없을 때 안내 */}
          {places.length === 0 && !loading && (
            <div className="text-sm text-gray-500 px-2 py-4">현재 인기 지역이 없어요.</div>
          )}
        </div>
      )}
      
    </section>
  );
};

export default LocationSection;