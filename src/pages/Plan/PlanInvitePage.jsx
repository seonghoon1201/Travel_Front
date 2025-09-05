// src/pages/Plan/PlanInvitePage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import DefaultLayout from '../../layouts/DefaultLayout';
import BackHeader from '../../components/header/BackHeader';
import PrimaryButton from '../../components/common/PrimaryButton';
import usePlanStore from '../../store/planStore';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { GroupAPI } from '../../api';
import { loadKakao } from '../../utils/kakao';
import useUserStore from '../../store/userStore';

const APP_ORIGIN = process.env.REACT_APP_APP_ORIGIN || window.location.origin; // 없으면 현재 Origin 사용

const PlanInvitePage = () => {
  const navigate = useNavigate();

  // 1) 로그인 유저
  const userId = useUserStore((s) => s.userId);
  const username = useUserStore((s) => s.username);

  // 2) 플랜 스토어
  const locationIds = usePlanStore((s) => s.locationIds);
  const groupId = usePlanStore((s) => s.groupId);
  const groupName = usePlanStore((s) => s.groupName);
  const setGroupId = usePlanStore((s) => s.setGroupId);
  const setGroupName = usePlanStore((s) => s.setGroupName);
  const invitees = usePlanStore((s) => s.invitees);
  const setInvitees = usePlanStore((s) => s.setInvitees);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false); // 클릭 중 보호

  // 날짜 포맷터: 'YYYY-MM-DD' → 'YYYY.MM.DD'
  const fmt = (d) => {
    if (!d) return '';
    const [y, m, dd] = String(d).split('-');
    if (!y || !m || !dd) return String(d);
    return `${y}.${m}.${dd}`;
  };

  // 절대 URL 보장 (카카오 템플릿 이미지는 https 접근 가능해야 함)
  const toAbsUrl = (pathOrUrl) => {
    if (!pathOrUrl) return '';
    let url = String(pathOrUrl).trim();
    // 어떤 절대 URL이 와도 http는 https로 강제
    url = url.replace(/^http:\/\//i, 'https://');
    if (/^https:\/\//i.test(url)) return url;
    const p = url.startsWith('/') ? url : `/${url}`;
    return `${window.location.origin}${p}`.replace(/^http:\/\//i, 'https://');
  };

  // 본인 제외 멤버
  const others = useMemo(() => {
    const myId = String(userId || '');
    const myName = String(username || '');
    return (invitees || []).filter((u) => {
      const uid = String(u?.userId || '');
      const uname = String(u?.username || u?.userName || '');
      const notMeById = myId ? uid !== myId : true;
      const notMeByName = myName ? uname !== myName : true;
      return notMeById && notMeByName;
    });
  }, [invitees, userId, username]);
  const isSolo = others.length === 0;

  // 초대 링크 생성기 (gid 인자로 받아 사용)
  const makeInviteUrl = (gid, gname) => {
    const params = new URLSearchParams({
      groupId: String(gid),
      groupName: String(gname || ''), // 이제 빈 값 안 나옴
    });
    return `${window.location.origin}/invite?${params.toString()}`;
  };

  async function fetchMembers(gid) {
    if (!gid) return;
    try {
      const myGroup = await GroupAPI.getById(gid);
      const members = (myGroup?.users || []).map((u) => ({
        userId: u.userId,
        username: u.username ?? u.userName ?? '',
      }));
      setInvitees(members);
    } catch (e) {
      console.error(e);
    }
  }

  // 그룹 보장 유틸: 없으면 만들고 반환
  const ensureGroupReady = async () => {
    let gid = groupId;
    let gname = groupName;

    if (!gid) {
      const bodyName = gname || `${username || '나'}의 여행 그룹`;
      const created = await GroupAPI.create(bodyName);

      // 응답에서 최대한 id 뽑기
      gid = String(
        created?.groupId ??
          created?.id ??
          created?.data?.groupId ??
          created?.data?.id ??
          ''
      );
      gname = bodyName;

      // ⚠️ 폴백: 생성 응답에 id가 없으면 목록에서 이름으로 찾기
      if (!gid) {
        try {
          const list = await GroupAPI.list();
          const hit = list.find((g) => g.groupName === bodyName);
          gid = String(hit?.groupId ?? hit?.id ?? '');
        } catch (e) {
          console.debug('[ensureGroupReady] fallback list() failed', e);
        }
      }

      if (!gid) {
        console.error(
          '[ensureGroupReady] create failed or missing id',
          created
        );
        throw new Error('그룹 생성 실패');
      }

      setGroupId(gid);
      setGroupName(gname);
    }

    return { gid: String(gid), gname: String(gname || '') };
  };

  // 초기: 유저 정보가 있으면 그룹을 미리 만들고(실패해도 무시), 폴링은 gid 있을 때만
  useEffect(() => {
    let poll;
    (async () => {
      if (!userId && !username) {
        setLoading(false);
        return;
      }
      try {
        // 미리 시도 (실패해도 클릭시 다시 보장함)
        try {
          await ensureGroupReady();
        } catch (_) {}
        // 첫 멤버 조회
        if (groupId) await fetchMembers(groupId);
        // gid 있을 때만 폴링
        if (groupId) {
          poll = setInterval(() => fetchMembers(groupId), 5000);
        }
      } finally {
        setLoading(false);
      }
    })();
    return () => poll && clearInterval(poll);
    // groupId 바뀌면 폴링 재설정
  }, [groupId, userId, username]); // eslint-disable-line

  const handleCopyLink = async () => {
    try {
      setBusy(true);
      const { gid, gname } = await ensureGroupReady();
      const url = makeInviteUrl(gid, gname);

      await navigator.clipboard.writeText(url);
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
      const { gid, gname } = await ensureGroupReady();
      const url = makeInviteUrl(gid, gname);

      const Kakao = await loadKakao();
      const TEMPLATE_ID = Number(
        process.env.REACT_APP_KAKAO_TEMPLATE_ID ||
          import.meta?.env?.VITE_KAKAO_TEMPLATE_ID
      );
      if (!TEMPLATE_ID) throw new Error('KAKAO_TEMPLATE_ID 누락');
      // ① 제목,  ② 날짜 구간: planStore의 startDate/endDate 사용
      // ✅ 선택 지역명이 있으면 "OO 여행"
      const { selectedRegionName, selectedRegionImage, startDate, endDate } =
        usePlanStore.getState();
      const planTitle = selectedRegionName
        ? `${selectedRegionName} 여행`
        : groupName || '여행 플랜';
      const dateRange =
        startDate && endDate ? `${fmt(startDate)} - ${fmt(endDate)}` : '';
      // ③ 썸네일: 커버 이미지가 있으면 사용, 없으면 앱 로고로 대체
      // ✅ 선택 지역 이미지가 우선, 없으면 기존 coverImage → 앱 로고
      const coverImage = usePlanStore.getState()?.coverImage;
      const thumb = selectedRegionImage
        ? toAbsUrl(selectedRegionImage)
        : coverImage
        ? toAbsUrl(coverImage)
        : toAbsUrl('assets/logo.png');

      Kakao.Share.sendCustom({
        templateId: TEMPLATE_ID,
        templateArgs: {
          USERNAME: username || '친구',
          PLAN_TITLE: planTitle,
          PLAN_DATE_RANGE: dateRange,
          THUMB_URL: thumb,
          INVITE_URL: url,
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

  const handleNext = () => {
    if (isSolo) {
      // 본인 제외 멤버가 0 → 개인 일정으로 전환
      setGroupId('');
      setGroupName('');
    }
    navigate('/plan/budget');
  };

  return (
    <DefaultLayout>
      <div className="w-full max-w-sm mx-auto pb-28">
        <BackHeader title={'친구 초대'} />
        <div className="px-4">
          <div className="mt-6">
            <p className="font-semibold text-md text-gray-900">
              여행 친구 {others.length}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              함께 여행을 갈 친구나 가족을 초대해보세요. <br />
              여행 일정을 함께 계획할 수 있습니다.
            </p>

            <div className="flex gap-2 mb-6">
              {/* ✅ 로딩/클릭중에만 잠금. groupId 유무로 비활성화하지 않음 */}
              <button
                onClick={handleKakaoInvite}
                disabled={loading || busy}
                className="flex-1 bg-yellow-300 text-black font-medium py-2 rounded-xl text-sm disabled:opacity-50"
              >
                🗨️ 카카오톡 초대
              </button>
              <button
                onClick={handleCopyLink}
                disabled={loading || busy}
                className="flex-1 bg-blue-100 text-blue-700 font-medium py-2 rounded-xl text-sm disabled:opacity-50"
              >
                🔗 초대 링크 복사
              </button>
            </div>

            <div className="border-t pt-4">
              {others.map((u) => (
                <div
                  key={`${u.userId}-${u.username}`}
                  className="flex items-center gap-3 mb-3"
                >
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs">
                    {(u.username ?? u.userName ?? '친')?.[0] || '친'}
                  </div>
                  <span className="text-sm">{u.username ?? u.userName}</span>
                </div>
              ))}

              {!others.length && !loading && (
                <div className="text-xs text-gray-500">
                  아직 초대한 친구가 없어요.
                </div>
              )}
            </div>
          </div>

          <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur border-t">
            <div className="mx-auto max-w-sm px-4 py-3">
              <PrimaryButton onClick={handleNext} className="w-full">
                예산 설정하러 가기
              </PrimaryButton>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default PlanInvitePage;
