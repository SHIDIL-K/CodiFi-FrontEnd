// src/pages/StudentLessonDetail.jsx
import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";


const BASE_URL = "https://codifi-backendend-new.onrender.com";

export default function StudentLessonDetail() {
  const { id } = useParams();
  const [lesson, setLesson] = useState(null);
  const [videoData, setVideoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const { tokens, user } = useContext(AuthContext);
  const navigate = useNavigate();
  


  const extractYouTubeId = (url) => {
    if (!url) return null;
    const match = url.match(
      /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    return match ? match[1] : null;
  };

  useEffect(() => {
    const loadLesson = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/lessons/${id}/`);
        const data = await response.json();
        setLesson(data);
        if (user) {
          const check = await fetch(
            `${BASE_URL}/api/lessons/${id}/complete-status/`, 
            { headers: { Authorization: `Bearer ${tokens?.access}` } }
          );
          const status = await check.json();
          setCompleted(status.completed);
        }


        const vId = extractYouTubeId(data.youtube_video_url);
        if (vId) {
          const ytResponse = await fetch(`${BASE_URL}/api/youtube/video/${vId}/`);
          const ytData = await ytResponse.json();
          if (ytData.items?.length > 0) setVideoData(ytData.items[0]);
        }
      } catch (err) {
        console.error("Error loading lesson:", err);
      } finally {
        setLoading(false);
      }
    };
    loadLesson();
  }, [id]);

  if (loading)
    return (
      <div className="p-10 text-center text-gray-500 text-lg animate-pulse">
        Loading lesson...
      </div>
    );

  if (!lesson)
    return (
      <div className="p-10 text-center text-gray-500 text-lg">
        Lesson not found
      </div>
    );

  const videoId = extractYouTubeId(lesson.youtube_video_url);

  const markCompleted = async () => {
    try {
      const res = await fetch(
        `${BASE_URL}/api/lessons/${id}/complete/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokens?.access}`,
          }
        }
      );

      const data = await res.json();

      if (res.ok) {
        setCompleted(true);
        toast.success("Lesson marked as completed 🎉");

        // ✅ optional: update progress in workspace via localStorage
        localStorage.setItem("course_progress_update", "true");
      }
    } catch (e) {
      toast.error("Error marking lesson completed");
    }
  };


  return (
    <div className="min-h-screen py-24 px-6 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 px-4 py-2  bg-gradient-to-r from-indigo-600 to-purple-600 text-gray-100 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
          <ArrowLeft className="w-5 h-5 text-gray-200" />
        </button>

        {/* ✅ Page Title */}
        <motion.h1
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-extrabold mb-8 text-center 
          bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
        >
          {lesson.title}
        </motion.h1>

        {/* ✅ Video Section */}
        {videoId ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative rounded-3xl overflow-hidden shadow-xl 
            bg-white/20 dark:bg-gray-800/20 backdrop-blur-xl border border-white/30"
          >
            <iframe
              className="w-full h-[400px]"
              src={`https://www.youtube.com/embed/${videoId}`}
              title={lesson.title}
              allowFullScreen
            ></iframe>

            {/* ✅ Light Glow Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10 pointer-events-none"></div>
          </motion.div>
        ) : (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-gray-500 text-lg mt-6"
          >
            🚫 No video available for this lesson.
          </motion.p>
        )}

        {/* ✅ YouTube Metadata */}
        {videoData && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-6 rounded-2xl bg-white/60 dark:bg-gray-800/40 backdrop-blur-lg shadow"
          >
            <h2 className="text-xl font-semibold">{videoData.snippet.title}</h2>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              🎬 Channel: {videoData.snippet.channelTitle}
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              👁 Views: {Number(videoData.statistics.viewCount).toLocaleString()}
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              📅 Published:{" "}
              {new Date(videoData.snippet.publishedAt).toLocaleDateString()}
            </p>
          </motion.div>
        )}

        {/* ✅ Lesson Content */}
        {lesson.content && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10 p-6 rounded-2xl bg-white/70 dark:bg-gray-800/40 backdrop-blur-lg shadow leading-relaxed text-gray-700 dark:text-gray-200"
          >
            <h3 className="font-semibold text-xl mb-3">📘 Lesson Notes</h3>
            <p>{lesson.content}</p>
          </motion.div>
        )}

        {/* ✅ Mark as Completed Button */}
        <div className="my-6">
          {completed ? (
            <button
              disabled
              className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg shadow-lg flex justify-center items-center gap-2 cursor-not-allowed"
            >
              ✅ Lesson Completed
            </button>
          ) : (
            <button
              onClick={markCompleted}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-lg transition flex justify-center items-center gap-2"
            >
              ✅ Mark Lesson as Completed
            </button>
          )}
        </div>


        {/* ✅ Study Material */}
        {lesson.pdf_file && (
          <motion.a
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            href={
              lesson.pdf_file.startsWith("http")
                ? lesson.pdf_file
                : `${BASE_URL}${lesson.pdf_file}`
            }
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-block px-6 py-3 rounded-full shadow-lg text-white font-semibold 
            bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-purple-700 hover:to-pink-600 transition"
          >
            📄 View / Download Study Material
          </motion.a>
        )}
      </div>
    </div>
  );
}
