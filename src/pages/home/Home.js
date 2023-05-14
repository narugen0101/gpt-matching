import React, { useState, useEffect } from "react";
import { db, auth, firebase } from "../../firebaseConfig";
import { useAuthState } from "react-firebase-hooks/auth";
import UserCard from "../../components/UserCard";
import UserDetails from "../../components/UserDetails";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

const Home = () => {
  const [users, setUsers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [user] = useAuthState(auth);
  const [likedUsers, setLikedUsers] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const usersSnapshot = await db.collection("users").get();
        const usersData = usersSnapshot.docs
          .map((doc) => ({
            ...doc.data(),
            id: doc.id,
          }))
          .filter((u) => u.id !== user.uid);
        setUsers(usersData);
        const likesSnapshot = await db
          .collection("likes")
          .where("uid", "==", user.uid)
          .get();
        const likedUsersData = likesSnapshot.docs.map(
          (doc) => doc.data().likedUid
        );
        setLikedUsers(likedUsersData);
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleButtonClick = async (isYes) => {
    if (remainingUsers.length === 0) {
      return;
    }
    if (isYes) {
      const targetUser = remainingUsers[currentIndex];
      let currentUserLikes = await db
        .collection("likes")
        .where("uid", "==", user.uid)
        .where("likedUid", "==", targetUser.id)
        .get();
      const targetUserLikes = await db
        .collection("likes")
        .where("uid", "==", targetUser.id)
        .where("likedUid", "==", user.uid)
        .get();

      if (currentUserLikes.empty) {
        const newLikeRef = await db.collection("likes").add({
          uid: user.uid,
          likedUid: targetUser.id,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        const newLikeDoc = await newLikeRef.get();
        currentUserLikes = {
          docs: [newLikeDoc],
        };
      }

      if (!targetUserLikes.empty) {
        if (currentUserLikes.empty) {
          const newLikeRef = await db.collection("likes").add({
            uid: user.uid,
            likedUid: targetUser.id,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          });
          const newLikeDoc = await newLikeRef.get();
          currentUserLikes = {
            docs: [newLikeDoc],
          };
        }

        const currentUserLike = currentUserLikes.docs[0];
        const targetUserLike = targetUserLikes.docs[0];
        const messageId = uuidv4();
        await db
          .collection("messages")
          .doc(messageId)
          .set({
            users: [user.uid, targetUser.id],
            messages: [],
          });
        await currentUserLike.ref.update({
          matched: true,
          matchId: messageId,
        });
        await targetUserLike.ref.update({
          matched: true,
          matchId: messageId,
        });
        alert(`マッチングしました！ こちら でメッセージを開始しましょう。`);
        navigate(`/message-details/${messageId}`);
      }

      setLikedUsers([...likedUsers, targetUser.id]);
    }

    const nextIndex = (currentIndex + 1) % remainingUsers.length;
    setCurrentIndex(nextIndex);
    setShowDetails(false);
  };

  const handleCardClick = () => {
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
  };

  const remainingUsers = users.filter((u) => !likedUsers.includes(u.id));

  return (
    <div>
      <h1>Home</h1>
      <div className="h-screen flex justify-center items-center mx-8 mb-20">
        {loading ? (
          <div className="loader">Loading...</div>
        ) : remainingUsers.length > 0 ? (
          <div>
            {!showDetails && (
              <>
                {remainingUsers[currentIndex] && (
                  <UserCard
                    user={remainingUsers[currentIndex]}
                    onClick={handleCardClick}
                    className="rounded"
                  />
                )}
                <button
                  className="btn btn-circle"
                  onClick={() => handleButtonClick(false)}
                >
                  x
                </button>
                <button
                  className="btn gap-2 w-10 h-10"
                  onClick={() => handleButtonClick(true)}
                >
                  ❤︎
                </button>
              </>
            )}
            {showDetails && (
              <UserDetails
                user={remainingUsers[currentIndex]}
                onClose={handleCloseDetails}
              />
            )}
          </div>
        ) : (
          <p className="text-center text-lg">
            現在表示できるユーザーがいません。
          </p>
        )}
      </div>
    </div>
  );
};

export default Home;
