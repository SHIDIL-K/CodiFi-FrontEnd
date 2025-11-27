import React, { useEffect, useState, useContext, useMemo } from "react";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";
import { Bell, CheckCircle, Check, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";


export default function NotificationsPage() {
  const { tokens, refreshAccessToken, logout } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [marking, setMarking] = useState(false);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.is_read).length,
    [notifications]
  );

  const fetchNotifications = async (accessToken) => {
    try {
      const res = await fetch("https://codifi-backendend-new.onrender.com/api/notifications/", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (res.status === 401 || res.status === 403) {
        const newAccess = await refreshAccessToken();
        if (newAccess) return fetchNotifications(newAccess);
        logout();
        return;
      }

      const data = await res.json();
      if (res.ok) setNotifications(data);
    } catch (err) {
      console.error("Error fetching notifications:", err.message);
    }
  };

  const markAllAsRead = async (accessToken) => {
    try {
      setMarking(true);

      // optimistic UI update
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));

      const res = await fetch(
        "https://codifi-backendend-new.onrender.com/api/notifications/mark_all_read/",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (res.status === 401 || res.status === 403) {
        const newAccess = await refreshAccessToken();
        if (newAccess) return markAllAsRead(newAccess);
        logout();
        return;
      }

      if (!res.ok) {
        // revert if backend failed
        await fetchNotifications(accessToken);
      }
    } catch (e) {
      console.error("Failed to mark all read:", e);
      await fetchNotifications(accessToken);
    } finally {
      setMarking(false);
    }
  };

  useEffect(() => {
    if (tokens?.access) fetchNotifications(tokens.access);
  }, [tokens]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-indigo-50 to-purple-100 dark:from-gray-900 dark:to-gray-800 px-6 py-20">
      <Link
        to={`/home`}
        className="flex items-center w-12 h-10 gap-1 m-4 mt-4 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-gray-100 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition"
      >
        <ArrowLeft className="w-4 h-4" />
      </Link>
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-10"
        >
          <div className="flex items-center gap-3">
            <Bell className="text-indigo-600 dark:text-indigo-300" size={32} />
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
              Notifications
            </h2>
          </div>

          <button
            onClick={() => tokens?.access && markAllAsRead(tokens.access)}
            disabled={unreadCount === 0 || marking}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium shadow 
              ${unreadCount === 0 || marking
                ? "bg-gray-300 text-gray-600 dark:bg-gray-700 dark:text-gray-300 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
            title={unreadCount === 0 ? "All caught up!" : "Mark all as read"}
          >
            <Check size={16} />
            {marking ? "Marking..." : `Mark all as read${unreadCount ? ` (${unreadCount})` : ""}`}
          </button>
        </motion.div>

        {/* Empty state */}
        {notifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 text-gray-500 dark:text-gray-400"
          >
            <Bell size={40} className="mx-auto mb-4 opacity-60" />
            <p className="text-lg">No notifications yet.</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {notifications.map((n, i) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.5 }}
                className={`p-5 rounded-xl shadow-lg border backdrop-blur-md
                  ${n.is_read
                    ? "bg-white/50 dark:bg-gray-800/50 border-gray-300/30"
                    : "bg-indigo-100/70 dark:bg-indigo-900/40 border-indigo-300/40"
                  }`}
              >
                <div className="flex justify-between items-center">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {n.title}
                  </h4>

                  {n.is_read ? (
                    <CheckCircle size={20} className="text-green-500" />
                  ) : (
                    <span className="text-xs px-2 py-1 bg-indigo-600 text-white rounded-full shadow">
                      New
                    </span>
                  )}
                </div>

                <p className="text-gray-700 dark:text-gray-300 mt-1">
                  {n.message}
                </p>

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                  {new Date(n.created_at).toLocaleString("en-IN", {
                    hour: "numeric",
                    minute: "numeric",
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
