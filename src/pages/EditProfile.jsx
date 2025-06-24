import React from 'react';
import BackHeader from '../components/header/BackHeader';
import PrimaryButton from '../components/common/PrimaryButton';
import { Pencil } from 'lucide-react';

const EditProfile = () => {
  return (
    <>
      <div className="bg-background min-h-screen flex w-full justify-center px-4">
        <div className="w-full max-w-sm py-6 overflow-y-auto">
          <BackHeader title="프로필 편집" />

          <div className="flex flex-col items-center">
            {/* 프로필 이미지 */}
            <div className="relative mt-6">
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-4xl">
                <img />
              </div>

              <button className="absolute top-0 right-0 bg-white rounded-full p-1 shadow">
                <Pencil className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <p className="mt-4 font-semibold text-lg">닉네임</p>

            <PrimaryButton className="w-full m-4">닉네임 변경</PrimaryButton>

            {/* 안내 문구 */}
            <p className="mt-4 text-xs text-gray-400 text-center leading-relaxed">
              유효성에 따라 닉네임 변경
              <br />
              한글/영어/숫자를 사용할 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditProfile;
