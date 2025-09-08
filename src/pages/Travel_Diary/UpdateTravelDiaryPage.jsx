import React, { useState, useEffect } from 'react';
import { CalendarDays, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import DefaultLayout from '../../layouts/DefaultLayout';
import BackHeader from '../../components/header/BackHeader';
import PrimaryButton from '../../components/common/PrimaryButton';

import { getDiaryDetail } from '../../api/board/getDiaryDetail';
import { updateDiary } from '../../api/board/updateDiary';
import { uploadProfileImage } from '../../api/file/uploadProfileImage';
import { useToast } from '../../utils/useToast';

import Toast from '../../components/common/Toast';

const UpdateTravelDiaryPage = () => {
  const { boardId } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [inputValue, setInputValue] = useState('');

  const [existingImageUrls, setExistingImageUrls] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  const { toast, showError, showInfo, showSuccess, hideToast } = useToast();

  useEffect(() => {
    const fetchDiary = async () => {
      const res = await getDiaryDetail(boardId);
      if (!res?.success) return;

      setTitle(res.data.title ?? '');
      setContent(res.data.content ?? '');
      setTags(res.data.tag ? res.data.tag.split(',').filter(Boolean) : []);

      const serverImages = Array.isArray(res.data.imageUrls)
        ? res.data.imageUrls
        : res.data.imageUrl
        ? [res.data.imageUrl]
        : [];
      setExistingImageUrls(serverImages);
    };
    fetchDiary();
  }, [boardId]);

  const addTag = () => {
    const trimmed = inputValue.trim();
    if (tags.length >= 10) {
      showInfo('태그는 최대 10개까지만 추가할 수 있어요!');
      return;
    }
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setInputValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const nextFiles = [...selectedFiles, ...files];
    const nextPreviews = [...previewUrls, ...files.map((f) => URL.createObjectURL(f))];

    setSelectedFiles(nextFiles);
    setPreviewUrls(nextPreviews);
  };

  const removeExistingImage = (url) => {
    setExistingImageUrls(existingImageUrls.filter((u) => u !== url));
  };

  const removeLocalImage = (idx) => {
    URL.revokeObjectURL(previewUrls[idx]);
    setPreviewUrls(previewUrls.filter((_, i) => i !== idx));
    setSelectedFiles(selectedFiles.filter((_, i) => i !== idx));
  };

  useEffect(() => {
    return () => {
      previewUrls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [previewUrls]);

  const handleUpdate = async () => {
    if (!title.trim() || !content.trim()) {
      showError('제목과 내용을 입력해주세요.');
      return;
    }

    try {
      let newUploadedUrls = [];
      if (selectedFiles.length) {
        const results = await Promise.all(selectedFiles.map((f) => uploadProfileImage(f)));
        const failed = results.find((r) => !r?.success);
        if (failed) {
          showError('이미지 업로드 중 일부 실패했습니다.');
          return;
        }
        newUploadedUrls = results.map((r) => r.imageUrl);
      }

      const finalImageUrls = [...existingImageUrls, ...newUploadedUrls];

      const result = await updateDiary(boardId, {
        title,
        content,
        tag: tags.join(','),
        imageUrls: finalImageUrls,
      });

      if (result?.success) {
        showSuccess('수정이 완료되었습니다!');
        setTimeout(() => {
        navigate(`/board/travel/diary/${boardId}`);
      }, 1200);

      } else {
        showError(`수정 실패: ${result?.error ?? '원인 미상'}`);
      }
    } catch (err) {
      showError('오류 발생: ' + err.message);
    }
  };

  // 통합된 이미지 목록
  const combinedPreviews = [
    ...existingImageUrls.map((url) => ({ type: 'server', url })),
    ...previewUrls.map((url, idx) => ({ type: 'local', url, idx })),
  ];

  return (
    <DefaultLayout>
      <div className="w-full max-w-sm mx-auto">
        <BackHeader />

        <div className="px-4">
          <div className="bg-white rounded-xl shadow-md p-4 space-y-4">
            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제목을 입력하세요"
                className="w-full border border-gray-200 rounded-lg p-2 text-center font-bold text-lg focus:outline-none"
              />
            </div>

            {/* 태그 입력 */}
            <div className="border border-gray-200 rounded-lg p-2 flex flex-wrap gap-2 items-start">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-gray-100 px-2 py-1 rounded-full text-sm flex items-center gap-1"
                >
                  #{tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="text-gray-400 hover:text-red-400"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value.replace('#', ''))}
                onKeyDown={handleKeyDown}
                placeholder="#태그를 입력하고 스페이스 또는 엔터"
                className="flex-grow text-sm focus:outline-none"
              />
            </div>

            <textarea
              rows={10}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="내용을 입력하세요."
              className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            />

            <div className="w-full flex justify-between items-center">
              <label className="flex items-center gap-1 text-sm text-white bg-gray-300 px-3 py-1.5 rounded-full cursor-pointer">
                이미지 추가
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>

              <button className="flex items-center gap-1 text-sm text-white bg-sky-300 px-3 py-1.5 rounded-full">
                <CalendarDays className="w-4 h-4" />
                일정 보기
              </button>
            </div>

            {/* 이미지 미리보기 */}
            {combinedPreviews.length > 0 && (
              <div className="mt-4 space-y-2">
                <h3 className="text-sm font-medium text-gray-700">이미지 미리보기</h3>
                <div className="grid grid-cols-2 gap-2">
                  {combinedPreviews.map((item, index) => (
                    <div key={`${item.type}-${index}`} className="relative">
                      <img
                        src={item.url}
                        alt={`미리보기 ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <button
                        onClick={() => {
                          if (item.type === 'server') {
                            removeExistingImage(item.url);
                          } else {
                            removeLocalImage(item.idx);
                          }
                        }}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 text-xs hover:bg-red-600"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 하단 고정 수정 버튼 바 */}
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur border-t">
              <div className="mx-auto max-w-sm px-4 py-3">
                <PrimaryButton onClick={handleUpdate} className="w-full">
                  수정 완료
                </PrimaryButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={hideToast}
        />
      )}
    </DefaultLayout>
  );
};

export default UpdateTravelDiaryPage;
