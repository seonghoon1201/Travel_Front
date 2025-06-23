import React, { useState } from "react";
import { LockKeyhole } from "lucide-react";
import BackHeader from "../../components/header/BackHeader";
import PrimaryButton from "../../components/common/PrimaryButton";

const ResetPasswordPage = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("비밀번호 재설정:", newPassword);
  };

  return (
    <div className="font-pretendard bg-background min-h-screen w-full flex flex-col items-center px-4">
      <div className="w-full max-w-sm py-6">
        <BackHeader title="비밀번호 재설정" />

        <div className="text-center mt-6 mb-6">
          <h2 className="text-lg font-bold mb-2">비밀번호 재설정</h2>
          <p className="text-sm text-gray-600">
            비밀번호는 8~20자의 영문, 숫자, 특수문자를 포함해야 합니다.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="password"
              placeholder="비밀번호 입력"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-10 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>

          <div className="relative">
            <input
              type="password"
              placeholder="비밀번호 확인"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-10 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>

          <PrimaryButton type="submit">비밀번호 변경</PrimaryButton>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
