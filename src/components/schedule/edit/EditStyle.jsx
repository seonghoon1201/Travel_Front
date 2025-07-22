import React, { useState } from 'react';
import CategoryButton from '../../common/CategoryButton';
import PrimaryButton from '../../common/PrimaryButton';

const companions = [
  '혼자',
  '친구와',
  '연인과',
  '배우자와',
  '아이와',
  '부모님과',
  '가족과',
];
const travelStyles = [
  '체험 · 액티비티',
  '맛집 탐방',
  '쇼핑',
  '유적지 탐방',
  '힐링 여행',
];
const transports = ['자동차', '비행기', '대중교통'];

const EditStyle = ({
  currentCompanion,
  currentStyles,
  currentTransport,
  onClose,
  onSave,
}) => {
  const [selectedCompanion, setSelectedCompanion] = useState(
    currentCompanion || ''
  );
  const [selectedStyles, setSelectedStyles] = useState(currentStyles || []);
  const [selectedTransport, setSelectedTransport] = useState(
    currentTransport || ''
  );

  const toggleStyle = (style) => {
    setSelectedStyles((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]
    );
  };

  const handleSubmit = () => {
    if (
      !selectedCompanion ||
      !selectedTransport ||
      selectedStyles.length === 0
    ) {
      alert('모든 항목을 선택해주세요.');
      return;
    }

    onSave({
      companion: selectedCompanion,
      styles: selectedStyles,
      transport: selectedTransport,
    });

    onClose(); // 모달 닫기
  };

  const gridClass = 'grid grid-cols-3 gap-3';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/30"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-sm mx-auto rounded-t-xl px-6 pt-6 pb-3 overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-base font-semibold text-gray-800 mb-6">
          여행 스타일 등록 및 수정
        </h2>

        {/* 누구와 */}
        <div className="mb-6">
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
        <div className="mb-6">
          <p className="text-sm font-semibold text-gray-800 mb-3">
            여행 스타일
          </p>
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
        <div className="mb-8">
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

        <PrimaryButton onClick={handleSubmit} className="w-full">
          완료
        </PrimaryButton>
      </div>
    </div>
  );
};

export default EditStyle;
