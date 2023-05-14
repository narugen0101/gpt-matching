import React, { useState, useEffect } from "react";
import { db, auth } from "../../firebaseConfig";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";

const Message = () => {
  const [user] = useAuthState(auth);
  const [matchedUsers, setMatchedUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const likesSnapshot = await db
          .collection("likes")
          .where("uid", "==", user.uid)
          .where("matched", "==", true)
          .get();

        const matchedUserPromises = likesSnapshot.docs.map(async (doc) => {
          const targetUserId = doc.data().likedUid;
          const targetUserSnapshot = await db.collection("users").doc(targetUserId).get();
          const matchId = doc.data().matchId;
          const messagesSnapshot = await db.collection("messages").doc(matchId).get();
          const messages = messagesSnapshot.data()?.messages || [];
          const lastMessage = messages[messages.length - 1] || {};
          return {
            ...targetUserSnapshot.data(),
            id: targetUserId,
            matchId,
            lastMessage: lastMessage.content || "",
            lastMessageDate: lastMessage.timestamp?.toDate().toLocaleString() || "",
          };
        });

        const matchedUsersData = await Promise.all(matchedUserPromises);
        setMatchedUsers(matchedUsersData);
      }
    };
    fetchData();
  }, [user]);

  const handleUserClick = (matchId) => {
    navigate(`/message-details/${matchId}`);
  };

  return (
    <div>
      <h1>Messages</h1>
      <ul className="menu bg-base-100 w-56">
        {matchedUsers.map((matchedUser) => (
          <li
            key={matchedUser.id}
            onClick={() => handleUserClick(matchedUser.matchId)}
            className="py-2"
          >
            <button className="flex items-center w-full text-left">
              <img
                src={matchedUser.photo1}
                alt="profile"
                className="w-10 h-10 rounded-full mr-4"
              />
              <div>
                <p className="font-bold">{matchedUser.name}</p>
                <p className="text-sm">{matchedUser.lastMessage}</p>
                <p className="text-xs">{matchedUser.lastMessageDate}</p>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
  
  
};

export default Message;
