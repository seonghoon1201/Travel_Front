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
import useUserStore from '../../store/userStore';
import { getDiaryDetail } from '../../api';
import { fetchMyTravel } from '../../api/user/userContentApi';

const TravelDiaryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [diary, setDiary] = useState(null);
  const [loading, setLoading] = useState(true);

  const [scheduleInfo, setScheduleInfo] = useState(null); 

  const token = useUserStore((state) => state.accessToken);

  useEffect(() => {
    let cancelled = false;
const fetchDiaryDetail = async () => {
  try {
    const res = await getDiaryDetail(id, token);
    console.log(" getDiaryDetail 응답:", res); 
    if (!cancelled) {
      if (res.success) {
        setDiary(res.data);

        if (res.data.scheduleId) {
          try {
            const trips = await fetchMyTravel(token);
            console.log("fetchMyTravel 응답:", trips); 
            const found = Array.isArray(trips)
              ? trips.find((t) => t.scheduleId === res.data.scheduleId)
              : null;
            if (found) setScheduleInfo(found);
          } catch (e) {
          }
        }
      } else {
        setDiary(null);
      }
    }
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

  // 태그: 문자열/배열 모두 지원
  const tags =
    typeof diary.tag === 'string'
      ? diary.tag
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      : Array.isArray(diary.tag)
      ? diary.tag.filter(Boolean)
      : [];

  // 이미지: 배열(imageUrls) 우선, 아니면 단일(imageUrl)
  const images = Array.isArray(diary.imageUrls)
    ? diary.imageUrls.filter(Boolean)
    : typeof diary.imageUrl === 'string' && diary.imageUrl.trim() !== ''
    ? [diary.imageUrl.trim()]
    : [];

  return (
    <DefaultLayout>
      <div className="w-full max-w-sm mx-auto">
        <DiaryHeader />

        <div className="bg-white rounded-xl shadow-md p-6 w-full ">
          {/* 프로필 */}
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

          {/* 연결된 일정 */}
          {scheduleInfo && (
            <div className="mt-4 p-3 border rounded-lg bg-gray-50">
              <p className="text-sm text-gray-600 font-semibold mb-1">
                연결된 일정
              </p>
              <p className="text-sm text-gray-800">{scheduleInfo.scheduleName}</p>
              <p className="text-xs text-gray-500">
                {scheduleInfo.startDate} ~ {scheduleInfo.endDate}
              </p>

              <div className="flex justify-end items-center mt-2">
                <button
                  onClick={() =>
                    navigate(`/plan/schedule/result/${scheduleInfo.scheduleId}`)
                  }
                  className="flex items-center gap-2 text-sm text-white bg-sky-300 hover:bg-sky-400 px-4 py-2 rounded-full transition-colors"
                >
                  <CalendarDays className="w-4 h-4" />
                  일정 보기
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 지도 */}
        {diary.latitude && diary.longitude && (
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
    </DefaultLayout>
  );
};

export default TravelDiaryDetail;
