import React from 'react';
import defaultImage from '../../assets/profile_default.png';
import useUserStore from '../../store/userStore';

const ProfileSummary = () => {
  // 닉네임, 이미지
  const nickname = useUserStore((state) => state.nickname);
  const profileImageUrl = useUserStore((state) => state.profileImageUrl);

  return (
    <div className="flex flex-col items-center justify-center py-3">
      <img
        src={profileImageUrl ? profileImageUrl : defaultImage}
        alt="프로필"
        className="w-20 h-20 rounded-full object-cover border mb-3"
      />
      <p className="text-lg font-semibold mb-2">{nickname || '닉네임'}</p>
    </div>
  );
};

export default ProfileSummary;
