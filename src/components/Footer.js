import React from "react";
import { useNavigate} from "react-router-dom";
import { FaHome, FaEnvelope } from "react-icons/fa";
import { AiFillProfile } from "react-icons/ai";
import "../Footer.css";

const Footer = () => {
  const navigate = useNavigate();
  const location = window.location.pathname;

  const isMessageDetailPage = location.includes("/message-details/");

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
      <div className="footer">
        <div className="footer-container">
          <FaHome className="footer-icon" onClick={ClickHome} />
          <FaEnvelope className="footer-icon" onClick={ClickMessage} />
          <AiFillProfile className="footer-icon" alt="mypage" onClick={ClickMyPage} />
        </div>
      </div>
    )
  );
};

export default Footer;
