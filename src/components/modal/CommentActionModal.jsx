import { useEffect, useRef, useState } from 'react';
import { Ellipsis } from 'lucide-react';
import useUserStore from '../../store/userStore';

const CommentActionModal = ({
  commentId,
  writerNickname,
  onDelete,   // 댓글 삭제 함수 (부모에서 받아옴)
  onEdit,     // 댓글 수정 함수 (선택사항)
  onReport,   // 댓글 신고 함수 (선택사항)
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

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

  // 작성자 여부 확인
  const isWriter = currentUserNickname === writerNickname;

  // 댓글 삭제
  const handleDelete = async () => {
    if (!window.confirm('정말 댓글을 삭제하시겠습니까?')) return;
    if (onDelete) await onDelete(commentId); // 부모 콜백 호출
    closeMenu();
  };

  // 댓글 수정
  const handleEdit = () => {
    if (onEdit) onEdit(commentId); // 부모 콜백 호출
    closeMenu();
  };

  // 댓글 신고
  const handleReport = () => {
    if (onReport) {
      onReport(commentId);
    } else {
      alert('신고 기능 준비 중입니다.');
    }
    closeMenu();
  };

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
                onClick={handleEdit}
                className="w-full px-4 py-2 text-sm hover:bg-gray-100"
              >
                수정하기
              </button>
            </>
          ) : (
            <button
              onClick={handleReport}
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

export default CommentActionModal;
