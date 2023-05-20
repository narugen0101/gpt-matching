import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock } from "@fortawesome/free-solid-svg-icons";
import { firebase, auth, db } from "../../firebaseConfig";
import { useNavigate } from "react-router-dom";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  const handleEmailSignUp = async (event) => {
    event.preventDefault();
    try {
      const result = await auth.createUserWithEmailAndPassword(email, password);
      const uid = result.user.uid;

      const userProfileDoc = await db.collection("users").doc(uid).get();

      if (userProfileDoc.exists) {
        navigate("/home");
      } else {
        navigate("/userprofile");
      }
    } catch (error) {
      alert('error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            サインアップ
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleEmailSignUp}>
          <input type="hidden" name="remember" defaultValue="true" />
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                メールアドレス
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon
                    icon={faEnvelope}
                    className="text-gray-400"
                  />
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`input input-bordered input-primary w-full pl-10 mb-2 ${
                    !email && "input-error"
                  }`}
                  placeholder="メールアドレス"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-4">
              <label htmlFor="password" className="sr-only">
                パスワード
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faLock} className="text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className={`input input-bordered input-primary w-full pl-10 ${
                    !password && "input-error"
                  }`}
                  placeholder="パスワード"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="mt-6">
            <button
              type="submit"
              className="btn btn-outline btn-primary w-full"
              disabled={!email || !password}
            >
              サインアップ
            </button>
          </div>

          <div className="mt-6">
            <button
              onClick={handleGoogleSignUp}
              className="btn btn-info w-full flex items-center justify-center"
            >
              <img
                className="w-6 h-6 mr-2"
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                loading="lazy"
                alt="google logo"
              ></img>
              Sign Up with Google
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm">
              すでにアカウントをお持ちですか?{" "}
              <a
                href="/login"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                こちらからログイン
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
