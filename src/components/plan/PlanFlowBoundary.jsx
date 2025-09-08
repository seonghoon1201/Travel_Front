// src/components/plan/PlanFlowBoundary.jsx
import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import usePlanStore from '../../store/planStore';

export default function PlanFlowBoundary() {
  const { pathname } = useLocation();

  // ✅ 스토어의 실제 키/액션으로 맞춤
  const startNewPlanSession = usePlanStore((s) => s.startNewPlanSession);
  const beginPlanFlow = usePlanStore((s) => s.beginPlanFlow);
  const endPlanFlow = usePlanStore((s) => s.endPlanFlow);

  const inPlanFlow = usePlanStore((s) => s.inPlanFlow);
  const planSessionId = usePlanStore((s) => s.planSessionId);

  const hasSession = Boolean(inPlanFlow || planSessionId);

  // 중복 호출 방지
  const inFlight = useRef(false);

  useEffect(() => {
    const inPlan = pathname.startsWith('/plan');

    if (inPlan) {
      // ✅ 플로우 표시(라우트 유지용). 이건 초기화 아님.
      if (typeof beginPlanFlow === 'function') {
        beginPlanFlow();
      }

      // ✅ "/plan/location"에 '처음' 진입할 때에만 세션 초기화 실행
      // 이미 세션이 있으면 다시 초기화하지 않음(예산 등 유지)
      const onLocation = pathname === '/plan/location';
      const mustStart = onLocation && !hasSession;

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
      // ✅ 플로우 밖으로 나가면 플로우 표시만 해제(데이터는 여기서 지우지 않음)
      if (
        hasSession &&
        typeof endPlanFlow === 'function' &&
        !inFlight.current
      ) {
        inFlight.current = true;
        Promise.resolve(endPlanFlow())
          .catch(() => {})
          .finally(() => {
            inFlight.current = false;
          });
      }
    }
  }, [pathname, hasSession, startNewPlanSession, beginPlanFlow, endPlanFlow]);

  return <Outlet />;
}
