// src/pages/InviteAcceptPage.jsx
import React, { useEffect, useState } from 'react';
import {
  useParams,
  useSearchParams,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import { Modal, message } from 'antd';
import useUserStore from '../store/userStore';
import { joinSchedule } from '../api';

const InviteAcceptPage = () => {
  const { scheduleId: scheduleIdParam } = useParams();
  const [params] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const isLoggedIn = useUserStore((s) => s.isLoggedIn);

  const [visible, setVisible] = useState(false);
  const scheduleId = scheduleIdParam || params.get('scheduleId');

  useEffect(() => {
    if (!scheduleId) {
      message.error('잘못된 초대 링크입니다.');
      navigate('/', { replace: true });
      return;
    }

    // 로그인 필요: redirect + localStorage 백업
    if (!isLoggedIn) {
      const redirect = `${location.pathname}${location.search}`;
      try {
        localStorage.setItem(
          'pendingScheduleInvite',
          JSON.stringify({ scheduleId, redirect, ts: Date.now() })
        );
      } catch {}
      message.info('로그인이 필요합니다.');
      navigate(`/login?redirect=${encodeURIComponent(redirect)}`, {
        replace: true,
      });
      return;
    }

    // 로그인 되어 있으면 모달 오픈
    setVisible(true);
  }, [scheduleId, isLoggedIn, navigate, location.pathname, location.search]);

  const onConfirm = async () => {
    try {
      await joinSchedule(scheduleId); // ← 인증 토큰 포함된 axios 인스턴스 사용
      message.success('초대를 수락했어요! 마이페이지로 이동합니다.');
      try {
        localStorage.removeItem('pendingScheduleInvite');
      } catch {}
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
  );
};

export default InviteAcceptPage;
