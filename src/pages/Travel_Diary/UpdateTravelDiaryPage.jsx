import React, { useState, useEffect } from 'react';
import { CalendarDays, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { message } from 'antd';

import DefaultLayout from '../../layouts/DefaultLayout';
import BackHeader from '../../components/header/BackHeader';
import PrimaryButton from '../../components/common/PrimaryButton';

import { uploadProfileImage } from '../../api/file/uploadProfileImage';
import { getDiaryDetail ,updateDiary, getSchedule } from '../../api'; 
import DaySelectorModal from '../../components/modal/DaySelectorModal'; 

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

  const [scheduleId, setScheduleId] = useState(null);
  const [scheduleInfo, setScheduleInfo] = useState(null); 
  const [scheduleDays, setScheduleDays] = useState([]);   
  const [showDaySelector, setShowDaySelector] = useState(false);

  const [messageApi, contextHolder] = message.useMessage();


  // 이미지 핸들러
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
    const fetchDiary = async () => {
      const res = await getDiaryDetail(boardId);
      if (!res?.success) return;

      setTitle(res.data.title ?? '');
      setContent(res.data.content ?? '');
      setTags(res.data.tag ? res.data.tag.split(',').filter(Boolean) : []);
      setScheduleId(res.data.scheduleId ?? null);

      const serverImages = Array.isArray(res.data.imageUrls)
        ? res.data.imageUrls
        : res.data.imageUrl
        ? [res.data.imageUrl]
        : [];
      setExistingImageUrls(serverImages);

      if (res.data.scheduleId) {
        try {
          const detail = await getSchedule(res.data.scheduleId);
          setScheduleInfo(detail);
          
          const grouped = detail.scheduleItems.reduce((acc, item) => {
            const dayIdx = item.dayNumber - 1;
            if (!acc[dayIdx])
              acc[dayIdx] = { dayNumber: item.dayNumber, plans: [] };
            acc[dayIdx].plans.push(item);
            return acc;
          }, []);
          setScheduleDays(grouped);
        } catch (err) {
          messageApi.error('일정 정보를 불러올 수 없습니다.');
        }
      }
    };
    fetchDiary();
  }, [boardId, messageApi]);

  const handleUpdate = async () => {
    if (!title.trim() || !content.trim()) {
      messageApi.error('제목과 내용을 입력해주세요.');
      return;
    }

    try {
      let newUploadedUrls = [];
      if (selectedFiles.length) {
        const results = await Promise.all(selectedFiles.map((f) => uploadProfileImage(f)));
        const failed = results.find((r) => !r?.success);
        if (failed) {
          messageApi.error('이미지 업로드 중 일부 실패했습니다.');
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
        scheduleId,
      });

      if (result?.success) {
        messageApi.success('수정이 완료되었습니다!');
        setTimeout(() => {
          navigate(`/board/travel/diary/${boardId}`);
        }, 1200);
      } else {
        messageApi.error(`수정 실패: ${result?.error ?? '원인 미상'}`);
      }
    } catch (err) {
      messageApi.error('오류 발생: ' + err.message);
    }
  };

  const combinedPreviews = [
    ...existingImageUrls.map((url) => ({ type: 'server', url })),
    ...previewUrls.map((url, idx) => ({ type: 'local', url, idx })),
  ];

  return (
    <DefaultLayout>
      {contextHolder}

      <div className="w-full mx-auto">
        <BackHeader />

        <div className="px-4 pt-2 m-2 sm:px-6 md:px-8">
          <div className="bg-white rounded-xl shadow-md p-4 space-y-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력하세요"
              className="w-full border border-gray-200 rounded-lg p-2 text-center font-bold text-lg focus:outline-none"
            />

            {/* 태그 입력 */}
            <div className="border border-gray-200 rounded-lg p-2 flex flex-wrap gap-2 items-start">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-gray-100 px-2 py-1 rounded-full text-sm flex items-center gap-1"
                >
                  #{tag}
                  <button
                    onClick={() => setTags(tags.filter((t) => t !== tag))}
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
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    const trimmed = inputValue.trim();
                    if (trimmed && !tags.includes(trimmed)) {
                      setTags([...tags, trimmed]);
                      setInputValue('');
                    }
                  }
                }}
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

              {scheduleId && (
                <button
                  onClick={() => setShowDaySelector(true)} 
                  className="flex items-center gap-1 text-sm text-white bg-sky-300 px-3 py-1.5 rounded-full"
                >
                  <CalendarDays className="w-4 h-4" />
                  일정 보기
                </button>
              )}
            </div>

            {/* 이미지 미리보기 */}
            {combinedPreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-2">
                {combinedPreviews.map((item, index) => (
                  <div key={`${item.type}-${index}`} className="relative">
                    <img
                      src={item.url}
                      alt={`미리보기 ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border"
                    />
                    <button
                      onClick={() =>
                        item.type === 'server'
                          ? removeExistingImage(item.url)
                          : removeLocalImage(item.idx)
                      }
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 text-xs hover:bg-red-600"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* 하단 고정 수정 버튼 바 */}
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur border-t">
              <div className="mx-auto  px-4 py-3">
                <PrimaryButton onClick={handleUpdate} className="w-full">
                  수정 완료
                </PrimaryButton>
              </div>
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
        onDaySelect={(dayNumber) => {
          if (!scheduleId) {
            console.error('scheduleId가 없습니다!');
            return;
          }
          
          if (dayNumber && dayNumber !== 'all') {
            navigate(`/schedule/view/${scheduleId}/day/${dayNumber}`);
          } else {
            navigate(`/schedule/view/${scheduleId}`);
          }
          setShowDaySelector(false);
        }}
      />
          </DefaultLayout>
        );
      };

export default UpdateTravelDiaryPage;
