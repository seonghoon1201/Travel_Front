import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, MapPinned, Notebook, Heart } from 'lucide-react';
import profileDefault from '../../assets/profile_default.png';

const SideMenu = ({ onClose }) => {
  const isLoggedIn = true;
  const navigate = useNavigate();

  // 모달 닫기
  const handleProfileEdit = () => {
    navigate('/edit/profile');
    onClose();
  };

  // 탭 클릭 시 URL 변경
  const handleTabClick = (tab) => {
    navigate(`/mypage?tab=${tab}`);
    onClose();
  };

  return (
    <>
      {/* 배경 오버레이 */}
      <div
        className="fixed inset-0 bg-black bg-opacity-40 z-40"
        onClick={onClose}
      />

      {/* 사이드 메뉴 */}
      <div className="fixed top-0 right-0 h-full w-4/5 bg-white z-50 shadow-lg transition-transform duration-300 p-4">
        <div className="flex justify-start">
          <button onClick={onClose}>
            <X className="w-7 h-7" />
          </button>
        </div>

        <div className="px-2 mt-16 font-pretendard">
          {isLoggedIn ? (
            <>
              <div className="flex items-center justify-between mb-6">
                {/* 왼쪽 텍스트 */}
                <div className="w-3/5">
                  <p className="font-noonnu">안녕하세요, 닉네임님</p>
                  <p
                    className="text-sm text-gray-500 cursor-pointer"
                    onClick={handleProfileEdit}
                  >
                    프로필편집 &gt;
                  </p>
                </div>

                {/* 오른쪽 이미지 */}
                <div className="w-2/5 flex justify-end">
                  <img
                    src={profileDefault}
                    alt="프로필 기본 이미지"
                    className="w-23 h-23 object-cover rounded-full"
                  />
                </div>
              </div>

              {/* 아이콘 영역 */}
              <div className="flex justify-between items-center pt-7 pb-7 px-2 border-t border-b border-gray-200">
                <div
                  className="flex flex-col items-center gap-1"
                  onClick={() => handleTabClick('myTrip')}
                >
                  <MapPinned className="w-6 h-6" />
                  <span>내 여행</span>
                </div>
                <div
                  className="flex flex-col items-center gap-1"
                  onClick={() => handleTabClick('myDiary')}
                >
                  <Notebook className="w-6 h-6" />
                  <span>내 여행 일기</span>
                </div>
                <div
                  className="flex flex-col items-center gap-1"
                  onClick={() => handleTabClick('myBookmark')}
                >
                  <Heart className="w-6 h-6" />
                  <span>내 저장</span>
                </div>
              </div>

              {/* 메뉴 리스트 */}
              <ul className="mt-7 space-y-4 text-sm text-gray-700">
                <li className="flex justify-between items-center border-b pb-3">
                  프로필 편집 <span>&gt;</span>
                </li>
                <li className="flex justify-between items-center border-b pb-3">
                  마이페이지 <span>&gt;</span>
                </li>
                <li className="flex justify-between items-center border-b pb-3">
                  여행 도구 <span>&gt;</span>
                </li>
                <li className="flex justify-between items-center border-b pb-3">
                  로그아웃 <span>&gt;</span>
                </li>
              </ul>
            </>
          ) : (
            <p className="font-bold text-lg pb-4 border-b">
              로그인 / 회원가입 <span>&gt;</span>
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default SideMenu;
