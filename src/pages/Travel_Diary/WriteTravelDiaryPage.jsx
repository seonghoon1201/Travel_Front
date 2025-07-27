import React, { useState } from 'react';
import { CalendarDays, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import DefaultLayout from '../../layouts/DefaultLayout';
import BackHeader from '../../components/header/BackHeader';
import PrimaryButton from '../../components/common/PrimaryButton';

import { writeDiary } from '../../api/board/writeDiary';
import { uploadProfileImage } from '../../api/file/uploadProfileImage';

const WriteTravelDiary = () => {
  const navigate = useNavigate();

  // 입력 상태
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [inputValue, setInputValue] = useState('');

  // 이미지 상태
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  /** 태그 추가 */
  const addTag = () => {
    const trimmed = inputValue.trim();

    // 10개 제한
    if (tags.length >= 10) {
      alert('태그는 최대 10개까지만 추가할 수 있어요!');
      return;
    }

    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setInputValue('');
  };

  /** 스페이스 혹은 엔터 시 태그 추가 */
  const handleKeyDown = (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  /** 태그 제거 */
  const removeTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  /** 이미지 선택 */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file)); // 미리보기용
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }

    try {
      let uploadedUrl = '';

      // 이미지 파일 업로드 (선택된 경우만)
      if (selectedFile) {
        const uploadRes = await uploadProfileImage(selectedFile);
        if (!uploadRes.success) {
          alert('이미지 업로드 실패');
          return;
        }
        uploadedUrl = uploadRes.imageUrl;
      }

      // 2작성 API 호출
      const result = await writeDiary({
        title,
        content,
        tag: tags.join(','), // 태그 여러개 → 문자열
        imageUrl: uploadedUrl,
      });

      if (result.success) {
        alert('작성 완료!');
        navigate(`/board/${result.data.boardId}`);
      } else {
        alert(`작성 실패: ${result.error}`);
      }
    } catch (err) {
      alert('오류 발생: ' + err.message);
    }
  };

  return (
    <DefaultLayout>
      <div className="w-full max-w-sm mx-auto">
        <BackHeader />

        <div>
          <div className="bg-white rounded-xl shadow-md p-4 space-y-4">
            {/* 제목 입력 */}
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
                placeholder="태그를 입력하고 스페이스 또는 엔터"
                className="flex-grow text-sm focus:outline-none"
              />
            </div>

            {/* 내용 입력 */}
            <textarea
              rows={10}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="내용을 입력하세요."
              className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            />

            {/* 이미지 추가 + 일정보기 버튼 */}
            <div className="w-full flex justify-between items-center">
              <label className="flex items-center gap-1 text-sm text-white bg-gray-300 px-3 py-1.5 rounded-full cursor-pointer">
                이미지 추가
                <input
                  type="file"
                  accept="image/*"
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
            {previewUrl && (
              <div className="mt-2">
                <img
                  src={previewUrl}
                  alt="미리보기"
                  className="rounded-lg w-full object-cover"
                />
              </div>
            )}
          </div>

          <div className="text-center pt-10">아래에 일정 관련 UI 구현 </div>

          {/* 작성하기 버튼 */}
          <div className="w-full mt-6 px-4 pb-[1rem]">
            <PrimaryButton
              className="w-full py-3 text-sm rounded-xl shadow"
              onClick={handleSubmit}
            >
              작성 완료하기
            </PrimaryButton>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default WriteTravelDiary;
