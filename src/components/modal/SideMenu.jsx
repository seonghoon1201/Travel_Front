import React, { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, MapPinned, Notebook, Heart } from 'lucide-react';
import { message } from 'antd';

import useUserStore from '../../store/userStore';
import DeleteAccountModal from './DeleteAccountModal';
import { deleteUser } from '../../api/auth/user';

const SideMenu = ({
  open,
  onClose,
  setOpenDeleteModal,
  openDeleteModal,
  deleting,
  setDeleting,
}) => {
  const navigate = useNavigate();

  const nickname = useUserStore((s) => s.nickname);
  const profileImageUrl = useUserStore((s) => s.profileImageUrl);
  const isLoggedIn = useUserStore((s) => s.isLoggedIn);
  const accessToken = useUserStore((s) => s.accessToken);
  const logout = useUserStore((s) => s.logout);
  const initializeFromStorage = useUserStore((s) => s.initializeFromStorage);

  useEffect(() => {
    initializeFromStorage();
  }, [initializeFromStorage]);

  // 페이지 이동은 즉시 닫기 (언마운트 X, 클래스만 변경)
  const closeNow = useCallback(() => {
    onClose?.(); // 부모의 isMenuOpen=false (언마운트 하지 않고 항상 렌더)
  }, [onClose]);

  const nav = useCallback(
    (path) => {
      closeNow();
      navigate(path);
    },
    [navigate, closeNow]
  );

  const handleProfileEdit = () => nav('/edit/profile');
  const handleTabClick = (tab) => nav(`/mypage?tab=${tab}`);
  const goTo = (path) => nav(path);
  const handleLogin = () => nav('/login');

  const handleLogout = () => {
    try {
      logout();
      closeNow();
      message.success('로그아웃 되었습니다.');
      navigate('/');
    } catch (e) {
      console.error(e);
      message.error('로그아웃 중 오류가 발생했어요.');
    }
  };

  const openDelete = useCallback(
    () => setOpenDeleteModal(true),
    [setOpenDeleteModal]
  );
  const closeDelete = useCallback(
    () => setOpenDeleteModal(false),
    [setOpenDeleteModal]
  );

  const confirmDelete = useCallback(async () => {
    try {
      setDeleting(true);
      await deleteUser(accessToken);
      message.success('탈퇴가 완료되었습니다.');
      logout();
      closeDelete();
      closeNow();
      navigate('/');
    } catch (e) {
      console.error(e);
      message.error('탈퇴 처리에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setDeleting(false);
    }
  }, [accessToken, logout, closeDelete, closeNow, navigate, setDeleting]);

  // body 스크롤 잠금 (열릴 때만)
  useEffect(() => {
    const original = document.body.style.overflow;
    if (open) document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  return (
    <>
      {/* 오버레이 */}
      <div
        className={[
          'fixed inset-0 z-40 bg-black/40 transition-opacity duration-300',
          open
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none',
        ].join(' ')}
        onClick={closeNow}
        aria-hidden="true"
      />

      {/* 패널: 항상 마운트, 클래스만 변경해서 스르륵 */}
      <div
        className={[
          'fixed top-0 right-0 h-full w-4/5 max-w-[420px] bg-white z-50 shadow-lg p-4',
          'flex flex-col overflow-hidden',
          'transition-transform duration-300 ease-out',
          open ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
        role="dialog"
        aria-modal="true"
      >
        {/* 상단 닫기 */}
        <div className="flex justify-start">
          <button className="pt-3 pl-2" onClick={closeNow} aria-label="닫기">
            <X className="w-7 h-7" />
          </button>
        </div>

        {/* 본문 (스크롤 영역) */}
        <div className="px-2 mt-16 font-pretendard flex-1 min-h-0 overflow-y-auto">
          {isLoggedIn ? (
            <>
              {/* 프로필 */}
              <div className="flex items-center justify-between mb-6">
                <div className="w-3/5">
                  <p className="font-noonnu">안녕하세요, {nickname}님</p>
                </div>
                <div className="w-2/5 flex justify-end">
                  <img
                    src={profileImageUrl}
                    alt="프로필 이미지"
                    className="w-20 h-20 object-cover rounded-full"
                  />
                </div>
              </div>

              {/* 탭 */}
              <div className="flex justify-between items-center pt-7 pb-7 px-2 border-t border-b border-gray-200">
                <button
                  className="flex flex-col items-center gap-1"
                  onClick={() => handleTabClick('myTrip')}
                >
                  <MapPinned className="w-6 h-6" />
                  <span>내 여행</span>
                </button>
                <button
                  className="flex flex-col items-center gap-1"
                  onClick={() => handleTabClick('myDiary')}
                >
                  <Notebook className="w-6 h-6" />
                  <span>내 여행 일기</span>
                </button>
                <button
                  className="flex flex-col items-center gap-1"
                  onClick={() => handleTabClick('myBookmark')}
                >
                  <Heart className="w-6 h-6" />
                  <span>즐겨찾기</span>
                </button>
              </div>

              {/* 메뉴 리스트 */}
              <ul className="mt-7 space-y-4 text-sm text-gray-700">
                <li
                  className="flex justify-between items-center border-b pb-3 cursor-pointer"
                  onClick={() => goTo('/edit/profile')}
                >
                  프로필 편집 <span>&gt;</span>
                </li>
                <li
                  className="flex justify-between items-center border-b pb-3 cursor-pointer"
                  onClick={() => goTo('/mypage')}
                >
                  마이페이지 <span>&gt;</span>
                </li>
                <li
                  className="flex justify-between items-center border-b pb-3 cursor-pointer"
                  onClick={() => goTo('/guide')}
                >
                  서비스 이용 안내 <span>&gt;</span>
                </li>
                <li
                  className="flex justify-between items-center border-b pb-3 text-red-500 cursor-pointer"
                  onClick={handleLogout}
                >
                  로그아웃 <span>&gt;</span>
                </li>
              </ul>
            </>
          ) : (
            <div className="text-center mt-10">
              <p
                className="font-bold text-lg pb-4 border-b cursor-pointer"
                onClick={handleLogin}
              >
                로그인 / 회원가입 <span>&gt;</span>
              </p>
            </div>
          )}
        </div>

        {/* 하단 고정 푸터: 회원 탈퇴 (항상 맨 아래) */}
        {isLoggedIn && (
          <div className="border-t py-5 px-2 flex-none">
            <button
              className="w-full text-center text-xs text-gray-500 hover:text-red-500 transition-colors"
              onClick={openDelete}
            >
              회원 탈퇴
            </button>
          </div>
        )}
      </div>

      {/* 탈퇴 모달 */}
      <DeleteAccountModal
        open={openDeleteModal}
        onClose={closeDelete}
        onConfirm={confirmDelete}
        loading={deleting}
      />
    </>
  );
};

export default function SideMenuContainer({ onClose, open }) {
  // 내부에서 탈퇴 모달/로딩만 관리 (부모는 open만 관리)
  const [openDeleteModal, setOpenDeleteModal] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  return (
    <SideMenu
      open={open}
      onClose={onClose}
      openDeleteModal={openDeleteModal}
      setOpenDeleteModal={setOpenDeleteModal}
      deleting={deleting}
      setDeleting={setDeleting}
    />
  );
}
