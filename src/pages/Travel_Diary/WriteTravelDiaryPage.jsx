import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import DefaultLayout from '../../layouts/DefaultLayout';
import BackHeader from '../../components/header/BackHeader';
import PrimaryButton from '../../components/common/PrimaryButton';

import useUserStore from '../../store/userStore';
import { writeDiary } from '../../api';
import { uploadProfileImage } from '../../api';
import { fetchMyTravel } from '../../api/user/userContentApi';

const WriteTravelDiary = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const accessToken = useUserStore((s) => s.accessToken);

  // URL 쿼리에서 일정 ID
  const scheduleId = searchParams.get('scheduleId');

  // 입력값
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [inputValue, setInputValue] = useState('');

  // 이미지 (기존/로컬)
  const [existingImageUrls, setExistingImageUrls] = useState([]); // 새 글이면 기본 빈 배열
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  // 일정 표시
  const [selectedScheduleId, setSelectedScheduleId] = useState(null);
  const [selectedScheduleLabel, setSelectedScheduleLabel] = useState('');

  // 진입 시 일정 세팅 + 이름만 조회
  useEffect(() => {
    if (!scheduleId) return;
    setSelectedScheduleId(scheduleId);

    const load = async () => {
      try {
        const trips = await fetchMyTravel(accessToken);
        const found = Array.isArray(trips)
          ? trips.find((t) => t.scheduleId === scheduleId)
          : null;
        if (found) setSelectedScheduleLabel(found.scheduleName || '');
      } catch (e) {
        console.error('내 일정 불러오기 실패:', e);
      }
    };
    load();
  }, [scheduleId, accessToken]);

  // 태그
  const addTag = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    if (tags.length >= 10) {
      alert('태그는 최대 10개까지만 추가할 수 있어요!');
      return;
    }
    if (!tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
    }
    setInputValue('');
  };
  const handleKeyDown = (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };
  const removeTag = (t) => setTags(tags.filter((x) => x !== t));

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const nextFiles = [...selectedFiles, ...files];
    const nextPreviews = [
      ...previewUrls,
      ...files.map((f) => URL.createObjectURL(f)),
    ];

    setSelectedFiles(nextFiles);
    setPreviewUrls(nextPreviews);
  };

  // 기존 이미지 삭제 (지금은 새 글이라 거의 안 쓰이지만 시그니처 유지)
  const removeExistingImage = (url) => {
    setExistingImageUrls(existingImageUrls.filter((u) => u !== url));
  };

  // 로컬(이번에 올릴) 이미지 삭제
  const removeLocalImage = (idx) => {
    if (previewUrls[idx]) URL.revokeObjectURL(previewUrls[idx]);
    setPreviewUrls(previewUrls.filter((_, i) => i !== idx));
    setSelectedFiles(selectedFiles.filter((_, i) => i !== idx));
  };

  // 제출
  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }
    if (!selectedScheduleId) {
      alert('연결된 일정이 없습니다. 일정 선택 후 작성 페이지로 들어오세요.');
      return;
    }

    try {
      // 1) 기존 이미지 + 2) 이번에 업로드한 이미지 URL 합쳐서 보냄
      //   (새 글이면 existingImageUrls는 보통 빈 배열)
      let imageUrls = [...existingImageUrls];

      if (selectedFiles.length > 0) {
        const results = await Promise.all(
          selectedFiles.map((f) => uploadProfileImage(f))
        );
        const failed = results.find((r) => !r?.success || !r?.imageUrl);
        if (failed) {
          alert('이미지 업로드 중 일부 실패했습니다.');
          return;
        }
        imageUrls = imageUrls.concat(results.map((r) => r.imageUrl));
      }

      const payload = {
        title,
        content,
        tag: tags.length > 0 ? tags.join(',') : '일반', // 서버 스펙: 문자열
        imageUrls, // 이미지 없어도 []로 보냄
        scheduleId: selectedScheduleId,
      };

      console.log('📤 writeDiary payload:', payload);
      const result = await writeDiary(payload);

      if (result?.success && result?.boardId) {
        // 미리보기 URL 정리
        previewUrls.forEach((u) => URL.revokeObjectURL(u));
        navigate(`/board/travel/diary/${result.boardId}`);
      } else {
        console.error('작성 결과:', result);
        alert(
          `작성 실패: ${result?.error?.message ?? result?.error ?? '원인 미상(응답에 boardId 없음)'}`
        );
      }
    } catch (err) {
      alert('오류 발생: ' + (err?.message ?? String(err)));
    }
  };

  return (
    <DefaultLayout>
      <div className="w-full max-w-sm mx-auto">
        <BackHeader />

        <div className="bg-white rounded-xl shadow-md p-4 space-y-4">
          {/* 연결된 일정 표시 */}
          <div className="min-h-[28px]">
            {selectedScheduleId ? (
              <span className="inline-flex items-center gap-2 text-xs px-2 py-1 rounded-full bg-sky-100 text-sky-700">
                연결된 일정: {selectedScheduleLabel || '알 수 없는 일정'}
              </span>
            ) : (
              <span className="text-xs text-red-400">일정 정보가 없습니다.</span>
            )}
          </div>

          {/* 제목 */}
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
              onChange={(e) =>
                setInputValue(e.target.value.replace('#', ''))
              }
              onKeyDown={handleKeyDown}
              placeholder="태그를 입력하고 스페이스 또는 엔터"
              className="flex-grow text-sm focus:outline-none"
            />
          </div>

          {/* 내용 */}
          <textarea
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="내용을 입력하세요."
            className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          />

          {/* 이미지 추가 */}
          <div className="w-full flex justify-start items-center">
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
          </div>

          {/* 이미지 미리보기 (개별 삭제 버튼 포함) */}
          {previewUrls.length > 0 && (
            <div className="mt-2 grid grid-cols-2 gap-2">
              {previewUrls.map((url, idx) => (
                <div key={idx} className="relative">
                  <img
                    src={url}
                    alt={`preview-${idx}`}
                    className="rounded-lg w-full h-36 object-cover"
                  />
                  <button
                    onClick={() => removeLocalImage(idx)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-black/40 hover:bg-black/60"
                    aria-label={`이미지 ${idx + 1} 삭제`}
                    title="삭제"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 작성하기 */}
        <div className="w-full mt-6 px-4 pb-[1rem]">
          <PrimaryButton
            className="w-full py-3 text-sm rounded-xl shadow"
            onClick={handleSubmit}
          >
            작성 완료하기
          </PrimaryButton>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default WriteTravelDiary;
