import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DefaultLayout from '../../layouts/DefaultLayout';
import BackHeader from '../../components/header/BackHeader';
import CategoryButton from '../../components/common/CategoryButton';
import PrimaryButton from '../../components/common/PrimaryButton';
import usePlanStore from '../../store/planStore';
import { message } from 'antd';

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

const PlanStylePage = () => {
  const navigate = useNavigate();

  const [selectedCompanion, setSelectedCompanion] = useState('');
  const [selectedStyles, setSelectedStyles] = useState([]);
  const [selectedTransport, setSelectedTransport] = useState('');

  // store 값
  const companionFromStore = usePlanStore((s) => s.companion);
  const stylesFromStore = usePlanStore((s) => s.styles);
  const transportFromStore = usePlanStore((s) => s.transport);

  // store 액션
  const setCompanion = usePlanStore((s) => s.setCompanion);
  const setStyles = usePlanStore((s) => s.setStyles);
  const setTransport = usePlanStore((s) => s.setTransport);
  const setScheduleStyle = usePlanStore((s) => s.setScheduleStyle);
  const setScheduleType = usePlanStore((s) => s.setScheduleType);

  // ✅ UI 라벨(한글) → API enum(영문) 매핑 (예시)
  const STYLE_MAP = {
    '체험 · 액티비티': 'Activity',
    '맛집 탐방': 'Food',
    쇼핑: 'Shopping',
    '유적지 탐방': 'Heritage',
    '힐링 여행': 'Healing',
  };

  // ✅ 마운트 시 store 값 복원 (return 위, 컴포넌트 본문에 위치)
  useEffect(() => {
    if (companionFromStore) setSelectedCompanion(companionFromStore);
    if (Array.isArray(stylesFromStore) && stylesFromStore.length) {
      setSelectedStyles(stylesFromStore);
    }
    if (transportFromStore) setSelectedTransport(transportFromStore);
  }, []); // 의도적으로 1회만 복원

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
      message.warning('모든 항목을 선택해주세요.');
      return;
    }

    // store 저장
    setCompanion(selectedCompanion);
    setStyles(selectedStyles);
    setTransport(selectedTransport);
    setScheduleType(selectedCompanion === '혼자' ? 'SOLO' : 'GROUP');

    // ✅ scheduleStyle 단일값 저장 (첫 번째 선택 기준, 매핑 적용)
    const first = selectedStyles[0];
    const mapped = first ? STYLE_MAP[first] ?? first : '';
    setScheduleStyle(mapped);

    navigate('/plan/invite');
  };

  const gridClass = 'grid grid-cols-3 gap-3';

  return (
    <DefaultLayout>
      <div className="w-full max-w-sm mx-auto">
        <BackHeader title="여행 스타일 선택" />
        <div className="px-4">
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
            <div>
              <p className="text-sm font-semibold text-gray-800 mb-3">
                이동 수단
              </p>
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
      </div>
    </DefaultLayout>
  );
};

export default PlanStylePage;
