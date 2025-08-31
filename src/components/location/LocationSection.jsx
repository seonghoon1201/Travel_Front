import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHotRegions } from '../../api/region/getHotRegions';

const DEFAULT_IMAGE = '/images/default_place.jpg';

const HotPlaceSection = ({ navigateTo = '/board/hot', limit = 10 }) => {
  const navigate = useNavigate();
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const res = await getHotRegions(limit);
      if (res.success) {
        // LocationSection/현재 UI에 맞게 가공
        const dedup = [];
        const seen = new Set();
        for (const item of res.data) {
          const name = item.regionName ?? '';
          if (name && !seen.has(name)) {
            seen.add(name);
            dedup.push({
              city: name,
              image: item.regionImage || DEFAULT_IMAGE,
              summary: item.description || '',
              regionId: item.regionId,
              regionCode: item.regionCode,
              ldongRegnCd: item.ldongRegnCd,
              ldongSgguCd: item.ldongSgguCd,
            });
          }
        }
        setPlaces(dedup);
      } else {
        setPlaces([]); // 실패 시 빈 배열
      }
      setLoading(false);
    };
    load();
  }, [limit]);

  const handleClick = (city) => {
    navigate(`/region/detail/${encodeURIComponent(city)}`);
  };

  return (
    <section className="mb-5">
      <div className="flex justify-between items-center px-2">
        <h3 className="font-jalnongothic">요즘 핫플</h3>
        <button
          className="font-pretendard text-sm text-blue-500 border rounded-full px-2 py-0.5"
          onClick={() => navigate(navigateTo)}
        >
          + 더보기
        </button>
      </div>

      {/* 로딩 스켈레톤 */}
      {loading ? (
        <div className="flex gap-3 overflow-x-auto px-3 mt-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-20 text-center">
              <div className="w-20 h-20 rounded-full bg-gray-200 animate-pulse mb-1" />
              <div className="h-3 w-12 mx-auto bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto px-3 mt-2 scrollbar-hide">
          {places.slice(0, 7).map((item, idx) => (
            <div
              key={idx}
              className="flex-shrink-0 w-20 text-center cursor-pointer"
              onClick={() => handleClick(item.city)}
            >
              <img
                src={item.image || DEFAULT_IMAGE}
                alt={item.city}
                className="w-20 h-20 rounded-full object-cover mb-1"
                onError={(e) => {
                  e.currentTarget.src = DEFAULT_IMAGE;
                }}
              />
              <p className="text-xs">{item.city}</p>
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

export default HotPlaceSection;
