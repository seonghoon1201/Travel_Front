import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DefaultLayout from '../../layouts/DefaultLayout';
import BackHeader from '../../components/header/BackHeader';
import PrimaryButton from '../../components/common/PrimaryButton';
import usePlanStore from '../../store/planStore';

const PlanBudgetPage = () => {
  const navigate = useNavigate();

  // ✅ selector로 필요한 값/액션만 구독 (불필요 리렌더 감소)
  const locationIds = usePlanStore((s) => s.locationIds);
  const storePeople = usePlanStore((s) => s.people);
  const storeBudget = usePlanStore((s) => s.budget);
  const savePeople = usePlanStore((s) => s.setPeople);
  const saveBudget = usePlanStore((s) => s.setBudget);

  const [people, setPeople] = useState(1);
  const [budget, setBudget] = useState(0);

  // ✅ 페이지 재방문 시 스토어 값 복원
  useEffect(() => {
    if (storePeople && Number(storePeople) > 0) setPeople(storePeople);
    if (Number.isFinite(storeBudget) && storeBudget >= 0)
      setBudget(storeBudget);
  }, [storePeople, storeBudget]);

  const minBudget = 0;
  const maxBudget = 10_000_000;

  const handlePeopleChange = (delta) => {
    setPeople((prev) => Math.max(1, prev + delta));
  };

  const handleBudgetChange = (e) => {
    const v = Number(e.target.value);
    // 숫자 아닌 입력 방어
    setBudget(Number.isFinite(v) ? v : 0);
  };

  const handleSubmit = () => {
    // ✅ 클램프 후 저장
    const clampedPeople = Math.max(1, Number(people) || 1);
    const clampedBudget = Math.min(
      maxBudget,
      Math.max(minBudget, Number(budget) || 0)
    );

    savePeople(clampedPeople);
    saveBudget(clampedBudget);

    navigate('/plan/cart');
  };

  const perPerson = people > 0 ? Math.round((Number(budget) || 0) / people) : 0;

  const submitDisabled =
    !Number.isFinite(budget) ||
    budget < minBudget ||
    budget > maxBudget ||
    people < 1;

  return (
    <DefaultLayout>
      <div className="w-full max-w-sm mx-auto">
        <BackHeader title={`${locationIds[0] || '어딘가로'} 여행`} />
        <div className="px-4">
          <div className="mt-6 space-y-6">
            {/* 인원 수 */}
            <div>
              <p className="text-sm font-semibold text-gray-800 mb-2">
                여행 인원
              </p>
              <div className="flex items-center justify-between bg-gray-100 rounded-lg px-4 py-2 w-full">
                <button
                  onClick={() => handlePeopleChange(-1)}
                  className="text-lg font-bold text-gray-600"
                >
                  -
                </button>
                <span className="text-md font-semibold text-gray-800">
                  {people}
                </span>
                <button
                  onClick={() => handlePeopleChange(1)}
                  className="text-lg font-bold text-gray-600"
                >
                  +
                </button>
              </div>
            </div>

            {/* 예산 설정 */}
            <div>
              <p className="text-sm font-semibold text-gray-800 mb-2">
                예산 설정
              </p>
              <div className="relative">
                <input
                  type="number"
                  min={minBudget}
                  max={maxBudget}
                  step={1000}
                  value={budget}
                  onChange={handleBudgetChange}
                  placeholder="예산을 입력하세요"
                  className="w-full bg-gray-100 rounded-lg px-4 py-2 pl-10 text-center text-base font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <span className="absolute left-3 top-2.5 text-gray-500 text-sm">
                  ₩
                </span>
              </div>
              <p className="mt-1 text-[11px] text-gray-400">
                최소 {minBudget.toLocaleString()}원 ~ 최대{' '}
                {maxBudget.toLocaleString()}원
              </p>
            </div>

            {/* 인당 예산 안내 */}
            <p className="text-xs text-gray-500 text-center">
              위처럼 설정하실 경우 1인 당 예산은 <br />약{' '}
              <span className="text-blue-600 font-semibold text-sm">
                {perPerson.toLocaleString()}원
              </span>
              입니다.
            </p>
          </div>

          <PrimaryButton
            onClick={handleSubmit}
            disabled={submitDisabled}
            className="mt-10 w-full disabled:opacity-50"
          >
            예산 설정 완료
          </PrimaryButton>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default PlanBudgetPage;
