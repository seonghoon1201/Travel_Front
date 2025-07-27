import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ellipsis } from 'lucide-react';
import { deleteDiary } from '../../api/board/deleteDiary';
import useUserStore from '../../store/userStore'; // 로그인 유저 정보 가져오기

const PostActionModal = ({ id, writerNickname }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // 현재 로그인 유저 닉네임
  const currentUserNickname = useUserStore((state) => state.nickname);

  const toggleMenu = () => setIsOpen((prev) => !prev);
  const closeMenu = () => setIsOpen(false);

  // 바깥 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 삭제 핸들러
  const handleDelete = async () => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        await deleteDiary(id);
        alert('삭제 완료되었습니다.');
        navigate('/board/travel/diary');
      } catch (err) {
        alert('삭제에 실패했습니다.');
      }
    }
    closeMenu();
  };

  // 작성자 여부 확인
  const isWriter = currentUserNickname === writerNickname;

  return (
    <div className="relative inline-block" ref={menuRef}>
      <button onClick={toggleMenu} className="text-gray-500 text-xl">
        <Ellipsis />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-28 bg-white border border-gray-200 rounded-md shadow-lg z-50">
          {isWriter ? (
            <>
              <button
                onClick={handleDelete}
                className="w-full px-4 py-2 text-sm hover:bg-gray-100"
              >
                삭제하기
              </button>
              <button
                onClick={() => {
                  navigate(`/update/travel/diary/${id}`);
                  closeMenu();
                }}
                className="w-full px-4 py-2 text-sm hover:bg-gray-100"
              >
                수정하기
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                alert('신고');
                closeMenu();
              }}
              className="w-full px-4 py-2 text-sm hover:bg-gray-100"
            >
              신고하기
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PostActionModal;
