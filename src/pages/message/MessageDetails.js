import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, auth } from "../../firebaseConfig";
import { useAuthState } from "react-firebase-hooks/auth";
import { format, isSameDay } from "date-fns";
import { FaChevronLeft } from "react-icons/fa";

const MessageDetail = () => {
  const { messageId } = useParams();
  const [user] = useAuthState(auth);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const [otherUserName, setOtherUserName] = React.useState("");

  useEffect(() => {
    const fetchSenderInfo = async (message) => {
      const senderSnapshot = await db
        .collection("users")
        .doc(message.sender)
        .get();
      const senderData = senderSnapshot.data();
      const timestamp = message.timestamp?.toDate?.()
        ? message.timestamp.toDate()
        : null;
      return {
        ...message,
        displayName: senderData.name,
        photoURL: senderData.photo1,
        timestamp,
        timestampStr: timestamp
          ? format(timestamp, "yyyy年MM月dd日 HH:mm")
          : "",
        dateStr: timestamp ? format(timestamp, "yyyy年MM月dd日") : "",
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);
  

  const sendMessage = async (e) => {
    e.preventDefault();
  
    if (newMessage.trim() === "") {
      return;
    }
  
    await db
      .collection("messages")
      .doc(messageId)
      .update({
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
    scrollToBottom();
  };
  

  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const getOtherUserDisplayName = async () => {
      const docSnapshot = await db.collection("messages").doc(messageId).get();
      const users = docSnapshot.data().users;
      const otherUserId = users.find(userId => userId !== user.uid);
      if (otherUserId) {
        const otherUserSnapshot = await db.collection("users").doc(otherUserId).get();
        const otherUserData = otherUserSnapshot.data();
        if (otherUserData) {
          return otherUserData.name;
        }
      }
      return "";
    };
  
    getOtherUserDisplayName().then(name => {
      setOtherUserName(name);
    });
  }, [messageId, user]);

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-4 py-2 border-b bg-black">
        <div className="w-10">
          <FaChevronLeft
            className="text-lg cursor-pointer"
            onClick={handleGoBack}
          />
        </div>
        <div className="flex justify-center w-full">
          <h3 className="text-xl text-white">{otherUserName}</h3>
        </div>
        <div className="w-10"></div>
      </div>
  
      <div className="flex-grow overflow-y-auto pt-16 pb-20">
      {messages.map((message, index, array) => (
          <React.Fragment key={index}>
            {index === 0 ||
            !isSameDay(message.timestamp, array[index - 1].timestamp) ? (
              <div className="badge badge-outline my-2 text-center w-full">
                {message.dateStr}
              </div>
            ) : null}
            <div
              className={`chat ${
                message.sender === user.uid ? "chat-end" : "chat-start"
              }`}
            >
              <div className="chat-image">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  <img
                    src={message.photoURL}
                    alt="profile"
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
              <div className="chat-header">
                {message.displayName}
                <time className="text-xs opacity-50 ml-2">
                  {format(message.timestamp, "HH:mm")}
                </time>
              </div>
              <div className="chat-bubble">{message.content}</div>
              <div className="chat-footer opacity-50">
                {message.sender === user.uid && message.seen
                  ? `Seen at ${format(message.seenAt, "HH:mm")}`
                  : ""}
              </div>
            </div>
          </React.Fragment>
        ))}
        <div ref={messagesEndRef} />
      </div>
  
      <form onSubmit={sendMessage} className="fixed bottom-0 left-0 right-0 p-4">
        <div className="mx-auto md:w-3/4 lg:w-1/2">
          <div className="flex items-center">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="メッセージを入力しましょう"
              className="flex-grow mr-4 p-2 input input-bordered input-primary"
            />
            <button type="submit" className="btn btn-primary">
              Send
            </button>
          </div>
        </div>
      </form>
    </div>
  )

  
};

export default MessageDetail;
