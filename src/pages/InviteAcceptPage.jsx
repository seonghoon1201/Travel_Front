import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { GroupAPI } from '../api';
import { message } from 'antd';
import usePlanStore from '../store/planStore';
import useUserStore from '../store/userStore'; // userId, username

const InviteAcceptPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const setGroupId = usePlanStore((s) => s.setGroupId);
  const setGroupName = usePlanStore((s) => s.setGroupName);
  const userId = useUserStore((s) => s.userId);

  const groupId = params.get('groupId');
  const groupName = params.get('groupName');

  const [status, setStatus] = useState('초대 확인 중...');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        if (!groupId || !userId) {
          if (!cancelled) setStatus('필요한 정보가 부족합니다.');
          return;
        }
        await GroupAPI.addMember(groupId, userId);
        if (cancelled) return;

        setGroupId(groupId);
        if (groupName) setGroupName(groupName);
        setStatus('그룹에 참여되었습니다!');
        navigate('/plan/invite', { replace: true });
      } catch (e) {
        console.error(e);
        message.error('초대 수락에 실패했어요.');
        if (!cancelled) setStatus('초대 수락 실패');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [groupId, groupName, userId, navigate, setGroupId, setGroupName]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-sm text-gray-700">{status}</div>
    </div>
  );
};

export default InviteAcceptPage;
