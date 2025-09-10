import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ellipsis } from 'lucide-react';
import { deleteDiary } from '../../api/board/deleteDiary';
import useUserStore from '../../store/userStore';
import ConfirmModal from '../modal/ConfirmModal';
import { message } from 'antd';

const PostActionModal = ({ id, writerNickname }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false); 
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const currentUserNickname = useUserStore((state) => state.nickname);

  const [messageApi, contextHolder] = message.useMessage();

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

  // 삭제 실행
  const confirmDelete = async () => {
    try {
      await deleteDiary(id);
      messageApi.success('삭제 완료되었습니다.');
      navigate('/board/travel/diary');
    } catch (err) {
      console.error(err);
      messageApi.error('삭제에 실패했습니다.');
    } finally {
      setShowConfirm(false);
      closeMenu();
    }
  };

  const isWriter = currentUserNickname === writerNickname;

  return (
    <div className="relative inline-block" ref={menuRef}>
      {contextHolder}

      <button onClick={toggleMenu} className="text-gray-500 text-xl">
        <Ellipsis />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-28 bg-white border border-gray-200 rounded-md shadow-lg z-50">
          {isWriter ? (
            <>
              <button
                onClick={() => setShowConfirm(true)}
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
                messageApi.info('신고가 접수되었습니다.');
                closeMenu();
              }}
              className="w-full px-4 py-2 text-sm hover:bg-gray-100"
            >
              신고하기
            </button>
          )}
        </div>
      )}

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmDelete}
        title="게시글 삭제"
        message="정말 삭제하시겠습니까?"
        confirmText="삭제"
        cancelText="취소"
        confirmButtonClass="bg-red-500 hover:bg-red-600"
      />
    </div>
  );
};

export default PostActionModal;
