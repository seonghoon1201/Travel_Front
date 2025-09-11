// src/pages/InviteAcceptPage.jsx
import React, { useEffect, useState } from 'react';
import {
  useParams,
  useSearchParams,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import { Modal, message } from 'antd';
import DefaultLayout from '../layouts/DefaultLayout';
import useUserStore from '../store/userStore';
import { joinSchedule } from '../api';

const InviteAcceptPage = () => {
  const { scheduleId: scheduleIdParam } = useParams();
  const [params] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const isLoggedIn = useUserStore((s) => s.isLoggedIn);
  // ❌ userId 의존 제거: const userId = useUserStore((s) => s.userId);

  const [visible, setVisible] = useState(false);
  const scheduleId = scheduleIdParam || params.get('scheduleId');
  const currentInviteUrl = scheduleId ? `/invite/${scheduleId}` : '/invite';

  useEffect(() => {
    if (!scheduleId) {
      message.error('잘못된 초대 링크입니다.');
      navigate('/', { replace: true });
      return;
    }

    // 로그인 필요: redirect + localStorage 백업
    if (!isLoggedIn) {
      const redirect = `${location.pathname}${location.search}`;
      localStorage.setItem(
        'pendingScheduleInvite',
        JSON.stringify({ scheduleId, redirect, ts: Date.now() })
      );
      message.info('로그인이 필요합니다.');
      navigate(`/login?redirect=${encodeURIComponent(redirect)}`, {
        replace: true,
      });
      return;
    }

    // ✅ 로그인만 됐으면 모달 오픈 (userId 기다리지 않음)
    setVisible(true);
  }, [scheduleId, isLoggedIn, navigate, location.pathname, location.search]);

  const onConfirm = async () => {
    try {
      await joinSchedule(scheduleId); // 인증 axios(토큰 포함) 사용 필수
      message.success('초대를 수락했어요! 마이페이지로 이동합니다.');
      localStorage.removeItem('pendingScheduleInvite');
      navigate('/mypage', { replace: true });
    } catch (e) {
      console.error(e);
      message.error(e?.response?.data?.message || '초대 수락에 실패했어요.');
    } finally {
      setVisible(false);
    }
  };

  const onCancel = () => {
    setVisible(false);
    navigate('/', { replace: true });
  };

  return (
    <DefaultLayout>
      <Modal
        open={visible}
        title="초대를 수락하시겠어요?"
        onOk={onConfirm}
        onCancel={onCancel}
        okText="확인"
        cancelText="취소"
        destroyOnClose
        maskClosable={false}
        okButtonProps={{
          type: 'primary',
          className: 'bg-blue-600 hover:bg-blue-600/90 text-white',
          style: { backgroundColor: '#1677ff', borderColor: '#1677ff' }, // 버튼 흰색 이슈 방지
        }}
      >
        <div className="text-sm text-gray-600">
          이 일정에 참여자로 추가됩니다.
        </div>
      </Modal>
    </DefaultLayout>
  );
};

export default InviteAcceptPage;
