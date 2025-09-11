import React, { useEffect, useState } from 'react';
import { X, CalendarDays } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import DefaultLayout from '../../layouts/DefaultLayout';
import BackHeader from '../../components/header/BackHeader';
import PrimaryButton from '../../components/common/PrimaryButton';

import useUserStore from '../../store/userStore';
import { writeDiary } from '../../api';
import { uploadProfileImage } from '../../api';
import { fetchMyTravel } from '../../api/user/userContentApi';
import { getSchedule } from '../../api/';

import { message } from 'antd';
import DaySelectorModal from '../../components/modal/DaySelectorModal';

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
  const [existingImageUrls, setExistingImageUrls] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  // 일정 정보
  const [selectedScheduleId, setSelectedScheduleId] = useState(null);
  const [selectedScheduleLabel, setSelectedScheduleLabel] = useState('');
  const [scheduleInfo, setScheduleInfo] = useState(null);
  const [scheduleDays, setScheduleDays] = useState([]);
  const [showDaySelector, setShowDaySelector] = useState(false);

  // ✅ antd message
  const [messageApi, contextHolder] = message.useMessage();

  // 진입 시 일정 세팅
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

        const detail = await getSchedule(scheduleId);
        if (detail) {
          setScheduleInfo(detail);

          const grouped = detail.scheduleItems.reduce((acc, item) => {
            const dayIdx = item.dayNumber - 1;
            if (!acc[dayIdx])
              acc[dayIdx] = { dayNumber: item.dayNumber, plans: [] };
            acc[dayIdx].plans.push(item);
            return acc;
          }, []);
          setScheduleDays(grouped);
        }
      } catch (e) {
        console.error('일정 불러오기 실패:', e);
        messageApi.error('일정 정보를 불러올 수 없습니다.');
      }
    };
    load();
  }, [scheduleId, accessToken, messageApi]);

  const addTag = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    if (tags.length >= 10) {
      messageApi.info('태그는 최대 10개까지만 추가할 수 있어요!');
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

  // 향상된 이미지 핸들러
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    console.log('📁 선택된 파일들:', files);
    
    if (!files.length) {
      console.log('❌ 파일이 선택되지 않았습니다.');
      return;
    }

    // 파일 검증
    const validFiles = [];
    const invalidFiles = [];
    
    files.forEach(file => {
      console.log('🔍 파일 검사:', {
        name: file.name,
        size: file.size,
        type: file.type,
        sizeInMB: (file.size / (1024 * 1024)).toFixed(2)
      });
      
      // 이미지 타입 체크
      if (!file.type.startsWith('image/')) {
        invalidFiles.push(`${file.name}: 이미지 파일이 아닙니다`);
        return;
      }
      
      // 파일 크기 체크 (10MB 제한)
      if (file.size > 10 * 1024 * 1024) {
        invalidFiles.push(`${file.name}: 파일이 너무 큽니다 (${(file.size / (1024 * 1024)).toFixed(2)}MB)`);
        return;
      }
      
      validFiles.push(file);
    });
    
    if (invalidFiles.length > 0) {
      messageApi.warning(`다음 파일들을 업로드할 수 없습니다:\n${invalidFiles.join('\n')}`);
    }
    
    if (validFiles.length === 0) {
      console.log('❌ 유효한 파일이 없습니다.');
      return;
    }
    
    const nextFiles = [...selectedFiles, ...validFiles];
    const nextPreviews = [
      ...previewUrls,
      ...validFiles.map((f) => {
        const url = URL.createObjectURL(f);
        console.log('🖼️ 미리보기 URL 생성:', f.name, url);
        return url;
      })
    ];
    
    setSelectedFiles(nextFiles);
    setPreviewUrls(nextPreviews);
    
    console.log('✅ 파일 상태 업데이트:', {
      totalFiles: nextFiles.length,
      totalPreviews: nextPreviews.length
    });
    
    // input 초기화 (같은 파일 다시 선택 가능하게)
    e.target.value = '';
  };

  const removeExistingImage = (url) => {
    setExistingImageUrls(existingImageUrls.filter((u) => u !== url));
  };

  const removeLocalImage = (idx) => {
    if (previewUrls[idx]) URL.revokeObjectURL(previewUrls[idx]);
    setPreviewUrls(previewUrls.filter((_, i) => i !== idx));
    setSelectedFiles(selectedFiles.filter((_, i) => i !== idx));
  };

  // 향상된 제출 함수
  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      messageApi.error('제목과 내용을 입력해주세요.');
      return;
    }
    if (!selectedScheduleId) {
      messageApi.error('연결된 일정이 없습니다. 일정 선택 후 작성 페이지로 들어오세요.');
      return;
    }

    try {
      let imageUrls = [...existingImageUrls];
      
      if (selectedFiles.length > 0) {
        console.log('📁 업로드할 파일들:', selectedFiles.map(f => ({
          name: f.name,
          size: f.size,
          type: f.type
        })));
        
        messageApi.info(`${selectedFiles.length}개 이미지 업로드 중...`);
        
        // 하나씩 업로드해서 어느 파일에서 문제가 생기는지 확인
        for (let i = 0; i < selectedFiles.length; i++) {
          const file = selectedFiles[i];
          console.log(`📤 업로드 시도 ${i + 1}:`, file.name, file.size, 'bytes');
          
          try {
            const result = await uploadProfileImage(file);
            console.log(`✅ 업로드 성공 ${i + 1}:`, result);
            
            if (result?.success && result?.imageUrl) {
              imageUrls.push(result.imageUrl);
            } else {
              console.error(`❌ 업로드 실패 ${i + 1} - 응답 문제:`, result);
              messageApi.error(`이미지 ${i + 1} 업로드 실패: 응답이 올바르지 않습니다.`);
              return;
            }
          } catch (fileError) {
            console.error(`❌ 업로드 실패 ${i + 1}:`, fileError);
            messageApi.error(`이미지 ${i + 1} 업로드 실패: ${fileError.message || fileError}`);
            return;
          }
        }
        
        console.log('🖼️ 최종 이미지 URLs:', imageUrls);
      }

      const payload = {
        title,
        content,
        tag: tags.length > 0 ? tags.join(',') : '일반',
        imageUrls,
        scheduleId: selectedScheduleId,
      };

      console.log('📝 일기 작성 요청:', payload);
      const result = await writeDiary(payload);
      console.log('📝 일기 작성 응답:', result);
      
      if (result?.success && result?.boardId) {
        previewUrls.forEach((u) => URL.revokeObjectURL(u));
        messageApi.success('여행일기가 작성되었습니다!');
        setTimeout(() => {
          navigate(`/board/travel/diary/${result.boardId}`);
        }, 1200);
      } else {
        console.error('❌ 일기 작성 실패:', result);
        messageApi.error('일기 작성에 실패했습니다.');
      }
    } catch (err) {
      console.error('❌ 전체 프로세스 실패:', err);
      messageApi.error('오류 발생: ' + (err?.response?.data?.message || err?.message || String(err)));
    }
  };

  return (
    <DefaultLayout>
      {contextHolder}

      <div className="w-full mx-auto">
        <BackHeader title="여행일기" />
        <div className="px-4 pb-[calc(env(safe-area-inset-bottom)+80px)]">
          <div className="bg-white rounded-xl shadow-md p-4  space-y-4">
            {/* 연결된 일정 표시 */}
            <div className="flex items-center justify-between min-h-[28px]">
              {selectedScheduleId ? (
                <>
                  <span className="inline-flex items-center gap-2 text-xs px-2 py-1 rounded-full bg-sky-100 text-sky-700">
                    연결된 일정: {selectedScheduleLabel || '알 수 없는 일정'}
                  </span>
                  <button
                    onClick={() => setShowDaySelector(true)}
                    className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                  >
                    <CalendarDays className="w-3 h-3" />
                    일정 보기 →
                  </button>
                </>
              ) : (
                <span className="text-xs text-red-400">
                  일정 정보가 없습니다.
                </span>
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

            {/* 태그 */}
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

            {/* 이미지 미리보기 */}
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

          {/* 작성 버튼 */}
          <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full z-40 bg-white/90 backdrop-blur border-t">
            <div className="px-4 py-3">
              <PrimaryButton
                className="w-full py-3 text-sm rounded-xl shadow"
                onClick={handleSubmit}
              >
                작성 완료하기
              </PrimaryButton>
            </div>
          </div>
        </div>
      </div>

      {/*  일정 보기 모달 */}
      <DaySelectorModal
        isOpen={showDaySelector}
        onClose={() => setShowDaySelector(false)}
        scheduleInfo={scheduleInfo}
        days={scheduleDays}
        onDaySelect={() => {}}
      />
    </DefaultLayout>
  );
};

export default WriteTravelDiary;