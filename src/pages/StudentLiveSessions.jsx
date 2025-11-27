// src/pages/StudentLiveSessions.jsx
import React, { useEffect, useState, useContext } from "react";
import { useParams, Link, useNavigate} from "react-router-dom";
import { Video, Calendar, Clock, ArrowLeft } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

const BASE_URL = "https://codifi-backendend-new.onrender.com";

export default function StudentLiveSessions() {
  const { id } = useParams();
  const { tokens } = useContext(AuthContext);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();


  // Function to fetch sessions from the backend
  const fetchSessions = async () => {
    try {
      const res = await fetch(
        `${BASE_URL}/api/courses/${id}/live-sessions/?upcoming_within_minutes=1440&ended_within_minutes=120`,
        {
          headers: { Authorization: `Bearer ${tokens?.access}` },
        }
      );
      const data = await res.json();
      if (Array.isArray(data)) setSessions(data);
    } catch (err) {
      console.error("Error fetching live sessions:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch once on load + refresh every minute
  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 60000); // refresh every 60s
    return () => clearInterval(interval);
  }, [id, tokens]);

  // Auto-hide sessions that ended > 2 hours ago (just in case)
  const now = new Date();
  const filteredSessions = sessions.filter((s) => {
    const start = new Date(s.start_time);
    const end = new Date(start.getTime() + s.duration * 60000);
    const diffMinutes = (now - end) / 60000;
    return diffMinutes <= 120; // show if ended within 2 hours or still upcoming/live
  });

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-blue-600 font-semibold">
        Loading live sessions...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 px-6 py-16">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center m-2 gap-1 px-4 py-2  bg-blue-700 text-gray-100 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition"
      >
        <ArrowLeft className="w-5 h-5 text-gray-200" />
      </button>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-700 mb-6 flex items-center gap-3">
          <Video className="w-8 h-8" /> Live Sessions
        </h1>

        {filteredSessions.length === 0 ? (
          <div className="text-center text-gray-500">
            No upcoming or active live sessions.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSessions.map((session) => {
              const dt = new Date(session.start_time);
              const date = dt.toLocaleDateString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              });
              const time = dt.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });

              const status = session.status || "upcoming"; // from backend
              const statusColor =
                status === "live"
                  ? "text-green-600"
                  : status === "ended"
                  ? "text-gray-500"
                  : "text-blue-600";

              return (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                >
                  <div>
                    <h2 className="text-xl font-semibold text-blue-700">
                      {session.topic}
                    </h2>
                    <p className="flex items-center gap-2 text-gray-600 mt-1">
                      <Calendar className="w-4 h-4" /> {date}
                    </p>
                    <p className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" /> {time} ({session.duration} min)
                    </p>
                    <p className={`mt-2 font-medium ${statusColor}`}>
                      {status === "live"
                        ? "🟢 Live Now!"
                        : status === "ended"
                        ? "⚫ Ended"
                        : "🕒 Upcoming"}
                    </p>
                  </div>

                  <div>
                    {status === "ended" ? (
                      <span className="text-gray-500 text-sm">Meeting Ended</span>
                    ) : status === "upcoming" ? (
                      <span className="text-gray-500 text-sm">
                        Waiting for Start
                      </span>
                    ) : (
                      <button
                        onClick={async () => {
                          const res = await fetch(
                            `${BASE_URL}/api/live-sessions/${session.id}/register/`,
                            {
                              method: "POST",
                              headers: { Authorization: `Bearer ${tokens.access}` },
                            }
                          );
                          const data = await res.json();

                          if (data.join_url) {
                            toast.success("Joining meeting..."); // optional feedback
                            window.open(data.join_url, "_blank");
                          } else {
                            toast.error(data.error || "Unable to join this session."); // <-- FIXED
                          }
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow"
                      >
                        Join Meeting
                      </button>

                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            to={`/courses/${id}/student-view/`}
            className="text-blue-600 hover:underline"
          >
            ← Back to Course Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
