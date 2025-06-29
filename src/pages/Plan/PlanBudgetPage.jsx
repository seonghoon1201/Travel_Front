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
                <span className="absolute left-3 top-2.5 text-gray-500 text-sm">₩</span>
              </div>
            </div>

          {/* 인당 예산 안내 */}
            <p className="text-xs text-gray-500 text-center">
              위처럼 설정하실 경우 1인 당 예산은 <br />
              약 <span className="text-blue-600 font-semibold text-sm">
                {(budget / people).toLocaleString()}원
              </span>
              입니다.
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
