import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DefaultLayout from '../../layouts/DefaultLayout';
import BackHeader from '../../components/header/BackHeader';
import PrimaryButton from '../../components/common/PrimaryButton';
import usePlanStore from '../../store/planStore';

const PlanBudgetPage = () => {
  const navigate = useNavigate();
  const { locationIds, setPeople: savePeople, setBudget: saveBudget } = usePlanStore();

  const [people, setPeople] = useState(1);
  const [budget, setBudget] = useState(0);

  const minBudget = 0;
  const maxBudget = 10000000;

  const handlePeopleChange = (delta) => {
    setPeople((prev) => Math.max(1, prev + delta));
  };

  const handleBudgetChange = (e) => {
    setBudget(Number(e.target.value));
  };

  const handleSubmit = () => {
    savePeople(people);
    saveBudget(budget);
    navigate('/plan/cart');
  };

  return (
    <DefaultLayout>
      <div className="w-full max-w-sm mx-auto">
        <BackHeader title={`${locationIds[0] || '어딘가로'} 여행`} />

        <div className="mt-6 space-y-6">
          {/* 인원 수 */}
          <div>
            <p className="text-sm font-semibold text-gray-800 mb-2">여행 인원</p>
            <div className="flex items-center justify-between bg-gray-100 rounded-lg px-4 py-2 w-full">
              <button
                onClick={() => handlePeopleChange(-1)}
                className="text-lg font-bold text-gray-600"
              >
                -
              </button>
              <span className="text-md font-semibold text-gray-800">{people}</span>
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
            <p className="text-sm font-semibold text-gray-800 mb-2">예산 설정</p>
            <div className="bg-gray-100 rounded-lg px-4 py-2 text-center text-sm">
              {budget.toLocaleString()}원
            </div>
            <input
              type="range"
              min={minBudget}
              max={maxBudget}
              step={5000}
              value={budget}
              onChange={handleBudgetChange}
              className="w-full mt-4"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>최저 {minBudget.toLocaleString()}원</span>
              <span>최고 {maxBudget.toLocaleString()}원</span>
            </div>
          </div>

          {/* 인당 예산 안내 */}
          <p className="text-xs text-gray-500 text-center">
            위처럼 설정하실 경우 1인 당 예산은 <br />
            약 {(budget / people).toLocaleString()}원입니다.
          </p>
        </div>

        <PrimaryButton onClick={handleSubmit} className="mt-10 w-full">
          예산 설정 완료
        </PrimaryButton>
      </div>
    </DefaultLayout>
  );
};

export default PlanBudgetPage;
