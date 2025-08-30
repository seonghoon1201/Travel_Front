import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDiary } from '../../api/board/getDiary';
import ImageSlider from './ImageSlider';
import dayjs from 'dayjs';

const TravelDiaryList = ({ title, showMore }) => {
  const [diaries, setDiaries] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDiaries = async () => {

      
      try {
        const res = await getDiary(0, 6);

        console.log('전체 API 응답:', res);
        console.log('첫 번째 아이템:', res.data[0]);
        console.log('imageUrl:', res.data[0]?.imageUrl);
        console.log('imageUrls:', res.data[0]?.imageUrls);


        const raw = Array.isArray(res?.data)
          ? res.data
          : (Array.isArray(res?.data?.content) ? res.data.content : []);

        const formatted = raw.map((item) => {
          const images = Array.isArray(item?.imageUrls)
            ? item.imageUrls.filter((u) => typeof u === 'string' && u.trim() !== '')
            : (typeof item?.imageUrl === 'string' && item.imageUrl.trim() !== ''
                ? [item.imageUrl.trim()]
                : []);

          return {
            id: item?.boardId ?? item?.id ?? crypto.randomUUID(),
            title: item?.title ?? '',
            content: item?.content ?? '',
            userNickname: item?.userNickname ?? '익명',
            userProfileImage: item?.userProfileImage || '/default_profile.png',
            createdAt: item?.createdAt ?? null,
            images, 
            tags: typeof item?.tag === 'string'
              ? item.tag.split(',').map((t) => t.trim()).filter(Boolean)
              : [],
          };
        });

        setDiaries(Array.isArray(formatted) ? formatted : []);
      } catch (e) {
        console.warn('getDiary 실패 ', e);
        setDiaries([]);
      }
    };
    fetchDiaries();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center px-2 mb-2">
        <h2 className="font-jalnangothic">{title}</h2>
        {showMore && (
          <button
            className="font-pretendard text-sm text-blue-500 border rounded-full px-2 py-0.5"
            onClick={() => navigate('/board/travel/diary')}
          >
            + 더보기
          </button>
        )}
      </div>

      {/* 리스트 */}
      <section className="flex flex-col gap-4 px-3 py-2">
        {(Array.isArray(diaries) ? diaries : []).slice(0, 5).map((diary) => (
          <div
            key={diary.id}
            className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate(`/board/travel/diary/${diary.id}`)}
          >
            {/* 프로필 + 제목 */}
            <div className="p-4 pb-2">
              <div className="flex items-center gap-3">
                <img
                  src={diary.userProfileImage }
                  alt="profile"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-gray-900 truncate mb-1">
                    {diary.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{diary.userNickname || '익명'}의 일정</span>
                    <span>·</span>
                    <span>
                      {dayjs(diary.createdAt).isValid()
                        ? dayjs(diary.createdAt).format('M월 D일')
                        : ''}
                    </span>
                  </div>
                </div>
              </div>
            </div>

                        
            {/* 이미지 슬라이드 - 이미지가 있을 때만 표시 */}
           {Array.isArray(diary.images) && diary.images.length > 0 && (
              <div className="px-4 pb-3">
                <ImageSlider images={diary.images} />
              </div>
            )}

            {/* 본문 요약 (항상) */}
            {diary.content && (
              <div className="px-4 pb-3">
                <p className="text-sm text-gray-700 whitespace-normal ">
                  {diary.content}
                </p>
              </div>
            )}

            {/* 태그 */}
            {Array.isArray(diary.tags) && diary.tags.length > 0 && (
              <div className="px-4 pb-4">
                <div className="flex flex-wrap gap-1">
                  {diary.tags.map((t, idx) => (
                    <span
                      key={`${diary.id}-tag-${idx}`}
                      className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-600 font-medium"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </section>
    </div>
  );
};

export default TravelDiaryList;