// src/components/plan/PlanFlowBoundary.jsx
import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import usePlanStore from '../../store/planStore';

export default function PlanFlowBoundary() {
  const { pathname } = useLocation();

  const startNewPlanSession = usePlanStore((s) => s.startNewPlanSession);
  const endPlanSession = usePlanStore((s) => s.endPlanSession);

  // 세션 활성 여부(스토어 구현에 따라 isPlanning 또는 sessionId 사용)
  const isPlanning = usePlanStore((s) => s.isPlanning);
  const sessionId = usePlanStore((s) => s.sessionId);
  const hasSession =
    typeof isPlanning === 'boolean' ? isPlanning : Boolean(sessionId);

  // 중복 호출 방지
  const inFlight = useRef(false);

  useEffect(() => {
    const inPlan = pathname.startsWith('/plan');

    if (inPlan) {
      // 1) /plan/location 진입 시: 항상 새 세션 시작
      // 2) 다른 /plan/* 진입 시: 세션이 없으면 보정해서 시작
      const mustStart = pathname === '/plan/location' || !hasSession;

      if (
        mustStart &&
        typeof startNewPlanSession === 'function' &&
        !inFlight.current
      ) {
        inFlight.current = true;
        Promise.resolve(startNewPlanSession())
          .catch(() => {})
          .finally(() => {
            inFlight.current = false;
          });
      }
    } else {
      // 플로우 밖으로 나가면 세션 정리
      if (
        hasSession &&
        typeof endPlanSession === 'function' &&
        !inFlight.current
      ) {
        inFlight.current = true;
        Promise.resolve(endPlanSession())
          .catch(() => {})
          .finally(() => {
            inFlight.current = false;
          });
      }
    }
  }, [pathname, hasSession, startNewPlanSession, endPlanSession]);

  return <Outlet />;
}
