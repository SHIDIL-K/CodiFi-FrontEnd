import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  BookOpen,
  ClipboardList,
  FileText,
  MessageSquare,
  Video,
  MessageCircle,
  ArrowLeft,
} from "lucide-react";
import { motion, useAnimation, useInView } from "framer-motion";
import Lottie from "lottie-react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { AuthContext } from "../context/AuthContext";

const BASE_URL = "https://codifi-backendend-new.onrender.com";

const getDaysRemaining = (expiryDate) => {
  if (!expiryDate) return null;
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};


export default function StudentCourseWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tokens } = useContext(AuthContext);

  const [progress, setProgress] = useState(null);
  const [animationData, setAnimationData] = useState(null);

  /* ---------------------------------------
    Load Dashboard Animation
  ---------------------------------------- */
  useEffect(() => {
    fetch(`${BASE_URL}/media/animations/course_dashboard.json`)
      .then((res) => res.json())
      .then(setAnimationData)
      .catch(() => console.log("No Lottie animation found"));
  }, []);

  /* ---------------------------------------
    Fetch Course Progress + Expiry
  ---------------------------------------- */
  const reloadProgress = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/courses/${id}/progress/`, {
        headers: { Authorization: `Bearer ${tokens?.access}` },
      });

      const data = await res.json();

      if (data.expired) {
        setProgress({ expired: true });
        return;
      }

      if (res.ok) {
        setProgress(data);
      }
    } catch (err) {
      console.log("Progress refresh failed");
    }
  };

  useEffect(() => {
    reloadProgress();
  }, [id, tokens]);

  /* ---------------------------------------
    Listen for progress update events
  ---------------------------------------- */
  useEffect(() => {
    const handleUpdate = () => {
      if (localStorage.getItem("course_progress_update") === "true") {
        reloadProgress();
        localStorage.removeItem("course_progress_update");
      }
    };

    window.addEventListener("course_progress_update", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("course_progress_update", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  /* ---------------------------------------
    Dashboard Cards
  ---------------------------------------- */
  const cards = [
    {
      title: "Daily Tasks",
      description: "View and submit your daily assignments.",
      icon: (
        <ClipboardList className="w-8 h-8 text-blue-600 dark:text-blue-400" />
      ),
      gradient: "from-blue-500 to-indigo-500",
      onClick: () => navigate(`/courses/${id}/tasks/list/`),
    },
    {
      title: "Lessons",
      description: "Access your lessons and course materials.",
      icon: (
        <BookOpen className="w-8 h-8 text-green-600 dark:text-green-400" />
      ),
      gradient: "from-green-500 to-teal-500",
      onClick: () => navigate(`/courses/${id}/lessons/`),
    },
    {
      title: "Quiz",
      description: "Test your understanding with quizzes.",
      icon: (
        <FileText className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
      ),
      gradient: "from-yellow-400 to-orange-500",
      onClick: () => navigate(`/courses/${id}/quiz/`),
    },
    {
      title: "Feedback",
      description: "Share your feedback about this course.",
      icon: (
        <MessageSquare className="w-8 h-8 text-purple-600 dark:text-purple-400" />
      ),
      gradient: "from-purple-500 to-pink-500",
      onClick: () => navigate(`/courses/${id}/feedback/`),
    },
    {
      title: "Live Sessions",
      description: "Join interactive live classes with your instructor.",
      icon: (
        <Video className="w-8 h-8 text-red-600 dark:text-red-400" />
      ),
      gradient: "from-red-500 to-pink-600",
      onClick: () => navigate(`/courses/${id}/live-sessions/`),
    },
    {
      title: "Chat with Instructor",
      description: "Ask questions and get support directly.",
      icon: (
        <MessageCircle className="w-8 h-8 text-sky-600 dark:text-sky-400" />
      ),
      gradient: "from-sky-500 to-indigo-500",

      onClick: async () => {
        try {
          const res = await fetch(`${BASE_URL}/api/courses/${id}/chat/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${tokens.access}`,
            }
          });

          const data = await res.json();

          if (res.ok) {
            navigate(`/student/chat/${data.id}`);  // <-- chatroom_id here
          } else {
            console.error("Chat init error", data);
          }
        } catch (err) {
          console.error("Chat error", err);
        }
      }
    }

  ];

  /* ---------------------------------------
    Expired Course PAGE UI
  ---------------------------------------- */
  if (progress?.expired) {
    return (
      <div className="flex justify-center items-center h-screen text-center px-4">
        <div className="bg-white p-10 shadow-xl rounded-2xl max-w-lg">
          <h1 className="text-3xl font-bold text-red-600 mb-4">
            Course Access Expired
          </h1>
          <p className="text-gray-600 mb-6">
            Your access to this course has expired.  
            Please contact admin to renew your access.
          </p>

          <button
            onClick={() => navigate("/student")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const daysRemaining = getDaysRemaining(progress?.expires_on);

  if (!progress)
    return (
      <div className="flex justify-center items-center h-screen text-blue-600 dark:text-blue-400 font-semibold">
        Loading course workspace...
      </div>
    );

  /* ---------------------------------------
    MAIN DASHBOARD DISPLAY
  ---------------------------------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 px-6 py-16">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mt-10 flex justify-between items-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center px-4 py-2  bg-gradient-to-r from-blue-600 to-purple-600 text-gray-100 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-200" />
          </button>
          </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row items-center justify-between mb-16 gap-10"
        >

          <div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Course Dashboard
            </h1>

            <p className="mt-2 text-gray-600 dark:text-gray-400 text-lg">
              Manage your learning progress and tasks efficiently.
            </p>

            {/* 7-DAY EXPIRY WARNING */}
            {daysRemaining !== null && daysRemaining > 0 && daysRemaining <= 7 && (
              <div className="mt-4 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 font-medium rounded-lg shadow-sm">
                ⚠ Your course access expires in <strong>{daysRemaining} day{daysRemaining !== 1 ? "s" : ""}</strong>.  
                Please complete your lessons soon.
              </div>
            )}

            {/* EXPIRY DATE DISPLAY */}
            {progress.expires_on && (
              <p className="mt-3 text-sm text-red-500 font-semibold">
                ⏳ Access Expires On:{" "}
                {new Date(progress.expires_on).toLocaleDateString()}
              </p>
            )}
          </div>

          <div className="w-64 md:w-80">
            {animationData && (
              <Lottie animationData={animationData} loop autoplay />
            )}
          </div>
        </motion.div>

        {/* Progress Box */}
        <div className="bg-white/70 dark:bg-gray-800/60 backdrop-blur-md border border-gray-200 dark:border-gray-700 p-8 rounded-3xl shadow-md mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">
            Your Progress
          </h2>

          <div className="space-y-6 mb-10">
            <ProgressBar
              label="Course Progress"
              value={progress.course_progress}
              colors="from-blue-500 via-purple-500 to-pink-500"
            />

            <ProgressBar
              label="Lesson Progress"
              value={progress.lesson_progress}
              colors="from-green-400 via-teal-500 to-blue-500"
            />
          </div>

          <AnimatedCircularStats progress={progress} />
        </div>

        {/* Action Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-10"
        >
          {cards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              onClick={card.onClick}
              className="cursor-pointer relative p-8 rounded-3xl shadow-md hover:shadow-xl transition-all bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-gray-200 dark:border-gray-700 group"
            >
              <div
                className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-10 transition bg-gradient-to-br ${card.gradient}`}
              />
              <div className="relative z-10 flex flex-col items-start space-y-4">
                <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full">
                  {card.icon}
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {card.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {card.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

/* ---------------------------------------
  Progress Bar Component
---------------------------------------- */
const ProgressBar = ({ label, value, colors }) => (
  <div>
    <div className="flex justify-between mb-2">
      <span className="text-gray-700 dark:text-gray-300 font-medium">
        {label}
      </span>
      <span className="text-gray-700 dark:text-gray-300 font-semibold">
        {value}%
      </span>
    </div>

    <div className="w-full bg-gray-200 dark:bg-gray-700 h-3 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: `${value}%` }}
        transition={{ duration: 1.2 }}
        className={`h-3 bg-gradient-to-r ${colors}`}
      />
    </div>
  </div>
);

/* ---------------------------------------
  Circular Stats for Tasks
---------------------------------------- */
const AnimatedCircularStats = ({ progress }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) controls.start("visible");
  }, [isInView]);

  const stats = [
    {
      label: "Completed",
      value: progress.completed_tasks,
      total: progress.total_tasks,
      color: "#10B981",
    },
    {
      label: "Rejected",
      value: progress.rejected_tasks,
      total: progress.total_tasks,
      color: "#EF4444",
    },
    {
      label: "Pending",
      value: progress.pending_tasks,
      total: progress.total_tasks,
      color: "#9CA3AF",
    },
  ];

  return (
    <div ref={ref} className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
      {stats.map((stat, index) => {
        const percentage = stat.total
          ? (stat.value / stat.total) * 100
          : 0;

        return (
          <motion.div
            key={index}
            variants={{
              hidden: { opacity: 0, scale: 0.8 },
              visible: { opacity: 1, scale: 1 },
            }}
            initial="hidden"
            animate={controls}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            className="flex flex-col items-center group"
          >
            <div className="w-28 h-28">
              <CircularProgressbar
                value={percentage}
                text={`${Math.round(percentage)}%`}
                styles={buildStyles({
                  textColor: stat.color,
                  pathColor: stat.color,
                  trailColor: "#E5E7EB",
                })}
              />
            </div>

            <p className="mt-3 text-gray-700 dark:text-gray-300 font-medium">
              {stat.label}
            </p>

            <p className="text-sm text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition">
              {stat.value} / {stat.total || 0}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
};
