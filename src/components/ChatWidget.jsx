import React, { useState, useContext, useEffect, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { X } from "lucide-react";
import Lottie from "lottie-react";
import { motion, AnimatePresence } from "framer-motion";

const BASE_URL = "https://codifi-backendend-new.onrender.com";

export default function ChatWidget() {
  const { tokens, user } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [animationData, setAnimationData] = useState(null);
  const [visible, setVisible] = useState(true);
  const chatEndRef = useRef(null);

  // ✅ Load chatbot animation
  useEffect(() => {
    const fetchAnimation = async () => {
      try {
        const res = await fetch(`${BASE_URL}/media/animations/chatbot.json`);
        if (!res.ok) throw new Error("Animation not found");
        const json = await res.json();
        setAnimationData(json);
      } catch (err) {
        console.error("Failed to load chat animation:", err);
      }
    };
    fetchAnimation();
  }, []);

  // ✅ Hide chatbot when footer is visible
  useEffect(() => {
    const footer = document.querySelector("footer");
    if (!footer) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setVisible(!entry.isIntersecting);
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  // ✅ Scroll to bottom when messages change
  useEffect(() => {
    if (chatEndRef.current)
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // ✅ Auto Greeting when chat opens
  useEffect(() => {
    if (open && messages.length === 0) {
      const greeting = user
        ? `👋 Hello ${user.username || "there"}! How can I help you with your courses today?`
        : "👋 Hi there! I’m CodiFi Assistant. How can I help you learn or explore courses?";
      setMessages([{ sender: "bot", text: greeting }]);
    }
  }, [open]);

  // ✅ Send message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/api/chatbot/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(tokens?.access && { Authorization: `Bearer ${tokens.access}` }),
        },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();
      const botMsg = {
        sender: "bot",
        text: data.response || "🤖 Sorry, I couldn’t understand that.",
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ Unable to connect right now." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 🚫 Hide chatbot for instructors/admins
  if (user && user.role !== "student") return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.4 }}
          className="fixed bottom-5 right-5 z-50"
        >
          {/* Floating Chat Button */}
          {!open && (
            <button
              onClick={() => setOpen(true)}
              className="p-0 border-none bg-transparent cursor-pointer fixed bottom-10 right-10 z-50 transition-transform duration-300 hover:scale-110"
              style={{
                width: "150px",
                height: "150px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {animationData ? (
                <Lottie
                  animationData={animationData}
                  loop
                  autoplay
                  style={{
                    width: "100%",
                    height: "100%",
                    transform: "scale(1.6)",
                    filter: "drop-shadow(0 0 12px rgba(59,130,246,0.8))",
                  }}
                />
              ) : (
                <div className="w-24 h-24 bg-blue-600 rounded-full shadow-lg"></div>
              )}
            </button>
          )}

          {/* Chat Window */}
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.3 }}
              className="w-80 h-[420px] bg-white shadow-2xl rounded-xl flex flex-col border border-gray-200 overflow-hidden"
            >
              {/* Header */}
              <div className="bg-blue-600 text-white p-3 flex justify-between items-center">
                <h3 className="font-semibold">
                  {user ? "AI Learning Assistant" : "CodiFi Assistant"}
                </h3>
                <button onClick={() => setOpen(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`p-2 rounded-lg max-w-[80%] ${
                      m.sender === "user"
                        ? "bg-blue-600 text-white self-end ml-auto"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {m.text}
                  </div>
                ))}
                {loading && (
                  <div className="text-gray-400 text-sm text-center">Thinking...</div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={sendMessage} className="p-2 border-t flex gap-2 bg-white">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    user
                      ? "Ask about your course..."
                      : "Ask about CodiFi courses..."
                  }
                  className="flex-1 border rounded-lg p-2 text-sm"
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-3 rounded-lg hover:bg-blue-700"
                  disabled={loading}
                >
                  Send
                </button>
              </form>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
