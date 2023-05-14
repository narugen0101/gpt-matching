import React from "react";
import { firebase, auth } from "../../firebaseConfig";
import { useNavigate } from "react-router-dom";

const SignUp = () => {
  const navigate = useNavigate();
  const handleGoogleSignUp = async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
      await auth.signInWithPopup(provider);
      navigate("/userprofile");
    } catch (error) {
      console.error("Error during Google sign up:", error);
    }
  };

  return (
    <div>
      <h1>Sign Up</h1>
      <button onClick={handleGoogleSignUp}>
        Sign Up with Google
      </button>
    </div>
  );
};

export default SignUp;
