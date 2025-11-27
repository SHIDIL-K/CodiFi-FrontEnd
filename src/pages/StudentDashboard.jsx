import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import { BookOpen, ArrowRight } from "lucide-react";

const BASE_URL = "https://codifi-backendend-new.onrender.com";

export default function StudentDashboard() {
  const { tokens, user } = useContext(AuthContext);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [emptyAnim, setEmptyAnim] = useState(null);

  useEffect(() => {
    fetch(`${BASE_URL}/media/animations/empty_state.json`)
      .then((res) => res.json())
      .then(setEmptyAnim)
      .catch(() => {});
  }, []);

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/enrollments/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokens?.access}`,
          },
        });

        const data = await res.json();
        setEnrollments(data);
      } catch {}
      finally {
        setLoading(false);
      }
    };

    if (user) fetchEnrollments();
  }, [user, tokens]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-blue-600 dark:text-blue-400 font-semibold">
        Loading your dashboard...
      </div>
    );

  const hasOffer = enrollments.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 
    dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 px-6 py-16">

      <div className="max-w-7xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold 
          bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 
          bg-clip-text text-transparent">
            Welcome back, {user?.username}
          </h1>

          <p className="mt-2 text-gray-600 dark:text-gray-400 text-lg">
            Keep up your progress and continue learning.
          </p>
        </motion.div>

        {/* OFFER BANNER */}
        {hasOffer && (
          <div className="mb-10 p-4 rounded-xl bg-gradient-to-r from-yellow-300 to-yellow-500 
          text-yellow-900 shadow">
            <p className="text-sm font-semibold">
              You unlocked special course discounts for the next 7 days.
            </p>
          </div>
        )}

        {/* Enrolled Courses */}
        {enrollments.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10"
          >
            {enrollments.map((enroll, index) => (
              <motion.div
                key={enroll.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group bg-white/70 dark:bg-gray-800/60 backdrop-blur-md border 
                border-gray-200 dark:border-gray-700 rounded-3xl shadow-md hover:shadow-2xl 
                transition-all overflow-hidden flex flex-col"
              >

                <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500" />

                {/* Course Image */}
                <div className="overflow-hidden">
                  <img
                    src={enroll.course.image}
                    alt={enroll.course.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Content */}
                <div className="flex flex-col justify-between flex-grow p-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {enroll.course.title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3">
                      {enroll.course.description}
                    </p>
                    {/* ✅ Course Duration */}
                    <p className="text-xs text-gray-500 mb-3 mt-1 line-clamp-2">
                      Duration:{" "}
                      <span className="text-gray-800 font-semibold">
                        {enroll.course.course_duration_months} months
                      </span>
                    </p>
                  </div>

                  <div className="mt-5 flex items-center justify-between">
                    <span className="flex items-center text-blue-600 dark:text-blue-400 font-medium text-sm">
                      <BookOpen className="w-4 h-4 mr-2" /> Ongoing
                    </span>

                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() =>
                        navigate(`/courses/${enroll.course.id}/student-view/`)
                      }
                      className="flex items-center gap-2 bg-gradient-to-r from-blue-600 via-purple-600 
                      to-pink-600 text-white font-semibold px-5 py-2 rounded-full shadow hover:shadow-lg 
                      hover:scale-105 transition"
                    >
                      Go to Course <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          /* EMPTY STATE */
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="flex flex-col items-center justify-center mt-20"
          >
            <div className="w-64 md:w-80 mb-6">
              {emptyAnim ? (
                <Lottie animationData={emptyAnim} loop autoplay />
              ) : (
                <div className="text-6xl">📘</div>
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              You haven’t enrolled in any courses yet.
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-center mb-6 max-w-md">
              Explore our top-rated courses and start learning today.
            </p>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/courses")}
              className="px-8 py-3 rounded-full bg-gradient-to-r from-blue-600 via-purple-600 
              to-pink-600 text-white font-semibold shadow-lg hover:scale-105 transition"
            >
              Browse Courses
            </motion.button>
          </motion.div>
        )}

      </div>
    </div>
  );
}
