import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaHome, FaEnvelope } from "react-icons/fa";
import { AiFillProfile } from "react-icons/ai";
import "../Footer.css";

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isMessageDetailPage = location.pathname.includes("/message-details/");

  const ClickHome = () => {
    navigate(`/home`);
  };
  const ClickMessage = () => {
    navigate(`/message`);
  };
  const ClickMyPage = () => {
    navigate(`/mypage`);
  };

  return (
    !isMessageDetailPage && (
      <div className="btm-nav">
        <button onClick={ClickHome} className={`text-primary ${location.pathname === '/home' ? 'active' : ''}`}>
          <FaHome className="h-5 w-5" />
        </button>
        <button onClick={ClickMessage} className={`text-primary ${location.pathname === '/message' ? 'active' : ''}`}>
          <FaEnvelope className="h-5 w-5" />
        </button>
        <button onClick={ClickMyPage} className={`text-primary ${(location.pathname === '/mypage' || location.pathname === '/userprofile') ? 'active' : ''}`}>
          <AiFillProfile className="h-5 w-5" />
        </button>
      </div>
    )
  );
};

export default Footer;
