import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db, auth } from "../../firebaseConfig";
import { useAuthState } from "react-firebase-hooks/auth";

const MessageDetail = () => {
  const { messageId } = useParams();
  const [user] = useAuthState(auth);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const fetchSenderInfo = async (message) => {
      const senderSnapshot = await db.collection("users").doc(message.sender).get();
      const senderData = senderSnapshot.data();
      return {
        ...message,
        displayName: senderData.name,
        photoURL: senderData.photo1,
        timestamp: message.timestamp?.toDate?.() ? message.timestamp.toDate().toLocaleString() : "",
      };
    };

    if (user) {
      const unsubscribe = db
        .collection("messages")
        .doc(messageId)
        .onSnapshot(async (snapshot) => {
          const messageData = snapshot.data()?.messages || [];
          const messagesWithSenderInfo = await Promise.all(
            messageData.map(fetchSenderInfo)
          );
          setMessages(messagesWithSenderInfo);
        });

      return () => {
        unsubscribe();
      };
    }
  }, [user, messageId]);

  const sendMessage = async (e) => {
    e.preventDefault();

    if (newMessage.trim() === "") {
      return;
    }

    await db.collection("messages").doc(messageId).update({
      messages: [
        ...messages,
        {
          sender: user.uid,
          content: newMessage,
          timestamp: new Date(),
        },
      ],
    });

    setNewMessage("");
  };

  return (
    <div>
      <h1>Message Detail</h1>
      <div>
        {messages.map((message, index) => (
          <div
            key={index}
            className={`chat ${message.sender === user.uid ? "chat-end" : "chat-start"}`}
          >
            <div className="chat-image">
              <div className="">
                <img src={message.photoURL} alt="profile" className="object-cover w-full h-full" />
              </div>
            </div>
            <div className="chat-header">
              {message.displayName}
              <time className="text-xs opacity-50">
                {message.timestamp}
              </time>
            </div>
            <div className="chat-bubble">{message.content}</div>
            <div className="chat-footer opacity-50">
              {message.sender === user.uid
                ? message.seen
                  ? `Seen at ${message.seenAt}`
                  : "Delivered"
                : ""}
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message here..."
          className="input input-bordered input-primary w-full max-w-xs"
        />
        <button type="submit" className="btn btn-primary">Send</button>
      </form>
    </div>
  );
};

export default MessageDetail;
