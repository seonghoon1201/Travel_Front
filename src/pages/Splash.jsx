import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

const Splash = () => {
  const [fadeOut, setFadeOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFadeOut(true); 
    }, 1500);

    const navTimer = setTimeout(() => {
      navigate("/home");
    }, 2500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(navTimer);
    };
  }, [navigate]);

  return (
    <div
      className={`bg-white h-screen w-screen flex items-center justify-center transition-opacity duration-1000 ${
        fadeOut ? "animate-fadeOut" : "animate-fadeIn"
      }`}
    >
      <img src={logo} alt="여담 로고" className="w-48 h-auto" />
    </div>
  );
};

export default Splash;
