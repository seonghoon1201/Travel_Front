import React from 'react';
import BackHeader from '../components/header/BackHeader';
import PrimaryButton from '../components/common/PrimaryButton';
import { Pencil, X } from 'lucide-react';
import useUserStore from '../store/userStore';
import profileDefault from '../assets/profile_default.png';

const EditProfile = () => {
  const nickname = useUserStore((state) => state.nickname);
  const profileImageUrl = useUserStore((state) => state.profileImageUrl);

  return (
    <div className="bg-background min-h-screen flex w-full justify-center px-4">
      <div className="w-full max-w-sm py-6 overflow-y-auto">
        <BackHeader title="프로필 편집" />

        <div className="flex flex-col items-center">
          {/* 프로필 이미지 */}
          <div className="relative mt-6">
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 overflow-hidden">
              <img
                src={profileImageUrl || profileDefault}
                alt="프로필 이미지"
                className="w-full h-full object-cover"
              />
            </div>

            <button className="absolute top-0 right-0 bg-white rounded-full p-1 shadow">
              <Pencil className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* 닉네임 입력 필드 */}
          <div className="w-full relative mt-6">
            <input
              type="text"
              value={nickname}
              // onChange={(e) => setNickname(e.target.value)}
              placeholder="닉네임을 입력하세요"
              className="w-full border-b border-gray-300 py-2 text-center text-lg font-semibold bg-transparent focus:outline-none"
            />
            {nickname && (
              <button
                className="absolute right-0 top-1/2 transform -translate-y-1/2 pr-2"
                // onClick={() => setNickname('')}
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>

          <PrimaryButton
            className="w-full m-4"
            //  onClick={handleUpdate}
          >
            닉네임 변경
          </PrimaryButton>

          <p className="mt-4 text-xs text-gray-400 text-center leading-relaxed">
            유효성에 따라 닉네임 변경
            <br />
            한글/영어/숫자를 사용할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
