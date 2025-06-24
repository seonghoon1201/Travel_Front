import React from "react";
import { KeyRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BackHeader from "../../components/header/BackHeader";
import PrimaryButton from "../../components/common/PrimaryButton";
import DefaultLayout from "../../layouts/DefaultLayout";

const VerifyCodePage = () => {
  const navigate = useNavigate();

  const handleSubmit = () => {
    console.log("인증 코드 확인");
    navigate("/reset-password");
  };

  return (
    <DefaultLayout>
        <BackHeader title="비밀번호 찾기" />

        <div className="text-center mt-6 mb-6">
          <h2 className="text-lg font-bold mb-2">인증 코드 입력</h2>
          <p className="text-sm text-gray-600">
            입력하신 이메일 주소로 인증코드를 전송했습니다.
            <br />
            인증코드를 입력하여 본인 확인을 완료해주세요.
          </p>
        </div>

        <div className="mb-4 relative">
          <input
            type="text"
            placeholder="인증코드를 입력해 주세요."
            className="w-full px-10 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>

        <PrimaryButton onClick={handleSubmit}>다음</PrimaryButton>
      </DefaultLayout>
  );
};

export default VerifyCodePage;
