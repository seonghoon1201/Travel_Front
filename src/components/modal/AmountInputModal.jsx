import React, { useState } from 'react';
import { Modal, InputNumber } from 'antd';
import PrimaryButton from '../common/PrimaryButton';

const AmountInputModal = ({ visible, onClose, onSubmit, place }) => {
  const [amount, setAmount] = useState(place?.price || 0);

  const handleOk = () => {
    if (amount > 0) {
      onSubmit({ ...place, price: amount });
      onClose();
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      centered
      title={`${place?.name}에서 사용할 금액`}
    >
      <div className="flex flex-col items-center gap-4">
        <InputNumber
          min={0}
          value={amount}
          onChange={(value) => setAmount(value)}
          className="w-full"
          formatter={(val) => `₩ ${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
        />
        <PrimaryButton onClick={handleOk} className="w-full">
          확인
        </PrimaryButton>
      </div>
    </Modal>
  );
};

export default AmountInputModal;
