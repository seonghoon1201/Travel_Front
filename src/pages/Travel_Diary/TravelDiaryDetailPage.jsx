import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {  ChevronDown  } from 'lucide-react';
import ImageCarousel from '../../components/common/ImageCarousel';
import CommentList from '../../components/comment/CommentList';
import profileDefault from '../../assets/profile_default.png';
import DiaryHeader from '../../components/header/DiaryHeader';
import DefaultLayout from '../../layouts/DefaultLayout';
import PostActionModal from '../../components/modal/PostActionModal';
import KakaoMap from '../../components/map/KakaoMap';
import ScheduleMapSection from '../../components/schedule/ScheduleMapSection';
import DaySelectorModal from '../../components/modal/DaySelectorModal'; 
import useUserStore from '../../store/userStore';
import useScheduleStore from '../../store/scheduleStore'; 
import { getDiaryDetail, getSchedule } from '../../api';

const TravelDiaryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [diary, setDiary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scheduleInfo, setScheduleInfo] = useState(null);
  const [scheduleDetail, setScheduleDetail] = useState(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [showDaySelector, setShowDaySelector] = useState(false); 
  const [showPreview, setShowPreview] = useState(false); 

  const token = useUserStore((state) => state.accessToken);
  const scheduleStore = useScheduleStore(); 

  useEffect(() => {
    let cancelled = false;
    const fetchDiaryDetail = async () => {
      try {
        const res = await getDiaryDetail(id, token);
        
        if (!cancelled) {
          if (res.success) {
            setDiary(res.data);

            if (res.data.scheduleId) {
               try {
                const scheduleRes = await getSchedule(res.data.scheduleId);
                setScheduleDetail(scheduleRes);
                scheduleStore.setDetail(scheduleRes);
                setScheduleInfo({
                  scheduleId: scheduleRes.scheduleId,
                  startDate: scheduleRes.startDate,
                  endDate: scheduleRes.endDate,
                  scheduleName: scheduleRes.scheduleName,
                });
              } catch (scheduleErr) {
                console.error("getSchedule 에러:", scheduleErr);
              }
            }
          } else {
            setDiary(null);
          }
        }
      } catch (err) {
        console.error("fetchDiaryDetail 에러:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (id) {
      setLoading(true);
      fetchDiaryDetail();
    }

    return () => {
      cancelled = true;
    };
  }, [id, token]);

  const handleDaySelect = (dayIndex) => {
    if (dayIndex === 'all') {
      navigate(`/schedule/view/${scheduleInfo.scheduleId}`);
    } else {
      navigate(`/schedule/view/${scheduleInfo.scheduleId}?day=${dayIndex}`);
    }
  };

  const getDaysFromSchedule = () => {
    if (!scheduleDetail) return [];
    
    if (scheduleStore.getDays) {
      return scheduleStore.getDays();
    }
    
    return []; 
  };

  if (loading) {
    return (
      <DefaultLayout>
        <div className="w-full max-w-sm mx-auto flex items-center justify-center h-64">
          <p className="text-center text-gray-400">불러오는 중...</p>
        </div>
      </DefaultLayout>
    );
  }

  if (!diary) {
    return (
      <DefaultLayout>
        <div className="w-full max-w-sm mx-auto flex items-center justify-center h-64">
          <p className="text-center text-gray-400">데이터가 없습니다.</p>
        </div>
      </DefaultLayout>
    );
  }

  const tags =
    typeof diary.tag === 'string'
      ? diary.tag
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      : Array.isArray(diary.tag)
      ? diary.tag.filter(Boolean)
      : [];

  const images = Array.isArray(diary.imageUrls)
    ? diary.imageUrls.filter(Boolean)
    : typeof diary.imageUrl === 'string' && diary.imageUrl.trim() !== ''
    ? [diary.imageUrl.trim()]
    : [];

  const scheduleDays = getDaysFromSchedule();

  return (
    <DefaultLayout>
      <div className="w-full  mx-auto">
        <DiaryHeader />
        <div className=" px-4  sm:px-6  md:px-8">

        <div className="bg-white rounded-xl shadow-md p-6 w-full ">
          <div className="flex items-center justify-between pb-3 border-b-2">
            <div className="flex items-center gap-3">
              <img
                src={diary.userProfileImage || profileDefault}
                alt="profile"
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="leading-tight space-y-0">
                <p className="text-xs text-gray-500">{diary.userNickname}</p>
                <h1 className="text-lg font-semibold">{diary.title}</h1>
              </div>
            </div>
            <div className="text-gray-400 text-xl font-bold">
              <PostActionModal
                id={diary.boardId || id}
                writerNickname={diary.userNickname}
              />
            </div>
          </div>

          {/* 이미지 업로드 */}
          {images.length > 0 && (
            <div className="space-y-3">
              <ImageCarousel
                images={images}
                altPrefix="여행일기 이미지"
                className="rounded-lg"
              />
            </div>
          )}

          {/* 본문 */}
          <div className="pb-6 border-b-2">
            <p className="text-gray-700 whitespace-pre-line leading-relaxed">
              {diary.content || '내용 없음'}
            </p>
          </div>

          {/* 태그 */}
          {tags.length > 0 && (
            <div className="pt-2">
              <div className="flex flex-wrap gap-2 text-sm">
                {tags.map((tag, i) => (
                  <span
                    key={`${tag}-${i}`}
                    className="text-blue-600  py-1 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

       {scheduleDetail && scheduleDays.length > 0 && (
        <div className="mt-2 bg-white rounded-xl shadow-md overflow-hidden">
          {/* 헤더 */}
          <button
            type="button"
            onClick={() => setShowPreview((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-2 text-left"
          >
            <div className="flex flex-col">
              <h3 className="pt-2 text-lg font-semibold leading-tight">여행 일정 미리보기</h3>
              {scheduleInfo?.startDate && scheduleInfo?.endDate && (
                <p className="text-xs text-gray-500 mt-1 leading-snug">
                  {scheduleInfo.startDate} ~ {scheduleInfo.endDate}
                </p>
              )}
            </div>
            <ChevronDown
              className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                showPreview ? 'rotate-180' : ''
              }`}
            />
          </button>


          <div
            id="preview-panel"
            className={`
              transition-all duration-300 ease-out
              ${showPreview ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}
              overflow-hidden
            `}
          >
            <div className={`border-t ${showPreview ? 'px-4 pb-4 pt-4' : 'p-0 border-t-0'}`}>
              <ScheduleMapSection
                days={scheduleDays}
                selectedDayIndex={selectedDayIndex}
                onDaySelect={setSelectedDayIndex}
                showDayButtons={true}
                showScheduleList={false}
                mapHeight="h-48"
              />
              <div className="mt-3 text-center">
                <button
                  onClick={() => setShowDaySelector(true)}
                  className="text-sm text-blue-500 hover:text-blue-600"
                >
                  상세 일정 보기 →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

        {/* 기존 단일 위치 지도 (연결된 스케줄이 없을 때만) */}
        {!scheduleDetail && diary.latitude && diary.longitude && (
          <div className="mt-6 bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-sm font-medium text-gray-700">여행 위치</h3>
            </div>
            <div className="h-64">
              <KakaoMap
                lat={diary.latitude}
                lng={diary.longitude}
                title={diary.title}
              />
            </div>
          </div>
        )}

        <div className="mt-4 ">
          <CommentList boardId={diary?.boardId} />
        </div>
        </div>

        {/* 날짜 선택 모달 */}
        <DaySelectorModal
          isOpen={showDaySelector}
          onClose={() => setShowDaySelector(false)}
          scheduleInfo={scheduleInfo}
          days={scheduleDays}
          onDaySelect={handleDaySelect}
        />
      </div>
    </DefaultLayout>
  );
};

export default TravelDiaryDetail;