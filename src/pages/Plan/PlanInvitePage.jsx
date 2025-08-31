import React, { useEffect, useMemo, useState } from 'react';
import DefaultLayout from '../../layouts/DefaultLayout';
import BackHeader from '../../components/header/BackHeader';
import PrimaryButton from '../../components/common/PrimaryButton';
import usePlanStore from '../../store/planStore';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { GroupAPI } from '../../api';
import { loadKakao } from '../../utils/kakao';
// 로그인 유저
import useUserStore from '../../store/userStore'; // userId, username 있다고 가정

const APP_ORIGIN =
  (typeof import.meta !== 'undefined' &&
    import.meta.env &&
    import.meta.env.VITE_APP_ORIGIN) ||
  process.env.REACT_APP_APP_ORIGIN ||
  window.location.origin;

const PlanInvitePage = () => {
  const navigate = useNavigate();

  const locationIds = usePlanStore((s) => s.locationIds);
  const groupId = usePlanStore((s) => s.groupId);
  const groupName = usePlanStore((s) => s.groupName);
  const setGroupId = usePlanStore((s) => s.setGroupId);
  const setGroupName = usePlanStore((s) => s.setGroupName);
  const invitees = usePlanStore((s) => s.invitees);
  const setInvitees = usePlanStore((s) => s.setInvitees);

  const userId = useUserStore((s) => s.userId);
  const username = useUserStore((s) => s.username);

  const [loading, setLoading] = useState(true);

  // 초대 링크: 토큰 없이 groupId만 전달(서버 스펙이 초대 토큰을 안 쓰므로)
  const inviteUrl = useMemo(() => {
    const params = new URLSearchParams({
      groupId: groupId || '',
      groupName: groupName || '',
    });
    return `${APP_ORIGIN}/invite?${params.toString()}`;
  }, [groupId, groupName]);

  async function fetchMembers(gid, setInviteesFn, myUserId) {
    try {
      const myGroup = await GroupAPI.getById(gid);
      const members = (myGroup?.users || [])
        .map((u) => ({
          userId: u.userId,
          username: u.username ?? u.userName ?? '',
        }))
        // ✅ 본인은 제외하고 '초대한 다른 사람'만 상태에 보관
        .filter((u) => String(u.userId) !== String(myUserId));
      setInviteesFn(members);
    } catch (e) {
      console.error(e);
    }
  }

  // 그룹 생성(or 재사용) + 멤버 목록 폴링
  useEffect(() => {
    let poll;
    (async () => {
      try {
        // 1) 그룹 준비
        let gid = groupId;
        if (!gid) {
          const bodyName = groupName || `${username || '나'}의 여행 그룹`;
          const { groupId: createdId } = await GroupAPI.create(bodyName);
          gid = createdId;
          // 혹시 /group/create 응답에 groupId가 없으면, 목록에서 동일 이름 최신 항목을 잡는 폴백
          if (!gid) {
            const list = await GroupAPI.list();
            gid = list.find((g) => g.groupName === bodyName)?.groupId;
          }
          if (!gid) throw new Error('그룹 생성 응답에 groupId가 없습니다.');
          setGroupId(gid);
          if (!groupName) setGroupName(bodyName);
        }

        // 2) 멤버 1회 조회
        await fetchMembers(gid, setInvitees, userId);

        // 3) 폴링(5초)
        poll = setInterval(() => fetchMembers(gid, setInvitees, userId), 5000);
      } catch (e) {
        console.error(e);
        message.error('초대 준비 중 오류가 발생했어요.');
      } finally {
        setLoading(false);
      }
    })();
    return () => poll && clearInterval(poll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCopyLink = async () => {
    if (!groupId) {
      message.warning('그룹이 아직 준비되지 않았어요.');
      return;
    }
    try {
      await navigator.clipboard.writeText(inviteUrl);
      message.success('초대 링크가 복사되었습니다!');
    } catch {
      message.warning('복사에 실패했어요. 브라우저 권한을 확인해주세요.');
    }
  };

  const handleKakaoInvite = async () => {
    if (!groupId) return message.warning('그룹이 아직 준비되지 않았어요.');
    try {
      const Kakao = await loadKakao();
      Kakao.Share.sendDefault({
        objectType: 'text',
        text: `[${groupName}] 여행 일정에 함께할래요? 아래 버튼으로 참여해주세요!`,
        link: { mobileWebUrl: inviteUrl, webUrl: inviteUrl },
        buttons: [
          {
            title: '참여하기',
            link: { mobileWebUrl: inviteUrl, webUrl: inviteUrl },
          },
        ],
      });
    } catch (e) {
      console.error(e);
      message.error('카카오 공유에 실패했어요. 키/도메인 설정을 확인해주세요.');
    }
  };

  const handleNext = () => navigate('/plan/budget');

  return (
    <DefaultLayout>
      <div className="w-full max-w-sm mx-auto pb-28">
        <BackHeader title={`${locationIds?.[0] || groupName || '여행'} 초대`} />
        <div className="px-4">
          <div className="mt-6">
            <p className="font-semibold text-md text-gray-900">
              여행 친구 {invitees?.length ?? 0}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              함께 여행을 갈 친구나 가족을 초대해보세요. <br />
              여행 일정을 함께 계획할 수 있습니다.
            </p>

            <div className="flex gap-2 mb-6">
              <button
                onClick={handleKakaoInvite}
                disabled={loading || !groupId || !inviteUrl}
                className="flex-1 bg-yellow-300 text-black font-medium py-2 rounded-xl text-sm disabled:opacity-50"
              >
                🗨️ 카카오톡 초대
              </button>
              <button
                onClick={handleCopyLink}
                disabled={loading || !groupId || !inviteUrl}
                className="flex-1 bg-blue-100 text-blue-700 font-medium py-2 rounded-xl text-sm disabled:opacity-50"
              >
                🔗 초대 링크 복사
              </button>
            </div>

            <div className="border-t pt-4">
              {(invitees || []).map((u) => (
                <div key={u.userId} className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs">
                    {(u.username ?? u.userName ?? '친')?.[0] || '친'}
                  </div>
                  <span className="text-sm">{u.username ?? u.userName}</span>
                </div>
              ))}
              {!invitees?.length && !loading && (
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
