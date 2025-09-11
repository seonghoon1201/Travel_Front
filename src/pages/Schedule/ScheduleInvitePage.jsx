// src/pages/schedule/ScheduleInvitePage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import DefaultLayout from '../../layouts/DefaultLayout';
import BackHeader from '../../components/header/BackHeader';
import { message } from 'antd';
import { loadKakao } from '../../utils/kakao';
import useScheduleStore from '../../store/scheduleStore';
import usePlanStore from '../../store/planStore';
import { getSchedule } from '../../api';

const fmt = (d) => {
  if (!d) return '';
  const [y, m, dd] = String(d).split('-');
  if (!y || !m || !dd) return String(d);
  return `${y}.${m}.${dd}`;
};

const ScheduleInvitePage = () => {
  const { scheduleId } = useParams();
  const [busy, setBusy] = useState(false);

  // 스케줄 상세
  const detail = useScheduleStore((s) => s.detail);
  const setDetail = useScheduleStore((s) => s.setDetail);

  // detail 없을 때 제목 폴백
  const fallbackScheduleName = usePlanStore((s) => s.scheduleName);

  useEffect(() => {
    (async () => {
      try {
        if (String(detail?.scheduleId ?? detail?.id) === String(scheduleId))
          return;
        const res = await getSchedule(scheduleId);
        setDetail(res);
      } catch (e) {
        // 조용히 실패: 버튼 공유는 계속 가능
        console.debug(
          '[ScheduleInvitePage] load detail fail',
          e?.response?.data || e
        );
      }
    })();
  }, [scheduleId, detail?.scheduleId, detail?.id, setDetail]);

  // 제목/날짜
  const planTitle = detail?.scheduleName || fallbackScheduleName || '여행 일정';
  const dateRange =
    detail?.startDate && detail?.endDate
      ? `${fmt(detail.startDate)} - ${fmt(detail.endDate)}`
      : '여행 날짜 미정';

  // 초대 URL (표시는 하지 않음)
  const inviteUrl = useMemo(() => {
    const u = new URL(`${window.location.origin}/invite`);
    u.searchParams.set('scheduleId', String(scheduleId || ''));
    return u.toString();
  }, [scheduleId]);

  const handleCopyLink = async () => {
    try {
      setBusy(true);
      await navigator.clipboard.writeText(inviteUrl);
      message.success('초대 링크가 복사되었습니다! 카카오톡에 붙여넣어보세요.');
    } catch (e) {
      console.error(e);
      message.error('초대 링크 복사에 실패했어요.');
    } finally {
      setBusy(false);
    }
  };

  const handleKakaoInvite = async () => {
    try {
      setBusy(true);
      const Kakao = await loadKakao();
      const TEMPLATE_ID = Number(
        process.env.REACT_APP_KAKAO_TEMPLATE_ID ||
          import.meta?.env?.VITE_KAKAO_TEMPLATE_ID
      );
      if (!TEMPLATE_ID) throw new Error('KAKAO_TEMPLATE_ID 누락');

      Kakao.Share.sendCustom({
        templateId: TEMPLATE_ID,
        templateArgs: {
          USERNAME: '친구',
          PLAN_TITLE: planTitle,
          PLAN_DATE_RANGE: dateRange === '여행 날짜 미정' ? '' : dateRange,
          THUMB_URL: '', // 이미지 제거. 템플릿에 필수면 로고 등 공용 URL을 세팅하세요.
          INVITE_URL: inviteUrl,
        },
      });
    } catch (e) {
      console.error(e);
      message.error(
        '카카오 공유에 실패했어요. 키/도메인/템플릿 설정을 확인해주세요.'
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <DefaultLayout>
      <div className="w-full mx-auto pb-24">
        <BackHeader title="친구 초대" />

        <div className="px-4 sm:px-6 md:px-8">
          {/* 히어로: 이미지 없이 그라데이션 카드 */}
          <div className="mt-6 rounded-2xl overflow-hidden border shadow-sm">
            <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 p-5">
              <div className="flex items-start gap-3">
                {/* 심볼 */}
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-white text-xl shadow-sm">
                  ✈️
                </div>
                {/* 타이틀/날짜 */}
                <div className="min-w-0 flex-1">
                  <h1 className="text-white font-extrabold text-lg truncate drop-shadow-sm">
                    {planTitle}
                  </h1>
                  <p className="text-white/90 text-sm mt-1">{dateRange}</p>
                </div>
              </div>
            </div>

            {/* 액션 바 */}
            <div className="bg-white p-4">
              <div className="flex gap-2">
                <button
                  onClick={handleKakaoInvite}
                  disabled={busy}
                  className="flex-1 rounded-xl bg-yellow-300 hover:bg-yellow-300/90 text-black font-semibold py-2 text-sm disabled:opacity-50 transition"
                >
                  🗨️ 카카오톡으로 초대하기
                </button>
                <button
                  onClick={handleCopyLink}
                  disabled={busy}
                  className="flex-1 rounded-xl bg-blue-100 hover:bg-blue-100/80 text-blue-700 font-semibold py-2 text-sm disabled:opacity-50 transition"
                >
                  🔗 링크 복사하기
                </button>
              </div>
            </div>
          </div>

          {/* 가이드 섹션 */}
          <div className="mt-6 space-y-3 text-[13px] text-gray-700">
            <div className="flex gap-2 items-start">
              <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                1
              </span>
              <p>
                공유 받은 친구는 <b>초대 수락 페이지</b>에서 <b>확인</b>을
                누르면 이 일정의 <b>참여자</b>로 등록됩니다.
              </p>
            </div>
            <div className="flex gap-2 items-start">
              <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                2
              </span>
              <p>
                카카오 공유가 어려우면 <b>링크 복사</b>로 직접 전달하세요.
              </p>
            </div>
          </div>

          {/* 주의 문구 */}
          <div className="mt-6 rounded-xl border bg-amber-50 text-amber-800 text-xs p-3 leading-relaxed">
            * 링크가 노출되면 누구나 접근할 수 있으니 신뢰할 수 있는 상대에게만
            공유해주세요.
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default ScheduleInvitePage;
