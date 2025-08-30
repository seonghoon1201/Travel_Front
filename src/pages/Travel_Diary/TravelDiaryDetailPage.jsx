import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';

import ImageCarousel from '../../components/common/ImageCarousel';
import CommentList from '../../components/comment/CommentList';
import profileDefault from '../../assets/profile_default.png';
import BackHeader from '../../components/header/BackHeader';
import DefaultLayout from '../../layouts/DefaultLayout';
import PostActionModal from '../../components/modal/PostActionModal';
import KakaoMap from '../../components/map/KakaoMap';

import useUserStore from '../../store/userStore';
import { getDiaryDetail } from '../../api/board/getDiaryDetail';

const TravelDiaryDetail = () => {
  const { id } = useParams();
  const [diary, setDiary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentCount, setCommentCount] = useState(0);


  const token = useUserStore((state) => state.accessToken);

  const accessToken     = useUserStore(s => s.accessToken);
  const nickname        = useUserStore(s => s.nickname);
  const profileImageUrl = useUserStore(s => s.profileImageUrl);
  const isLoggedIn      = useUserStore(s => s.isLoggedIn);

  const currentUser = isLoggedIn ? { nickname, profileImage: profileImageUrl } : null;

  useEffect(() => {
    let cancelled = false;

    const fetchDiaryDetail = async () => {
      try {
        const res = await getDiaryDetail(id, token);
        if (!cancelled) {
          setDiary(res.success ? res.data : null);
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
      ? diary.tag.split(',').map((t) => t.trim()).filter(Boolean)
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
        <BackHeader />

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
              <PostActionModal id={diary.boardId || id} writerNickname={diary.userNickname} />
            </div>
          </div>

          {/* 본문 */}
          <div className="pb-6 border-b-2">
            <p className="text-gray-700 whitespace-pre-line leading-relaxed">
              {diary.content || '내용 없음'}
            </p>
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

          {/* 태그 */}
          {tags.length > 0 && (
            <div className="pt-2">
              <div className="flex flex-wrap gap-2 text-sm">
                {tags.map((tag, i) => (
                  <span 
                    key={`${tag}-${i}`}
                    className=" text-blue-600 px-3 py-1 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 일정 버튼 */}
          <div className="flex justify-end items-center pt-4">
            <button className="flex items-center gap-2 text-sm text-white bg-sky-300 hover:bg-sky-400 px-4 py-2 rounded-full whitespace-nowrap transition-colors">
              <CalendarDays className="w-4 h-4" />
              일정 보기
            </button>
          </div>
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

        {/* 댓글 섹션 (추후 구현) */}
        <div className="mt-6 px-4">
          <CommentList boardId={diary?.boardId} />
        </div>
      </div>
    </DefaultLayout>
  );
};

export default TravelDiaryDetail;