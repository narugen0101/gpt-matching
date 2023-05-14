// Logout.js
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { doSignOut } from "./SignOut";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const signOut = async () => {
      if (await doSignOut()) {
        navigate("/login");
      }
    };
    signOut();
  }, [navigate]);

  return <></>;
};

export default Logout;
