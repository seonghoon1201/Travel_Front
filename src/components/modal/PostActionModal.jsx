import { useEffect, useRef, useState } from "react";
import { Ellipsis } from "lucide-react";

const PostActionModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  const toggleMenu = () => setIsOpen((prev) => !prev);
  const closeMenu = () => setIsOpen(false);

  // 바깥 클릭 시 닫히기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={menuRef}>
      {/* ... 버튼 */}
      <button onClick={toggleMenu} className="text-gray-500 text-xl">
        <Ellipsis />
      </button>

      {/* 팝업 메뉴 - 로그인 토큰 연동 후 수정 */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-28 bg-white border border-gray-200 rounded-md shadow-lg z-50">
          <button
            onClick={() => { alert("신고"); closeMenu(); }}
            className="w-full px-4 py-2 text-sm hover:bg-gray-100"
          >
            신고하기
          </button>
          <button
            onClick={() => { alert("삭제"); closeMenu(); }}
            className="w-full px-4 py-2 text-sm hover:bg-gray-100"
          >
            삭제하기
          </button>
          <button
            onClick={() => { alert("수정"); closeMenu(); }}
            className="w-full px-4 py-2 text-sm hover:bg-gray-100"
          >
            수정하기
          </button>
        </div>
      )}
    </div>
  );
};

export default PostActionModal;
