// src/pages/Plan/PlanStylePage.jsx
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

const STYLE_MAP = {
  '체험 · 액티비티': 'Activity',
  '맛집 탐방': 'Food',
  쇼핑: 'Shopping',
  '유적지 탐방': 'Heritage',
  '힐링 여행': 'Healing',
};

// 같은 세션인지 확인 (sessionStorage.planSessionId ↔ store.planSessionId)
const isSamePlanSession = () => {
  const ss = sessionStorage.getItem('planSessionId');
  const { inPlanFlow, planSessionId } = usePlanStore.getState();
  return inPlanFlow && ss && String(ss) === String(planSessionId);
};

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

  // 초기 복원(같은 세션일 때만)
  useEffect(() => {
    if (!isSamePlanSession()) return; // 새 시작이면 복원하지 않음
    if (companionFromStore) setSelectedCompanion(companionFromStore);
    if (Array.isArray(stylesFromStore) && stylesFromStore.length) {
      setSelectedStyles(stylesFromStore);
    }
    if (transportFromStore) setSelectedTransport(transportFromStore);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleStyle = (style) => {
    setSelectedStyles((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]
    );
  };

  const handleSubmit = () => {
    const missing = [];
    if (!selectedCompanion) missing.push('누구와');
    if (selectedStyles.length === 0) missing.push('여행 스타일');
    if (!selectedTransport) missing.push('이동 수단');

    if (missing.length > 0) {
      message.warning(`${missing.join(', ')}을(를) 선택해주세요.`);
      return;
    }

    // store 저장
    setCompanion(selectedCompanion);
    setStyles(selectedStyles);
    setTransport(selectedTransport);

    // scheduleStyle 단일값 저장 (첫 번째 선택 기준, 매핑 적용)
    const first = selectedStyles[0];
    const mapped = first ? STYLE_MAP[first] ?? first : '';
    setScheduleStyle(mapped);

    navigate('/plan/budget');
  };

  const gridResponsive =
    'grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3';

  return (
    <DefaultLayout>
      <div className="w-full mx-auto pb-28">
        <BackHeader title="여행 스타일 선택" />
        <div className="px-4 sm:px-6 md:px-8">
          <div className="mt-6 space-y-8">
            {/* 누구와 */}
            <div>
              <p className="text-sm font-semibold text-gray-800 mb-3">누구와</p>
              <div className={gridResponsive}>
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
              <div className={gridResponsive}>
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
              <div className={gridResponsive}>
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
        </div>
      </div>

      {/* 하단 고정 버튼 바 */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur border-t footer-safe">
        <div className="mx-auto w-full px-4 sm:px-6 md:px-8 py-3">
          <PrimaryButton onClick={handleSubmit} className="w-full">
            완료
          </PrimaryButton>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default PlanStylePage;
