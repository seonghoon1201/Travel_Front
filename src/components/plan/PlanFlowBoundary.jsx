// src/components/plan/PlanFlowBoundary.jsx
import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import usePlanStore from '../../store/planStore';

const SS_KEY = 'planSessionId';

export default function PlanFlowBoundary() {
  const { pathname } = useLocation();

  // store actions
  const beginNewPlanSession = usePlanStore((s) => s.beginNewPlanSession);
  const beginPlanFlow = usePlanStore((s) => s.beginPlanFlow);
  const endPlanFlow = usePlanStore((s) => s.endPlanFlow);

  // store state
  const inPlanFlow = usePlanStore((s) => s.inPlanFlow);
  const planSessionId = usePlanStore((s) => s.planSessionId);

  // 이전 경로가 plan 내부였는지 추적
  const wasInPlanRef = useRef(false);

  // 중복 실행 방지
  const inFlight = useRef(false);

  useEffect(() => {
    const inPlan = pathname.startsWith('/plan');
    const onLocation = pathname === '/plan/location';

    const ssId = sessionStorage.getItem(SS_KEY);
    const storeId = planSessionId ? String(planSessionId) : '';

    if (inPlan) {
      // 플로우 진입: beginPlanFlow는 1회만 호출
      if (!inPlanFlow && typeof beginPlanFlow === 'function') {
        beginPlanFlow();
      }

      // ▷ 조건: 아래 중 하나면 "새 세션" 시작
      //   1) /plan/location 으로 들어옴 (처음 화면에서 항상 새로 시작)
      //   2) 세션 스토리지에 기존 세션ID가 없음(= 플로우 밖에서 재진입)
      //   3) 세션 스토리지와 store의 세션ID가 불일치
      const needNewSession =
        onLocation || !ssId || (storeId && ssId !== storeId);

      if (
        needNewSession &&
        typeof beginNewPlanSession === 'function' &&
        !inFlight.current
      ) {
        inFlight.current = true;
         Promise.resolve(
          beginNewPlanSession({ location: false, regionMeta: false })
        )
          .catch(() => {})
          .finally(() => {
            // 새로 부여된 store의 planSessionId를 세션스토리지에 기록
            const newId = String(
              usePlanStore.getState().planSessionId || Date.now()
            );
            try {
              sessionStorage.setItem(SS_KEY, newId);
            } catch {}
            inFlight.current = false;
          });
      } else {
        // 세션이 유효하면 세션스토리지 동기화(초기 진입 직후 등)
        if (!ssId && storeId) {
          try {
            sessionStorage.setItem(SS_KEY, storeId);
          } catch {}
        }
      }
    } else {
      // 플로우 밖으로 나감: 플래그 해제 + "세션ID 삭제"(다음 진입 시 새 세션)
      if (typeof endPlanFlow === 'function' && !inFlight.current) {
        inFlight.current = true;
        Promise.resolve(endPlanFlow())
          .catch(() => {})
          .finally(() => {
            try {
              sessionStorage.removeItem(SS_KEY);
            } catch {}
            inFlight.current = false;
          });
      }
    }

    wasInPlanRef.current = inPlan;
  }, [
    pathname,
    inPlanFlow,
    planSessionId,
    beginNewPlanSession,
    beginPlanFlow,
    endPlanFlow,
  ]);

  return <Outlet />;
}
