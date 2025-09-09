import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { GroupAPI } from '../api';
import { message } from 'antd';
import usePlanStore from '../store/planStore';
import useUserStore from '../store/userStore';

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
        console.log('=== 초대 디버깅 ===');
        console.log('groupId:', groupId);
        console.log('groupName:', groupName);
        console.log('userId:', userId);
        console.log('userStore 전체 상태:', useUserStore.getState());

        if (!groupId) {
          console.log('❌ groupId 없음 - 잘못된 링크');
          if (!cancelled) setStatus('잘못된 초대 링크입니다.');
          return;
        }

        if (!userId) {
          console.log('❌ userId 없음 - 로그인 필요');
          
          // 🔥 초대 정보를 localStorage에 임시 저장
          const inviteData = {
            groupId,
            groupName: groupName || '',
            timestamp: Date.now()
          };
          localStorage.setItem('pendingInvite', JSON.stringify(inviteData));
          
          if (!cancelled) setStatus('로그인이 필요합니다. 로그인 후 자동으로 그룹에 참여됩니다.');
          setTimeout(() => {
            navigate('/login');
          }, 2000);
          return;
        }

        console.log('✅ 모든 정보 확인 완료 - API 호출 시작');
        await GroupAPI.addMember(groupId, userId);
        
        if (cancelled) return;

        console.log('✅ 그룹 참여 성공');
        setGroupId(groupId);
        if (groupName) setGroupName(groupName);
        
        // 🔥 성공한 초대 정보 삭제
        localStorage.removeItem('pendingInvite');
        
        setStatus('그룹에 참여되었습니다!');
        
        console.log('🔄 /plan/invite로 이동');
        setTimeout(() => {
          navigate('/plan/invite', { replace: true });
        }, 1500);
        
      } catch (e) {
        console.error('❌ 초대 수락 에러:', e);
        console.error('에러 상세:', e.response?.data || e.message);
        
        // 🔥 에러시 초대 정보 삭제
        localStorage.removeItem('pendingInvite');
        
        message.error('초대 수락에 실패했어요.');
        if (!cancelled) setStatus('초대 수락 실패');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [groupId, groupName, userId, navigate, setGroupId, setGroupName]);

  // 🔥 로그인 완료 후 처리를 위한 추가 useEffect
  useEffect(() => {
    // userId가 새로 생겼을 때 (로그인 완료)
    if (userId && !groupId && !groupName) {
      const pendingInvite = localStorage.getItem('pendingInvite');
      if (pendingInvite) {
        try {
          const inviteData = JSON.parse(pendingInvite);
          
          // 1시간 이내의 초대만 유효
          if (Date.now() - inviteData.timestamp < 3600000) {
            console.log('🔄 로그인 후 초대 처리:', inviteData);
            
            // URL 파라미터 업데이트하여 다시 처리
            const newUrl = `/invite?groupId=${inviteData.groupId}&groupName=${encodeURIComponent(inviteData.groupName)}`;
            navigate(newUrl, { replace: true });
            return;
          }
        } catch (e) {
          console.error('pendingInvite 파싱 에러:', e);
        }
        
        // 잘못된/오래된 초대 정보 삭제
        localStorage.removeItem('pendingInvite');
      }
    }
  }, [userId, groupId, groupName, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-sm text-gray-700 mb-4">{status}</div>
        <div className="text-xs text-gray-500 space-y-1">
          <div>Group ID: {groupId || '없음'}</div>
          <div>User ID: {userId || '없음'}</div>
          <div>Group Name: {groupName || '없음'}</div>
        </div>
      </div>
    </div>
  );
};

export default InviteAcceptPage;