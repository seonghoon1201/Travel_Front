// src/pages/Plan/PlanBudgetPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DefaultLayout from '../../layouts/DefaultLayout';
import BackHeader from '../../components/header/BackHeader';
import PrimaryButton from '../../components/common/PrimaryButton';
import usePlanStore from '../../store/planStore';

// 같은 세션인지 확인 (sessionStorage.planSessionId ↔ store.planSessionId)
const isSamePlanSession = () => {
  const ss = sessionStorage.getItem('planSessionId');
  const { inPlanFlow, planSessionId } = usePlanStore.getState();
  return inPlanFlow && ss && String(ss) === String(planSessionId);
};

const PlanBudgetPage = () => {
  const navigate = useNavigate();

  const storePeople = usePlanStore((s) => s.people);
  const storeBudget = usePlanStore((s) => s.budget);
  const savePeople = usePlanStore((s) => s.setPeople);
  const saveBudget = usePlanStore((s) => s.setBudget);

  const [people, setPeople] = useState(1);
  const [budget, setBudget] = useState('');

  useEffect(() => {
    if (!isSamePlanSession()) return; // 새 시작이면 복원 스킵
    if (storePeople && Number(storePeople) > 0) setPeople(storePeople);
    if (Number.isFinite(storeBudget) && storeBudget >= 0)
      setBudget(storeBudget);
  }, [storePeople, storeBudget]);

  const minBudget = 0;
  const maxBudget = 10_000_000;

  const handlePeopleChange = (d) => setPeople((p) => Math.max(1, p + d));
  const handleBudgetChange = (e) => {
    let v = e.target.value.replace(/[^\d]/g, '');
    v = v.replace(/^0+(?=\d)/, '');
    setBudget(v);
  };

  const numBudget = Number(budget || 0);
  const submitDisabled =
    Number.isNaN(numBudget) ||
    numBudget < minBudget ||
    numBudget > maxBudget ||
    people < 1;

  const handleSubmit = () => {
    const clampedPeople = Math.max(1, Number(people) || 1);
    const clampedBudget = Math.min(maxBudget, Math.max(minBudget, numBudget));
    savePeople(clampedPeople);
    saveBudget(clampedBudget);
    try {
      const persisted = JSON.parse(localStorage.getItem('plan-store-v3'));
    } catch {}
    navigate('/plan/cart');
  };

  const perPerson = people > 0 ? Math.round(Number(budget || 0) / people) : 0;

  return (
    <DefaultLayout>
      <div className="w-full mx-auto pb-28">
        <BackHeader title={'예산 설정'} />
        <div className="px-4 sm:px-6 md:px-8">
          <div className="mt-6 space-y-6">
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

            <div>
              <p className="text-sm font-semibold text-gray-800 mb-2">
                예산 설정
              </p>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  value={budget}
                  onChange={handleBudgetChange}
                  onPaste={(e) => {
                    const text = (
                      e.clipboardData || window.clipboardData
                    ).getData('text');
                    if (/[^\d]/.test(text)) e.preventDefault(); // 숫자 아닌게 섞여있으면 붙여넣기 방지
                  }}
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

            <p className="text-xs text-gray-500 text-center">
              위처럼 설정하실 경우 1인 당 예산은 <br />
              <span className="text-blue-600 font-semibold text-sm">
                {perPerson.toLocaleString()}원
              </span>
              입니다.
            </p>
          </div>
        </div>
      </div>

      {/* 하단 고정 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur border-t footer-safe">
        <div className="mx-auto w-full px-4 sm:px-6 md:px-8 py-3">
          <PrimaryButton
            onClick={handleSubmit}
            disabled={submitDisabled}
            className="w-full disabled:opacity-50"
          >
            예산 설정 완료
          </PrimaryButton>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default PlanBudgetPage;
