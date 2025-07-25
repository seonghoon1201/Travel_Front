import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import BackHeader from '../components/header/BackHeader';
import PrimaryButton from '../components/common/PrimaryButton';
import { Pencil, X } from 'lucide-react';
import useUserStore from '../store/userStore';
import profileDefault from '../assets/profile_default.png';
import { updateUserProfile } from '../api/updateUserProfile';

const EditProfile = () => {
  const navigate = useNavigate();

  // Zustand 상태
  const nickname = useUserStore((state) => state.nickname);
  const setNickname = useUserStore((state) => state.setNickname);
  const profileImageUrl = useUserStore((state) => state.profileImageUrl);
  const setProfileImageUrl = useUserStore((state) => state.setProfileImageUrl);

  const fileInputRef = useRef(null);

  // 이미지 버튼 클릭
  const handleImageClick = () => fileInputRef.current.click();

  // 이미지 변경
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setProfileImageUrl(previewUrl);
  };

  // 닉네임 초기화
  const clearNickname = () => {
    useUserStore.setState({ nickname: '' });
  };

  // 닉네임 저장 후 마이페이지로 이동
  const handleUpdate = async () => {
    const result = await updateUserProfile({
      userNickname: nickname,
      userProfileImage: profileImageUrl,
    });

    if (result.success) {
      // 상태 갱신 (로컬스토리지는 API 함수에서 갱신됨)
      setNickname(nickname);
      setProfileImageUrl(profileImageUrl);

      alert('프로필 수정 완료!');
      navigate('/'); // 홈으로 이동
    } else {
      alert(`수정 실패: ${result.error}`);
    }
  };

  return (
    <div className="bg-background min-h-screen flex w-full justify-center px-4">
      <div className="w-full max-w-sm py-6 overflow-y-auto">
        <BackHeader title="프로필 편집" />

        <div className="flex flex-col items-center">
          {/* 프로필 이미지 */}
          <div className="relative mt-6">
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              <img
                src={profileImageUrl || profileDefault}
                alt="프로필 이미지"
                className="w-full h-full object-cover"
              />
            </div>

            <button
              type="button"
              onClick={handleImageClick}
              className="absolute top-0 right-0 bg-white rounded-full p-1 shadow"
            >
              <Pencil className="w-4 h-4 text-gray-500" />
            </button>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          {/* 닉네임 입력 */}
          <div className="w-full relative mt-6">
            <input
              type="text"
              value={nickname || ''}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="닉네임을 입력하세요"
              className="w-full border-b border-gray-300 py-2 text-center text-lg font-semibold bg-transparent focus:outline-none"
            />
            {nickname && (
              <button
                type="button"
                onClick={clearNickname}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 pr-2"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>

          <PrimaryButton
            className="w-full m-4"
            onClick={handleUpdate}
            disabled={!nickname?.trim()}
          >
            프로필 수정
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
