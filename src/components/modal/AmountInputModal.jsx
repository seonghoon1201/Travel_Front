import React, { useEffect, useState } from 'react';
import { Modal, InputNumber, message } from 'antd';
import PrimaryButton from '../common/PrimaryButton';

const AmountInputModal = ({ visible, onClose, onSubmit, place }) => {
  const [amount, setAmount] = useState(
    Number.isFinite(Number(place?.price)) ? Number(place.price) : 0
  );

  // place/visible 변경 시 금액 초기화
  useEffect(() => {
    setAmount(Number.isFinite(Number(place?.price)) ? Number(place.price) : 0);
  }, [place, visible]);

  const handleOk = () => {
    let num = Number(amount);

    // ✅ 빈값/NaN/음수 방어 — 0은 허용!
    if (!Number.isFinite(num)) {
      message.warning('금액을 입력해 주세요.');
      return;
    }
    if (num < 0) {
      num = 0;
    }

    onSubmit({
      ...place,
      price: num,
      cost: num, // 서버/스토어 호환을 위해 cost도 함께 전달
    });
    onClose();
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      centered
      title={`${place?.name ?? ''}에서 사용할 금액`}
    >
      <div className="flex flex-col items-center gap-4">
        <InputNumber
          min={0}
          value={amount}
          onChange={(value) => setAmount(value)}
          className="w-full"
          // ₩ 1,234 형태로 표시
          formatter={(val) =>
            `₩ ${String(val ?? '')}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
          }
          // 입력값을 숫자만 추출
          parser={(val) => (val ? val.replace(/[^\d.]/g, '') : '')}
          inputMode="decimal"
        />
        <PrimaryButton onClick={handleOk} className="w-full">
          확인
        </PrimaryButton>
      </div>
    </Modal>
  );
};

export default AmountInputModal;
