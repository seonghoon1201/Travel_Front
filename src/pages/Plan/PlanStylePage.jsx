import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DefaultLayout from '../../layouts/DefaultLayout';
import BackHeader from '../../components/header/BackHeader';
import CategoryButton from '../../components/common/CategoryButton';
import PrimaryButton from '../../components/common/PrimaryButton';
import usePlanStore from '../../store/planStore';

const companions = ['혼자', '친구와', '연인과', '배우자와', '아이와', '부모님과', '가족과'];
const travelStyles = ['체험 · 액티비티', '맛집 탐방', '쇼핑', '유적지 탐방', '힐링 여행'];
const transports = ['자동차', '비행기', '대중교통'];

const PlanStylePage = () => {
  const navigate = useNavigate();
  const [selectedCompanion, setSelectedCompanion] = useState('');
  const [selectedStyles, setSelectedStyles] = useState([]);
  const [selectedTransport, setSelectedTransport] = useState('');

  const setCompanion = usePlanStore((state) => state.setCompanion);
  const setStyles = usePlanStore((state) => state.setStyles);
  const setTransport = usePlanStore((state) => state.setTransport);

  const toggleStyle = (style) => {
    setSelectedStyles((prev) =>
      prev.includes(style)
        ? prev.filter((s) => s !== style)
        : [...prev, style]
    );
  };

  const handleSubmit = () => {
    if (!selectedCompanion || !selectedTransport || selectedStyles.length === 0) {
      alert('모든 항목을 선택해주세요.');
      return;
    }

    setCompanion(selectedCompanion);
    setStyles(selectedStyles);
    setTransport(selectedTransport);

    navigate('/plan/invite');
  };

  const gridClass = 'grid grid-cols-3 gap-3';

  return (
    <DefaultLayout>
      <div className="w-full max-w-sm mx-auto">
        <BackHeader title="여행 스타일 선택" />

        <div className="mt-6 space-y-8">
          {/* 누구와 */}
          <div>
            <p className="text-sm font-semibold text-gray-800 mb-3">누구와</p>
            <div className={gridClass}>
              {companions.map((item) => (
                <CategoryButton
                  key={item}
                  label={item}
                  isActive={selectedCompanion === item}
                  onClick={() => setSelectedCompanion(item)}
                />
              ))}
            </div>
          </div>

          {/* 여행 스타일 */}
          <div>
            <p className="text-sm font-semibold text-gray-800 mb-3">여행 스타일</p>
            <div className={gridClass}>
              {travelStyles.map((style) => (
                <CategoryButton
                  key={style}
                  label={style}
                  isActive={selectedStyles.includes(style)}
                  onClick={() => toggleStyle(style)}
                />
              ))}
            </div>
          </div>

          {/* 이동 수단 */}
          <div>
            <p className="text-sm font-semibold text-gray-800 mb-3">이동 수단</p>
            <div className={gridClass}>
              {transports.map((mode) => (
                <CategoryButton
                  key={mode}
                  label={mode}
                  isActive={selectedTransport === mode}
                  onClick={() => setSelectedTransport(mode)}
                />
              ))}
            </div>
          </div>
        </div>

        <PrimaryButton onClick={handleSubmit} className="mt-10 w-full">
          완료
        </PrimaryButton>
      </div>
    </DefaultLayout>
  );
};

export default PlanStylePage;
