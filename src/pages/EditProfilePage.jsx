import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BackHeader from '../components/header/BackHeader';
import PrimaryButton from '../components/common/PrimaryButton';
import { Pencil, X } from 'lucide-react';
import useUserStore from '../store/userStore';
import profileDefault from '../assets/profile_default.png';
import { uploadProfileImage } from '../api/file/uploadProfileImage';
import { userprofileUpdate } from '../api/user/userprofileUpdate';

const EditProfile = () => {
  const navigate = useNavigate();

  // Zustand 전역 상태: 서버에서 받은 URL만 저장
  const nickname = useUserStore((state) => state.nickname);
  const setNickname = useUserStore((state) => state.setNickname);
  const profileImageUrl = useUserStore((state) => state.profileImageUrl);
  const setProfileImageUrl = useUserStore((state) => state.setProfileImageUrl);

  const fileInputRef = useRef(null);

  // 로컬 상태: 편집 중 미리보기(blob)
  const [previewUrl, setPreviewUrl] = useState(profileImageUrl);
  const [selectedFile, setSelectedFile] = useState(null);

  // 이미지 클릭 -> 파일 선택창 열기
  const handleImageClick = () => fileInputRef.current.click();

  // 이미지 변경 시 미리보기(blob) 업데이트
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 기존 blob 해제
    if (previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }

    const blobUrl = URL.createObjectURL(file);
    setPreviewUrl(blobUrl);
    setSelectedFile(file);
  };

  // 언마운트 시 blob 해제
  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // 닉네임 초기화
  const clearNickname = () => {
    useUserStore.setState({ nickname: '' });
  };

  // 프로필 업데이트
  const handleUpdate = async () => {
    try {
      let finalImageUrl = profileImageUrl;

      // 파일 업로드
      if (selectedFile) {
        const uploadRes = await uploadProfileImage(selectedFile);
        if (!uploadRes.success) {
          alert('이미지 업로드 실패');
          return;
        }
        finalImageUrl = uploadRes.imageUrl; // 서버에서 받은 URL
      }

      // 2) 닉네임 + 최종 URL로 프로필 수정
      const result = await userprofileUpdate({
        userNickname: nickname,
        userProfileImage: finalImageUrl,
      });

      if (result.success) {
        // 전역 상태에 서버 URL 저장
        setNickname(nickname);
        setProfileImageUrl(finalImageUrl);

        alert('프로필 수정 완료!');
        navigate('/');
      } else {
        alert(`수정 실패: ${result.error}`);
      }
    } catch (err) {
      alert('수정 중 오류 발생: ' + err.message);
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
                src={previewUrl || profileDefault}
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
