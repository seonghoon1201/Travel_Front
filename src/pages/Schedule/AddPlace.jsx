import { useLocation } from 'react-router-dom';
import BackHeader from '../../components/header/BackHeader';
import SearchBar from '../../components/common/SearchBar';
import DefaultLayout from '../../layouts/DefaultLayout';
import CategoryButton from '../../components/common/CategoryButton';
import { useState } from 'react';

const AddPlace = () => {
  const location = useLocation();
  const dayIndex = location.state?.dayIndex ?? 0;

  const [selectedIds, setSelectedIds] = useState([]);

  const recommended = [
    {
      id: 1,
      name: '속초 해수욕장',
      category: '관광',
      contentId: 12345,
      selected: false,
      imageUrl: '',
    },
    {
      id: 2,
      name: '속초 관광수산시장',
      category: '쇼핑',
      contentId: 67890,
      selected: false,
      imageUrl: '',
    },
  ];

  const saved = [
    {
      id: 3,
      name: '속초 해수욕장',
      category: '관광',
      contentId: 11111,
      selected: false,
      imageUrl: '',
    },
  ];

  const handleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  return (
    <DefaultLayout>
      <div className="w-full max-w-sm mx-auto">
        <BackHeader />
        <SearchBar placeholder="관광지/숙소/맛집 검색" />

        {/* 저장된 장소 */}
        <h3 className="text-sm font-bold mt-6 mb-2">내 저장 장소</h3>
        <div className="space-y-2">
          {saved.map((place) => (
            <div
              key={place.id}
              className="flex justify-between items-center bg-white rounded-lg p-3 border"
            >
              <div className="flex items-center gap-3">
                <img
                  src={place.imageUrl}
                  alt={place.name}
                  className="w-14 h-14 rounded-md object-cover"
                />
                <div>
                  <p className="text-sm font-medium">{place.name}</p>
                  <p className="text-xs text-gray-400">{place.category}</p>
                </div>
              </div>
              <CategoryButton
                label={selectedIds.includes(place.id) ? '취소' : '선택'}
                isActive={selectedIds.includes(place.id)}
                onClick={() => handleSelect(place.id)}
              />
            </div>
          ))}
        </div>

        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm p-4 bg-white shadow-inner z-50">
          <button className="w-full bg-blue-500 text-white py-3 rounded-lg text-sm font-semibold">
            이 장소를 DAY {dayIndex + 1} 일정에 담기
          </button>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default AddPlace;
