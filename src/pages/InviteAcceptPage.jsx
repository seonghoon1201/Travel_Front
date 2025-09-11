import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Modal, message } from 'antd';
import useUserStore from '../store/userStore';
import { joinSchedule } from '../api';

const InviteAcceptPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const isLoggedIn = useUserStore((s) => s.isLoggedIn);

  const scheduleId = params.get('scheduleId');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!scheduleId) {
      message.error('잘못된 초대 링크입니다.');
      navigate('/', { replace: true });
      return;
    }
    // 로그인 필요
    if (!isLoggedIn) {
      // 로그인 후 돌아오도록 현재 URL 저장
      localStorage.setItem(
        'pendingScheduleInvite',
        JSON.stringify({ scheduleId, ts: Date.now() })
      );
      message.info('로그인이 필요합니다.');
      navigate('/login');
      return;
    }
    setVisible(true);
  }, [scheduleId, isLoggedIn, navigate]);

  const onConfirm = async () => {
    try {
      await joinSchedule(scheduleId);
      message.success('초대를 수락했어요! 마이페이지로 이동합니다.');
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
    >
      <div className="text-sm text-gray-600">
        이 일정에 참여자로 추가됩니다. (ID: {scheduleId})
      </div>
    </Modal>
  );
};

export default InviteAcceptPage;
