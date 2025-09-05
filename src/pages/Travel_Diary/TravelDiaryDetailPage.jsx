import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';
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
import { fetchMyTravel } from '../../api/user/userContentApi';

const TravelDiaryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [diary, setDiary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scheduleInfo, setScheduleInfo] = useState(null);
  const [scheduleDetail, setScheduleDetail] = useState(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [showDaySelector, setShowDaySelector] = useState(false); 

  const token = useUserStore((state) => state.accessToken);
  const scheduleStore = useScheduleStore(); 

  useEffect(() => {
    let cancelled = false;
    const fetchDiaryDetail = async () => {
      try {
        const res = await getDiaryDetail(id, token);
        console.log("getDiaryDetail 응답:", res); 
        
        if (!cancelled) {
          if (res.success) {
            setDiary(res.data);

            if (res.data.scheduleId) {
              try {
                const trips = await fetchMyTravel(token);
                const found = Array.isArray(trips)
                  ? trips.find((t) => t.scheduleId === res.data.scheduleId)
                  : null;

                if (found) {
                  setScheduleInfo(found);
                  
                  // 스케줄 상세 정보 가져오기
                  try {
                    const scheduleRes = await getSchedule(found.scheduleId);
                    setScheduleDetail(scheduleRes);
                    // 스토어에도 저장 (필요한 경우)
                    scheduleStore.setDetail(scheduleRes);
                  } catch (scheduleErr) {
                    console.error("getSchedule 에러:", scheduleErr);
                  }
                }
              } catch (e) {
                console.error("fetchMyTravel 에러:", e);
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

  // 날짜 선택 핸들러
  const handleDaySelect = (dayIndex) => {
    if (dayIndex === 'all') {
      // 전체 일정 보기 - 기존 스케줄 페이지로 이동
      navigate(`/plan/schedule/result/${scheduleInfo.scheduleId}`);
    } else {
      // 특정 날짜 선택 - 해당 날짜로 이동 (쿼리 파라미터 사용)
      navigate(`/plan/schedule/result/${scheduleInfo.scheduleId}?day=${dayIndex}`);
    }
  };

  // 스케줄 데이터를 days 형태로 변환 (scheduleStore의 getDays 메서드 사용하거나 직접 변환)
  const getDaysFromSchedule = () => {
    if (!scheduleDetail) return [];
    
    // scheduleStore의 getDays 메서드를 사용할 수 있다면
    if (scheduleStore.getDays) {
      return scheduleStore.getDays();
    }
    
    // 또는 직접 변환
    // scheduleDetail의 구조에 따라 적절히 변환
    // 예시: scheduleDetail.scheduleItems를 날짜별로 그룹화
    return []; // 실제 구현 필요
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
      <div className="w-full max-w-sm mx-auto">
        <DiaryHeader />
        <div className="px-4">

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
                    className="text-blue-600 px-3 py-1 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 연결된 스케줄의 지도와 일정 표시 (선택적으로 표시) */}
        {scheduleDetail && scheduleDays.length > 0 && (
          <div className="mt-6 bg-white rounded-xl shadow-md p-4">
            <h3 className="text-lg font-semibold mb-4">여행 일정 미리보기</h3>
            <ScheduleMapSection
              days={scheduleDays}
              selectedDayIndex={selectedDayIndex}
              onDaySelect={setSelectedDayIndex}
              showDayButtons={true}
              showScheduleList={false} // 리스트는 숨기고 지도만 표시
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

        <div className="mt-6 px-4">
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