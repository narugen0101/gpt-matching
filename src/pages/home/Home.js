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
  const [gender, setGender] = useState(null);

  useEffect(() => {
    const fetchUserGender = async () => {
      if (user) {
        const userRef = db.collection('users').doc(user.uid);
        const userDoc = await userRef.get();
        if (userDoc.exists) {
          setGender(userDoc.data().gender);
        }
      }
    };
    fetchUserGender();
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      if (user && gender) {
        const usersSnapshot = await db.collection("users").get();
        const usersData = usersSnapshot.docs
          .map((doc) => ({
            ...doc.data(),
            id: doc.id,
          }))
          .filter((u) => u.id !== user.uid && u.gender !== gender) // Modify this line
          .sort(() => Math.random() - 0.5);
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
  }, [user, gender]);


  
  


  const handleButtonClick = async (isYes) => {
    console.log('handleButtonClickが起動しました')
    if (remainingUsers.length === 0) {
      return;
    }
    const targetUser = remainingUsers[currentIndex];
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
    } else {
      // 「X」ボタンが押されたときのロジック
      // 「いいえ」としたユーザーをdislikesコレクションに追加
      const currentUserDislikes = await db
        .collection("dislikes")
        .where("uid", "==", user.uid)
        .where("dislikedUid", "==", targetUser.id)
        .get();
        
      if (currentUserDislikes.empty) {
        await db.collection("dislikes").add({
          uid: user.uid,
          dislikedUid: targetUser.id,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
      }}

      setTimeout(() => {
        const nextIndex = (currentIndex + 1) % remainingUsers.length;
        setCurrentIndex(nextIndex);
        setShowDetails(false);
        console.log("handlebuttonSubmitが終了")
      }, 0);
  };

  const handleCardClick = () => {
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
  };

  const remainingUsers = users.filter((u) => !likedUsers.includes(u.id));

  return (
    <div style={{overflowY: "hidden"}}>
      <div className="h-screen flex justify-center items-center mx-8">
        {loading ? (
          <div className="loader">Loading...</div>
        ) : remainingUsers.length > 0 ? (
          <div>
            {!showDetails && (
              <>
                {remainingUsers[currentIndex] && (
                  <div className="flex flex-col items-center">
                    
                      <UserCard
                        user={remainingUsers[currentIndex]}
                        onClick={handleCardClick}
                        className="rounded mb-4"
                      />
                    
                    <div>
                      <button
                        className="btn btn-circle mr-2"
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
                    </div>
                  </div>
                )}
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