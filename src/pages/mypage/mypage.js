import { useAuthState } from "react-firebase-hooks/auth";
import { useEffect, useState } from "react";
import { count, firebase } from "../../firebaseConfig";
import { useNavigate } from "react-router-dom";
import { doSignOut } from "../logout/SignOut";
import "daisyui/dist/full.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBirthdayCake,
  faWeight,
  faRulerVertical,
  faInfoCircle,
  faMapMarkerAlt,
} from "@fortawesome/free-solid-svg-icons";

const Counters = ({ userData }) => {
  return (
    <div className="text-center stats shadow">
      <div className="stat">
        <div className="stat-figure text-primary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="inline-block w-8 h-8 stroke-current"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            ></path>
          </svg>
        </div>
        <div className="stat-title">マッチ回数</div>
        <div className="stat-value text-primary">{userData.matchedCount}</div>
      </div>

      <div className="stat">
        <div className="stat-figure text-secondary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="inline-block w-8 h-8 stroke-current"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            ></path>
          </svg>
        </div>
        <div className="stat-title">いいね回数</div>
        <div className="stat-value text-secondary">{userData.likedCount}</div>
      </div>

      <div className="stat">
        <div className="stat-title">いいねされた数</div>
        <div className="stat-value">{userData.likedByCount}</div>
      </div>
    </div>
  );
};

const Mypage = () => {
  const [user] = useAuthState(firebase.auth());
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getUserData = async () => {
      const userDocRef = firebase.firestore().doc(`users/${user.uid}`);
      const userDoc = await userDocRef.get();
      const userData = userDoc.data();
      const matchedCount = await count("likes", "likedUid", "==", user.uid);
      const likedCount = await count("likes", "uid", "==", user.uid);
      const likedByCount = await count("likes", "likedUid", "==", user.uid);
      setUserData({ ...userData, matchedCount, likedCount, likedByCount });
    };
    if (user) {
      getUserData();
    }
  }, [user]);

  const handleSignOut = async () => {
    if (await doSignOut()) {
      navigate("/login");
    }
  };

  const getAge = (birthdate) => {
    const birthDateObj = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDateObj.getDate())
    ) {
      age--;
    }
    return age;
  };

  return (
    <div className="mt-10 w-full max-w-md mx-auto flex flex-col items-center">
      {userData && (
        <div className="card bg-primary text-primary-content mt-300 mb-20 w-4/5 p-4">
          <div className="relative w-full h-48 flex items-center justify-center mb-2">
            <div className="absolute inset-0 w-full h-full flex items-center justify-center z-0">
              <div className="carousel rounded-box w-full">
                {userData.remainingPhotos.map((photo, index) => (
                  <div key={index} className="carousel-item w-full">
                    <img
                      src={photo}
                      alt={`remainingPhoto-${index}`}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
            <img
              src={userData.photo1}
              alt="profile"
              className="absolute rounded-full h-32 w-32 z-10"
            />
          </div>
          <h2 className="text-2xl mb-2 text-center">{userData.name}</h2>

          <Counters userData={userData} />
          <br></br>
          <div className="divide-y divide-gray-300">
            <div className="py-2">
              <div className="font-semibold flex items-center">
                <FontAwesomeIcon icon={faBirthdayCake} className="mr-2" />
                年齢
              </div>
              <div>{getAge(userData.birthdate)}歳</div>
            </div>
            <div className="py-2">
              <div className="font-semibold flex items-center">
                <FontAwesomeIcon icon={faWeight} className="mr-2" />
                体型
              </div>
              <div>{userData.weight}</div>
            </div>
            <div className="py-2">
              <div className="font-semibold flex items-center">
                <FontAwesomeIcon icon={faRulerVertical} className="mr-2" />
                身長
              </div>
              <div>{userData.height} cm</div>
            </div>
            <div className="py-2">
              <div className="font-semibold flex items-center">
                <FontAwesomeIcon icon={faInfoCircle} className="mr-2" />
                自己紹介
              </div>
              <div>{userData.bio}</div>
            </div>
            <div className="py-2">
              <div className="font-semibold flex items-center">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
                住んでいる地域
              </div>
              <div>{userData.hometown}</div>
            </div>
          </div>

          <div className="flex justify-center mt-6">
            <button
              className="btn btn-accent mr-2"
              onClick={() =>
                navigate("/userprofile", { state: { edit: true } })
              }
            >
              Edit
            </button>
            <button className="btn btn-outline" onClick={handleSignOut}>
              ログアウト
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mypage;
