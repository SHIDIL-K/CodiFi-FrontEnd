// src/pages/InstructorChatList.jsx
import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageSquare, ChevronLeft } from "lucide-react";



const BASE_URL = "https://codifi-backendend-new.onrender.com";

function timeAgo(iso) {
  if (!iso) return "";
  const dt = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now - dt) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return dt.toLocaleDateString();
}

export default function InstructorChatList() {
  const { tokens } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();


  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000); // poll for new messages every 5s
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/api/instructor/conversations/`, {
        headers: { Authorization: `Bearer ${tokens?.access}` },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      // sort by unread -> last_message_at desc
      data.sort((a, b) => {
        if ((b.unread_count || 0) - (a.unread_count || 0) !== 0) {
          return (b.unread_count || 0) - (a.unread_count || 0);
        }
        return new Date(b.last_message_at || 0) - new Date(a.last_message_at || 0);
      });
      setConversations(data);
    } catch (err) {
      console.error("Failed to load conversations:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 px-4 bg-gray-50 dark:bg-gray-900 transition-colors">

      <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-2xl 
                      shadow-lg border border-gray-200 dark:border-gray-700">

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              
            >
              <ChevronLeft className="w-5 h-5 opacity-70" />
            </button>
            <MessageSquare className="w-6 h-6 text-blue-600" />
            Student Conversations
          </h1>
          <div className="text-sm text-gray-500">
            {loading ? "Updating..." : `${conversations.length} conversations`}
          </div>
        </div>

        {conversations.length ? (
          <ul className="space-y-4">
            {conversations.map((c, i) => (
              <motion.li
                key={`${c.course_id}-${c.student_id}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="p-4 rounded-lg flex items-center justify-between hover:shadow-sm transition cursor-default"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(c.student_username)}&background=random&rounded=true`}
                    alt={c.student_username}
                    className="w-12 h-12 rounded-full object-cover shadow-sm"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-800 dark:text-gray-100 truncate">
                        {c.student_username}
                      </p>
                      <p className="text-xs text-gray-400">{c.course_title}</p>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-300 truncate mt-1">
                      {c.last_message ? (
                        <>
                          <span className="inline-block mr-2 text-xs text-gray-400">●</span>
                          {c.last_message.length > 80 ? `${c.last_message.slice(0, 80)}…` : c.last_message}
                        </>
                      ) : (
                        <span className="text-gray-400 italic">No messages yet</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-3">
                    {c.unread_count > 0 && (
                      <div className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[28px] text-center">
                        {c.unread_count}
                      </div>
                    )}

                    <Link
                      to={`/instructor/chat/${c.chatroom_id}`}
                      className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition text-sm"
                    >
                      Open
                    </Link>
                  </div>
                  <div className="text-xs text-gray-400">
                    {timeAgo(c.last_message_at)}
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-8 text-gray-500">
            {loading ? "Loading conversations..." : "No conversations yet — students enrolled will appear here."}
          </div>
        )}
      </div>
    </div>
  );
}
