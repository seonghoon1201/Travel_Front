import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const KakaoCallbackPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const url = new URL(window.location.href);
    const token = url.searchParams.get("token");
    const nickname = url.searchParams.get("nickname");
    const profileImage = url.searchParams.get("profileImage");

    if (token && nickname) {
      // ✅ 정보 저장 (예: localStorage, Zustand, Redux 등)
      localStorage.setItem("accessToken", token);
      localStorage.setItem("nickname", nickname);
      localStorage.setItem("profileImage", profileImage || "");

      // ✅ 메인 페이지로 이동
      navigate("/");
    } else {
      alert("로그인 실패: 사용자 정보를 받아올 수 없습니다.");
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="flex justify-center items-center h-screen">
      <p className="text-gray-600">로그인 처리 중입니다...</p>
    </div>
  );
};

export default KakaoCallbackPage;
