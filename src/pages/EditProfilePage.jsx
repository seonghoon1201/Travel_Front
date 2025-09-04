import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BackHeader from '../components/header/BackHeader';
import PrimaryButton from '../components/common/PrimaryButton';
import { Pencil, X } from 'lucide-react';
import useUserStore from '../store/userStore';
import profileDefault from '../assets/profile_default.png';
import { uploadProfileImage } from '../api/file/uploadProfileImage';
import { userProfileUpdate } from '../api/user/userProfileUpdate';

const EditProfile = () => {
  const navigate = useNavigate();

  const storeNickname = useUserStore((s) => s.nickname);
  const storeProfileImageUrl = useUserStore((s) => s.profileImageUrl);

  const [localNickname, setLocalNickname] = useState(storeNickname || '');
  const [previewUrl, setPreviewUrl] = useState(storeProfileImageUrl || '');
  const [selectedFile, setSelectedFile] = useState(null);

  const fileInputRef = useRef(null);
  useEffect(() => {
    setLocalNickname(storeNickname || '');
  }, [storeNickname]);

  useEffect(() => {
    setPreviewUrl(storeProfileImageUrl || '');
  }, [storeProfileImageUrl]);

  const handleImageClick = () => fileInputRef.current?.click();

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    const blobUrl = URL.createObjectURL(file);
    setPreviewUrl(blobUrl);
    setSelectedFile(file);
  };

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const clearNickname = () => setLocalNickname('');

  const handleUpdate = async () => {
    try {
      const trimmedNickname = (localNickname || '').trim();
      if (!trimmedNickname) {
        alert('닉네임을 입력해주세요.');
        return;
      }

      let finalImageUrl = storeProfileImageUrl || '';

      // 1) 이미지 업로드(선택 시)
      if (selectedFile) {
        const uploadRes = await uploadProfileImage(selectedFile);
        if (!uploadRes?.success) {
          alert('이미지 업로드 실패');
          return;
        }
        const uploadedUrl =
          uploadRes?.imageUrl ||
          uploadRes?.data?.imageUrl ||
          uploadRes?.data?.url ||
          uploadRes?.url;
        if (!uploadedUrl) {
          alert('서버에서 이미지 URL을 받지 못했어요.');
          return;
        }
        finalImageUrl = uploadedUrl;
      }

      const payload = {
        nickname: trimmedNickname,
        profileImageUrl: finalImageUrl,
        userNickname: trimmedNickname,
        userProfileImage: finalImageUrl,
      };

      const result = await userProfileUpdate(payload);
      if (!result?.success) {
        alert(`수정 실패: ${result?.error || '알 수 없는 오류'}`);
        return;
      }

      useUserStore.setState({
        nickname: trimmedNickname,
        userNickname: trimmedNickname,
        profileImageUrl: finalImageUrl,
        userProfileImage: finalImageUrl,
      });

      alert('프로필 수정 완료!');
      navigate('/');
    } catch (err) {
      console.error(err);
      alert('수정 중 오류: ' + (err?.message || err));
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
                onError={(e) => {
                  e.currentTarget.src = profileDefault;
                }}
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
              value={localNickname}
              onChange={(e) => setLocalNickname(e.target.value)}
              placeholder="닉네임을 입력하세요"
              className="w-full border-b border-gray-300 py-2 text-center text-lg font-semibold bg-transparent focus:outline-none"
            />
            {localNickname && (
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
            disabled={!localNickname.trim()}
          >
            프로필 수정
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
