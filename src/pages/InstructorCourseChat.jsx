import React, { useEffect, useState, useContext, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import { Send, ChevronLeft } from "lucide-react";

const WS_URL = "ws://127.0.0.1:8000";
const BASE_URL = "https://codifi-backendend-new.onrender.com";

export default function InstructorCourseChat() {
  const { chatroom_id } = useParams();     // important: use chatroom_id instead of course_id
  const { tokens, user } = useContext(AuthContext);

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [typing, setTyping] = useState(false);
  const [heroAnim, setHeroAnim] = useState(null);

  const navigate = useNavigate();
  const chatEndRef = useRef(null);
  const socketRef = useRef(null);

  // Load typing animation
  useEffect(() => {
    async function markRead() {
      await fetch(`${BASE_URL}/api/chat/${chatroom_id}/mark-read/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${tokens?.access}`,
        },
      });
    }

    markRead();
  }, [chatroom_id]);


  // Connect WebSocket
  useEffect(() => {
    if (!tokens?.access) return;

    const socket = new WebSocket(
      `${WS_URL}/ws/chat/${chatroom_id}/?token=${tokens.access}`
    );

    socketRef.current = socket;

    socket.onopen = () => {
      console.log("🟢 WebSocket connected");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      // Chat history
      if (data.type === "chat_history") {
        setMessages(data.messages);
        return;
      }

      // New realtime message
      if (data.type === "chat_message") {
        setMessages((prev) => [
          ...prev,
          {
            sender: data.sender,
            content: data.message,
            timestamp: data.timestamp,
          },
        ]);
      }
    };

    socket.onclose = () => {
      console.log("🔴 WebSocket disconnected. Reconnecting...");
    };

    return () => socket.close();
  }, [chatroom_id]);

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    socketRef.current?.send(
      JSON.stringify({
        message: message.trim(),
      })
    );

    setMessage("");
    setTyping(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-4">
      <div className="flex flex-col h-[85vh] max-w-3xl mx-auto mt-20 
        bg-white dark:bg-gray-900 
        border border-gray-200 dark:border-gray-700 
        rounded-xl shadow-2xl overflow-hidden">

        {/* HEADER */}
        <div className="flex items-center gap-3 p-4 
            bg-gradient-to-r from-blue-600 to-indigo-600 
            dark:from-blue-700 dark:to-indigo-700
            text-white font-semibold text-lg">
          <button onClick={() => navigate(-1)}>
            <ChevronLeft className="w-5 h-5 opacity-70" />
          </button>
          Chat with Student
        </div>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto p-4 
            bg-gray-50 dark:bg-gray-800/50 backdrop-blur-xl">
          
          {messages.map((msg, index) => {
            const isYou = msg.sender === user.username;

            return (
              <div
                key={index}
                className={`flex mb-5 ${isYou ? "justify-end" : "justify-start"}`}
              >
                {!isYou && (
                  <img
                    src={`https://ui-avatars.com/api/?name=${msg.sender}&background=random`}
                    className="w-9 h-9 rounded-full shadow-md"
                  />
                )}

                <div
                  className={`max-w-[70%] px-4 py-2 rounded-2xl shadow-md 
                      ${isYou
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none"
                      }
                  `}
                >
                  <p className="text-sm">{msg.content}</p>
                  <p className="text-[11px] opacity-70 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                {isYou && (
                  <img
                    src={`https://ui-avatars.com/api/?name=${user.username}`}
                    className="w-9 h-9 rounded-full shadow-md ml-2"
                  />
                )}
              </div>
            );
          })}

          <div ref={chatEndRef}></div>
        </div>

        {/* INPUT */}
        <form
          onSubmit={sendMessage}
          className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                setTyping(true);
                
              }}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 rounded-xl 
                bg-gray-100 dark:bg-gray-800 
                text-gray-900 dark:text-gray-100 
                focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />

            <button
              type="submit"
              className="p-3 rounded-xl bg-blue-600 dark:bg-blue-700 
                hover:bg-blue-700 dark:hover:bg-blue-600 
                text-white shadow-lg transition"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
