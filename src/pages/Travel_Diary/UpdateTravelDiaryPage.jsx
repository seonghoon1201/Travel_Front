import React, { useState, useEffect } from 'react';
import { CalendarDays, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import DefaultLayout from '../../layouts/DefaultLayout';
import BackHeader from '../../components/header/BackHeader';

import { getDiaryDetail } from '../../api';
import { updateDiary } from '../../api';
import { uploadProfileImage } from '../../api'; // 이미지 업로드 API

const UpdateTravelDiaryPage = () => {
  const { boardId } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [inputValue, setInputValue] = useState('');

  // 이미지 상태
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  // 기존 데이터 불러오기
  useEffect(() => {
    const fetchDiary = async () => {
      const res = await getDiaryDetail(boardId);
      if (res.success) {
        setTitle(res.data.title);
        setContent(res.data.content);
        setTags(res.data.tag ? res.data.tag.split(',') : []);
        if (res.data.imageUrl) setPreviewUrl(res.data.imageUrl); // 기존 이미지 미리보기
      }
    };
    fetchDiary();
  }, [boardId]);

  // 태그 추가
  const addTag = () => {
    const trimmed = inputValue.trim();
    if (tags.length >= 10) {
      alert('태그는 최대 10개까지만 추가할 수 있어요!');
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

  /** 이미지 선택 */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file)); // 미리보기용
  };

  // 수정 API 호출
  const handleUpdate = async () => {
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }

    try {
      let uploadedUrl = previewUrl;

      // 새 파일 선택 시 업로드
      if (selectedFile) {
        const uploadRes = await uploadProfileImage(selectedFile);
        if (!uploadRes.success) {
          alert('이미지 업로드 실패');
          return;
        }
        uploadedUrl = uploadRes.imageUrl;
      }

      const result = await updateDiary(boardId, {
        title,
        content,
        tag: tags.length > 0 ? tags.join(',') : '',
        imageUrl: uploadedUrl || '', // 기존 이미지 유지 or 새 이미지
      });

      if (result.success) {
        alert('수정 완료!');
        navigate(`/board/travel/diary/${boardId}`);
      } else {
        alert(`수정 실패: ${result.error}`);
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
            {/* 제목 입력*/}
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

            {/* 내용 입력 */}
            <textarea
              rows={10}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="내용을 입력하세요."
              className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            />

            {/* 이미지 업로드 + 미리보기 */}
            <div className="w-full flex justify-between items-center">
              <label className="flex items-center gap-1 text-sm text-white bg-gray-300 px-3 py-1.5 rounded-full cursor-pointer">
                이미지 변경
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

            {previewUrl && (
              <div className="mt-2">
                <img
                  src={previewUrl}
                  alt="미리보기"
                  className="rounded-lg w-full object-cover"
                />
              </div>
            )}

            {/* 수정 버튼 */}
            <div className="w-full mt-6">
              <button
                onClick={handleUpdate}
                className="w-full py-3 bg-blue-500 text-white rounded-xl text-sm shadow"
              >
                수정 완료
              </button>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default UpdateTravelDiaryPage;
