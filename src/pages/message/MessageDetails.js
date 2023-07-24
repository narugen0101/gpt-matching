import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, auth } from "../../firebaseConfig";
import { useAuthState } from "react-firebase-hooks/auth";
import { format, isSameDay } from "date-fns";
import { FaChevronLeft } from "react-icons/fa";
import axios from "axios";
import { formatMessages } from "../../utils/formatMessages";
import { insertDynamicPartsIntoPrompt } from "../../utils/insertDynamicPartsIntoPrompt"

const MessageDetail = () => {
  const { messageId } = useParams();
  const [user] = useAuthState(auth);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const [otherUserName, setOtherUserName] = React.useState("");
  const [isFocused, setFocused] = useState(false);
  const [isloading, setloading] = useState(false);

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
      const otherUserId = users.find((userId) => userId !== user.uid);
      if (otherUserId) {
        const otherUserSnapshot = await db
          .collection("users")
          .doc(otherUserId)
          .get();
        const otherUserData = otherUserSnapshot.data();
        if (otherUserData) {
          return otherUserData.name;
        }
      }
      return "";
    };

    getOtherUserDisplayName().then((name) => {
      setOtherUserName(name);
    });
  }, [messageId, user]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleFocus = () => {
    setFocused(true);
  };

  const handleBlur = () => {
    if (setloading(false)) {
      setFocused(false);
    }
  };

  const createAiText = async () => {
    setloading(true);
    const serverEndpoint = "https://api.openai.com/v1/chat/completions";
  
    // Fetch the prompt template from Firebase Firestore
    const promptDoc = await db.collection('prompts').doc('1Pr8ZQIaoWtRshr9l4uE').get();
    const promptTemplate = promptDoc.data().content;  // Adjusted field name here
  
    const formattedMessages = formatMessages(messages, user.uid);
    console.log(`fomatted:¥n${formattedMessages}`);
  
    // Prepare the actual prompt by inserting formattedText and newMessage into the template
    const prompt = insertDynamicPartsIntoPrompt(promptTemplate, formattedMessages, newMessage);
  
    console.log(prompt);
  
    try {
      const response = await axios.post(
        serverEndpoint,
        {
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_OPEN_AI_API_KEY}`,
          },
        }
      );
  
      const aiMessage = JSON.parse(response.data.choices[0].message.content);
      console.log(aiMessage)
      setNewMessage(aiMessage.output);
    } catch (error) {
      console.error(error);
    }
  
    setloading(false);
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

      <form
        onSubmit={sendMessage}
        className="fixed bottom-0 left-0 right-0 p-4"
      >
        {isFocused && (
          <div className="w-full h-24 flex items-center justify-center bg-black bg-opacity-50">
            {isloading ? (
              <button className="btn">
                <svg
                  aria-hidden="true"
                  className="inline w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-pink-600"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill"
                  />
                </svg>
                Loading
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={async (event) => {
                  // async event handler
                  event.preventDefault(); // prevent the default form submission
                  await createAiText(); // call the creatAiText function
                }}
              >
                Aiで作成✨
              </button>
            )}
          </div>
        )}

        <div className="mx-auto md:w-3/4 lg:w-1/2">
          <div className="flex items-center">
            <input
              type="text"
              value={newMessage}
              onFocus={handleFocus}
              onBlur={handleBlur}
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
  );
};

export default MessageDetail;
