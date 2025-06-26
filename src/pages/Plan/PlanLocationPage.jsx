// src/pages/PlanLocationPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DefaultLayout from '../../layouts/DefaultLayout';
import SearchBar from '../../components/common/SearchBar';
import CategoryButton from '../../components/common/CategoryButton';
import PrimaryButton from '../../components/common/PrimaryButton';
import BackHeader from '../../components/header/BackHeader';
import usePlanStore from '../../store/planStore';

const dummyLocations = [
  {
    id: 1,
    name: '제주',
    description: '제주, 서귀포',
    imageUrl: '/assets/logo.jpg',
    selected: false,
  },
  {
    id: 2,
    name: '부산',
    description: '부산',
    imageUrl: '/assets/logo.jpg',
    selected: false,
  },
  {
    id: 3,
    name: '강릉',
    description: '강릉, 속초, 양양',
    imageUrl: '/assets/logo.jpg',
    selected: false,
  },
  {
    id: 4,
    name: '가평',
    description: '가평, 양평',
    imageUrl: '/assets/logo.jpg',
    selected: false,
  },
];

const PlanLocationPage = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [locations, setLocations] = useState(dummyLocations);
  const { setLocationIds } = usePlanStore();

  const handleSelect = (id) => {
    setLocations((prev) =>
      prev.map((loc) =>
        loc.id === id ? { ...loc, selected: !loc.selected } : loc
      )
    );
  };

   const handleNext = () => {
    const selectedIds = locations
      .filter((loc) => loc.selected)
      .map((loc) => loc.id);

    if (selectedIds.length === 0) {
      alert('최소 한 곳 이상의 여행지를 선택해 주세요.');
      return;
    }

    setLocationIds(selectedIds); // ✅ zustand 저장
    navigate('/plan/date'); // 다음 페이지로 이동
  };

  return (
    <DefaultLayout>
      <div className="max-w-md mx-auto">
        <BackHeader title="여행지 선택"/>

        <SearchBar
          placeholder="관광지/맛집/숙소 검색"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        <div className="mt-4 space-y-4">
          {locations
            .filter(
              (loc) =>
                loc.name.includes(searchText) ||
                loc.description.includes(searchText)
            )
            .map((loc) => (
              <div key={loc.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={loc.imageUrl}
                    alt={loc.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-bold text-gray-800 text-sm">
                      {loc.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {loc.description}
                    </div>
                  </div>
                </div>
                <CategoryButton
                  label={loc.selected ? '취소' : '선택'}
                  isActive={loc.selected}
                  onClick={() => handleSelect(loc.id)}
                />
              </div>
            ))}
        </div>

        <PrimaryButton onClick={handleNext} className="mt-6 w-full">
          선택 완료
        </PrimaryButton>
      </div>
    </DefaultLayout>
  );
};

export default PlanLocationPage;
