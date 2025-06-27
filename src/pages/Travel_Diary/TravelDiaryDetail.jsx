import React from 'react';
import { useParams } from 'react-router-dom';
import { Ellipsis , CalendarDays } from 'lucide-react';

import profileDefault from '../../assets/profile_default.png';
import BackHeader from '../../components/header/BackHeader';
import DefaultLayout from '../../layouts/DefaultLayout';
import PostActionModal from '../../components/modal/PostActionModal';

const TravelDiaryDetail = () => {
  const { id } = useParams();

  const dummyData = {
    title: '6월의 제주',
    userProfileImage: '', 
    nickname: '자유로운 영혼',
    content: `여행 가고싶어요
나도 제주도 보내줘
여름이 다가왔는데 왜 가지 못 하는 걸까 엉엉`,
    tags: ['제주', '6월', '학번여행', '3박 4일', '안녕'],
    date: '2025.06.10 ~ 2025.06.13',
  };

  return (
    <DefaultLayout>
      <BackHeader />
      {/* 본문 내용 */}
      <div className="bg-white rounded-xl shadow-md p-5 space-y-6 w-full">
        {/* 프로필 */}
        <div className="flex items-center justify-between pb-3 border-b-2">
          <div className="flex items-center gap-3">
            <img
              src={dummyData.userProfileImage || profileDefault}
              alt="profile"
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="leading-tight space-y-0">
                <p className="text-xs text-gray-500">{dummyData.nickname}</p>
                <h1 className="text-lg font-semibold ">{dummyData.title}</h1>
            </div>
          </div>
          {/* 수정, 삭제, 신고 모달 추가 */}
          <button className="text-gray-400 text-xl font-bold"><PostActionModal /></button>
        </div>

        {/* 본문 내용 */}
        <p className=" text-gray-700 whitespace-pre-line pb-6 border-b-2">{dummyData.content}</p>

        {/* 일정 버튼 - 추가 구현 */}
        <div className="flex justify-end items-center">
            <button className="flex items-center gap-2 text-sm text-white bg-sky-300 px-3 py-1.5 rounded-full whitespace-nowrap">
                <CalendarDays className="w-4 h-4" />일정 보기
            </button>
        </div>
      </div>

      {/* 태그 */}
      <div className= "p-4">
        <div className="flex flex-wrap gap-2 text-sm text-blue-400">
            {dummyData.tags.map((tag, i) => (
              <span key={i}>#{tag}</span>
            ))}
          </div>
      </div>
      {/* 댓글 구현 */}
      <div>댓글 구현</div>
      <div>여행 일정 구현(지도 + 일정)</div>

    </DefaultLayout>
  );
};

export default TravelDiaryDetail;
