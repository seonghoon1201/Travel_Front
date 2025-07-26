import React, { useState, useEffect } from 'react';
import { CalendarDays, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import DefaultLayout from '../../layouts/DefaultLayout';
import BackHeader from '../../components/header/BackHeader';

import { getDiaryDetail } from '../../api/board/getDiaryDetail';
import { updateDiary } from '../../api/board/updateDiary';

const UpdateTravelDiaryPage = () => {
  const { id } = useParams(); // boardId
  const navigate = useNavigate();

  // 상태
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [inputValue, setInputValue] = useState('');

  // 기존 데이터 불러오기
  useEffect(() => {
    const fetchDiary = async () => {
      const res = await getDiaryDetail(id);
      if (res.success) {
        setTitle(res.data.title);
        setContent(res.data.content);
        setTags(res.data.tag ? res.data.tag.split(',') : []);
      }
    };
    fetchDiary();
  }, [id]);

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

  // 수정 API 호출
  const handleUpdate = async () => {
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }

    const result = await updateDiary(id, {
      title,
      content,
      tag: tags.join(','),
      imageUrl: '', // 필요시 이미지 연동
    });

    if (result.success) {
      alert('수정 완료!');
      navigate(`/board/${id}`);
    } else {
      alert(`수정 실패: ${result.error}`);
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

            {/* 일정 보기 버튼 */}
            <div className="w-full flex justify-end">
              <button className="flex items-center gap-1 text-sm text-white bg-sky-300 px-3 py-1.5 rounded-full">
                <CalendarDays className="w-4 h-4" />
                일정 보기
              </button>
            </div>

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
