// src/pages/GuidePage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  BookOpen,
  Calendar,
  UserCircle,
} from "lucide-react";

const GuidePage = () => {
  const navigate = useNavigate();

  const steps = [
    {
      icon: <MapPin className="w-8 h-8 text-blue-500" />,
      title: "핫플 탐색",
      desc: "사람들이 많이 찾은 인기 지역을 확인하세요. 지역별 사진, 현재 날씨, 관광지를 볼 수 있고, 원하는 관광지를 즐겨찾기에 추가할 수 있습니다.",
    },
    {
      icon: <BookOpen className="w-8 h-8 text-green-500" />,
      title: "여행 일기 작성",
      desc: "만든 여행 일정을 바탕으로 나만의 여행 이야기를 기록하세요. 사진과 추억을 남겨 공유할 수 있습니다.",
    },
    {
      icon: <Calendar className="w-8 h-8 text-yellow-500" />,
      title: "여행 일정 만들기",
      desc: "지역과 관광지를 선택하고, AI 기반 최적 동선을 제공받아 효율적인 여행 일정을 세워보세요. 추후 함께할 일행도 초대할 수 있습니다.",
    },
    {
      icon: <UserCircle className="w-8 h-8 text-purple-500" />,
      title: "마이페이지",
      desc: "내가 만든 여행, 여행일기, 즐겨찾기를 한눈에 모아보세요.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* 헤더 */}
      <div className="flex flex-col items-center pt-12 pb-8">
        <img
          src="/logo512.png"
          alt="여담 로고"
          className="w-20 h-20 mb-4 drop-shadow-md"
        />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          여담: 여행을 담다
        </h1>
        <p className="text-gray-500 text-center max-w-md">
          여담은 여행의 순간을 기록하고 공유하는 서비스입니다.  
          아래 단계를 따라 쉽게 여행을 즐겨보세요!
        </p>
      </div>

      {/* 단계별 카드 */}
      <div className="grid gap-6 px-6 md:px-16 lg:px-32 pb-16">
        {steps.map((s, i) => (
          <div
            key={i}
            className="flex items-start gap-4 p-6 bg-white rounded-2xl shadow hover:shadow-md transition"
          >
            <div className="flex-shrink-0">{s.icon}</div>
            <div>
              <h2 className="font-semibold text-lg text-gray-800 mb-1">
                {s.title}
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                {s.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur border-t px-6 py-4">
        <button
          onClick={() => navigate("/")}
          className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold shadow"
        >
          여행 시작하기 🚀
        </button>
      </div>
    </div>
  );
};

export default GuidePage;
