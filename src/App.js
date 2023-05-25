import { useEffect, useState, useCallback } from "react";
import { UserProfileContext } from "./context/UserProfileContext";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import SignUp from "./pages/signup/Signup";
import Mypage from "./pages/mypage/mypage";
import UserProfile from "./pages/userprofile/UserProfile";
import Login from "./pages/login/Login.js";
import Home from "./pages/home/Home";
import Message from "./pages/message/Message";
import MessageDetail from "./pages/message/MessageDetails";
import Footer from "./components/Footer";
import "./App.css";
import { firebase } from "./firebaseConfig";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasUserProfile, setHasUserProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isHidden, setIsHidden] = useState(false);

  const checkUserProfile = useCallback(async (uid) => {
    const userProfileDoc = await firebase
      .firestore()
      .collection("users")
      .doc(uid)
      .get();
    setHasUserProfile(userProfileDoc.exists);
  }, []);

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        setIsLoggedIn(true);
        await checkUserProfile(user.uid);
      } else {
        setIsLoggedIn(false);
        setHasUserProfile(false);
      }
      setLoading(false);
    });

    return () => unsubscribe(); // Unsubscribe from the listener when the component is unmounting.
  }, [checkUserProfile]);

  if (loading) {
    return <div>Loading...</div>; // 認証状態とプロフィールの存在チェックが完了するまでの間にローディング画面を表示
  }

  const handleHideFooter = () => {
    setIsHidden(true);
  };

  return (
    <Router>
      <div>
        <UserProfileContext.Provider value={{ setHasUserProfile }}>
          <Routes>
            <Route
              path="/signup"
              element={
                isLoggedIn ? (
                  hasUserProfile ? (
                    <Navigate to="/home" replace />
                  ) : (
                    <Navigate to="/userprofile" replace />
                  )
                ) : (
                  <SignUp />
                )
              }
            />
            <Route
              path="/mypage"
              element={
                isLoggedIn && hasUserProfile ? (
                  <Mypage />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/home"
              element={
                isLoggedIn && hasUserProfile ? (
                  <Home />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/userprofile"
              element={
                isLoggedIn ? <UserProfile /> : <Navigate to="/login" replace />
              }
            />

            <Route
              path="/login"
              element={
                isLoggedIn ? (
                  hasUserProfile ? (
                    <Navigate to="/home" replace />
                  ) : (
                    <Navigate to="/userprofile" replace />
                  )
                ) : (
                  <Login />
                )
              }
            />
            <Route
              path="/message"
              element={
                isLoggedIn && hasUserProfile ? (
                  <Message />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/message-details/:messageId"
              element={
                isLoggedIn && hasUserProfile ? (
                  isHidden ? null : (
                    <MessageDetail onHideFooter={handleHideFooter} />
                  )
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/"
              element={
                isLoggedIn ? (
                  hasUserProfile ? (
                    <Navigate to="/home" replace />
                  ) : (
                    <Navigate to="/userprofile" replace />
                  )
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
          </Routes>
        </UserProfileContext.Provider>
        {isLoggedIn && hasUserProfile && !isHidden && <Footer />}
      </div>
    </Router>
  );
}
