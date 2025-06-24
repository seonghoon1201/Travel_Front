import React from 'react';
import defaultImage from '../../assets/profile_default.png';

const ProfileSummary = ({ nickname = '닉네임', profileImage }) => {
  return (
    <div className="flex flex-col items-center justify-center py-3 bg-white">
      <img
        src={profileImage ? profileImage : defaultImage}
        alt="프로필"
        className="w-20 h-20 rounded-full object-cover border mb-3"
      />
      <p className="text-lg font-semibold mb-2">{nickname}</p>
    </div>
  );
};

export default ProfileSummary;
