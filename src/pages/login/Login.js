import React from "react";
import { useNavigate } from "react-router-dom";
import { auth, firebase, db } from "../../firebaseConfig";

const Login = () => {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    const provider = new firebase.auth.GoogleAuthProvider();

    try {
      const result = await auth.signInWithPopup(provider);
      const uid = result.user.uid;

      const userProfileDoc = await db.collection("users").doc(uid).get();

      if (userProfileDoc.exists) {
        navigate("/home");
      } else {
        navigate("/userprofile");
      }
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        alert("アカウント情報が存在しません。");
      } else {
        console.error("Error during Google login:", error);
      }
    }
  };

  return (
    <div>
      <div>
        <h1>Login</h1>
        <button onClick={handleGoogleLogin}>Login with Google</button>
      </div>
    </div>
  );
};

export default Login;
