import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';

import profileDefault from '../../assets/profile_default.png';
import BackHeader from '../../components/header/BackHeader';
import DefaultLayout from '../../layouts/DefaultLayout';
import PostActionModal from '../../components/modal/PostActionModal';
import KakaoMap from '../../components/map/KakaoMap';

import useUserStore from '../../store/userStore'; // 경로 수정
import { getDiaryDetail } from '../../api/board/getDiaryDetail';

const TravelDiaryDetail = () => {
  const { id } = useParams();
  const [diary, setDiary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Zustand에서 토큰 불러오기
  const token = useUserStore((state) => state.accessToken);

  useEffect(() => {
    const fetchDiaryDetail = async () => {
      const res = await getDiaryDetail(id, token); // token 전달
      if (res.success) {
        setDiary(res.data);
      }
      setLoading(false);
    };

    if (id) fetchDiaryDetail();
  }, [id, token]);

  if (loading)
    return <p className="text-center text-gray-400">불러오는 중...</p>;
  if (!diary)
    return <p className="text-center text-gray-400">데이터가 없습니다.</p>;

  // tag: 문자열 → 배열 변환
  const tags = diary.tag ? diary.tag.split(',') : [];

  return (
    <DefaultLayout>
      <div className="w-full max-w-sm mx-auto">
        <BackHeader />
        <div className="bg-white rounded-xl shadow-md p-6 space-y-6 w-full">
          {/* 프로필 */}
          <div className="flex items-center justify-between pb-3 border-b-2">
            <div className="flex items-center gap-3">
              {/* 작성자 프로필 이미지 추후 연동 예정 */}
              <img
                src={diary.userProfileImage || profileDefault}
                alt="profile"
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="leading-tight space-y-0">
                <p className="text-xs text-gray-500">{diary.userNickname}</p>
                <h1 className="text-lg font-semibold ">{diary.title}</h1>
              </div>
            </div>
            <div className="text-gray-400 text-xl font-bold">
              <PostActionModal id={diary.boardId || diary.id} />
            </div>
          </div>

          {/* 본문 내용 */}
          <p className=" text-gray-700 whitespace-pre-line pb-6 border-b-2">
            {diary.content || '내용 없음'}
          </p>

          {/* 업로드 이미지 */}
          {diary.imageUrl && (
            <div>
              <img
                src={diary.imageUrl}
                alt="업로드 이미지"
                className="rounded-lg w-full h-48 object-cover"
              />
            </div>
          )}

          {/* 일정 버튼 */}
          <div className="flex justify-end items-center">
            <button className="flex items-center gap-2 text-sm text-white bg-sky-300 px-3 py-1.5 rounded-full whitespace-nowrap">
              <CalendarDays className="w-4 h-4" />
              일정 보기
            </button>
          </div>
        </div>

        {/* 태그 */}
        <div className="p-4">
          <div className="flex flex-wrap gap-2 text-sm text-blue-400">
            {tags.map((tag, i) => (
              <span key={i}>#{tag}</span>
            ))}
          </div>
        </div>

        {/* 댓글 (추후 구현) */}
        <div>댓글 구현</div>

        {/* 지도 (필요 시 좌표 연동) */}
        <div>
          <KakaoMap lat={37.5665} lng={126.978} />
        </div>
      </div>
    </DefaultLayout>
  );
};

export default TravelDiaryDetail;
