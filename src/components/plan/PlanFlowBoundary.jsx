// src/components/plan/PlanFlowBoundary.jsx
import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import usePlanStore from '../../store/planStore';

export default function PlanFlowBoundary() {
  const location = useLocation();
  const startNewPlanSession = usePlanStore((s) => s.startNewPlanSession);
  const endPlanSession = usePlanStore((s) => s.endPlanSession);

  useEffect(() => {
    // 플로우 입장: /plan/location에서만 초기화 (새 일정 시작점)
    if (location.pathname === '/plan/location') {
      startNewPlanSession().catch(() => {});
    }
    return () => {
      // 플로우 이탈 시 전체 정리
      endPlanSession().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // boundary가 마운트/언마운트될 때만

  return <Outlet />;
}
