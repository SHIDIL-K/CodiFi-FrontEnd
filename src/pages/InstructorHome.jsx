import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import { Users, BookOpen, MessageSquare, Star, ArrowRight } from "lucide-react";
import { AuthContext } from "../context/AuthContext";

const BASE_URL = "https://codifi-backendend-new.onrender.com";

export default function InstructorHome() {
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    avgRating: 0,
    feedbackCount: 0,
  });
  const [courses, setCourses] = useState([]);
  const [animation, setAnimation] = useState(null);
  const { tokens, user } = useContext(AuthContext);

  // ✅ Load Instructor Lottie Animation
  useEffect(() => {
    fetch(`${BASE_URL}/media/animations/instructor.json`)
      .then((res) => res.json())
      .then(setAnimation)
      .catch(() => console.log("No Lottie animation found"));
  }, []);

  // ✅ Fetch instructor stats and allocated courses
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/instructor-dashboard/`, {
          headers: { Authorization: `Bearer ${tokens?.access}` },
        });

        if (res.ok) {
          const data = await res.json();
          setStats(data.stats || {});
          setCourses(data.courses || []);
        } else {
          console.error("Failed to fetch instructor data");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };
    fetchData();
  }, [tokens]);

  return (
    <main className="bg-gradient-to-b from-indigo-50 via-blue-50 to-purple-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-screen py-20 px-6 md:px-12 transition-colors duration-500">
      {/* ✅ HERO SECTION */}
      <section className="relative flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto mb-20 gap-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="flex-1 text-center md:text-left"
        >
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 bg-clip-text text-transparent leading-tight drop-shadow-lg">
            Welcome Back, {user?.username || "Instructor"} 👋
          </h1>
          <p className="mt-5 text-lg text-gray-700 dark:text-gray-300 max-w-xl">
            Manage your assigned courses, monitor student performance, and
            engage with learners effectively.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          className="flex-1 flex justify-center"
        >
          {animation ? (
            <Lottie animationData={animation} loop autoplay className="w-[400px] h-[400px]" />
          ) : (
            <div className="text-4xl">🎓</div>
          )}
        </motion.div>
      </section>

      {/* ✅ DASHBOARD OVERVIEW */}
      <section className="max-w-7xl mx-auto mb-20">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 text-center mb-12">
          Teaching Overview
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              label: "Allocated Courses",
              value: stats.totalCourses,
              icon: <BookOpen className="w-8 h-8 text-indigo-600" />,
              gradient: "from-indigo-500 to-blue-500",
            },
            {
              label: "Enrolled Students",
              value: stats.totalStudents,
              icon: <Users className="w-8 h-8 text-green-600" />,
              gradient: "from-green-500 to-teal-500",
            },
            {
              label: "Average Rating",
              value: stats.avgRating?.toFixed(1) || "N/A",
              icon: <Star className="w-8 h-8 text-yellow-500" />,
              gradient: "from-yellow-400 to-orange-500",
            },
            {
              label: "Feedback Received",
              value: stats.feedbackCount,
              icon: <MessageSquare className="w-8 h-8 text-pink-500" />,
              gradient: "from-pink-500 to-purple-500",
            },
          ].map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="p-6 rounded-2xl shadow-xl bg-white/70 dark:bg-gray-800/60 
              backdrop-blur-xl border border-gray-200 dark:border-gray-700 
              hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 flex flex-col items-center justify-center text-center"
            >
              <div className="p-4 rounded-full bg-gradient-to-br from-white/60 to-gray-100/30 dark:from-gray-700/30 dark:to-gray-900/40">
                {card.icon}
              </div>
              <h3 className="text-2xl font-bold mt-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                {card.value || 0}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 font-medium mt-1">{card.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ✅ ALLOCATED COURSES */}
      <section className="max-w-7xl mx-auto mb-20">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-gray-100">
          My Allocated Courses
        </h2>
        {courses.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {courses.map((course, i) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="relative bg-white/80 dark:bg-gray-800/70 backdrop-blur-xl 
                border border-gray-200/40 dark:border-gray-700/40 rounded-3xl shadow-xl 
                hover:shadow-2xl hover:-translate-y-2 transition-all p-5"
              >
                <img
                    src={
                        course.image?.startsWith("http")
                        ? course.image
                        : `${BASE_URL}${course.image}`
                    }
                    alt={course.title}
                    className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />

                <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                  {course.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                  {course.description}
                </p>

                {/* ✅ Course Duration */}
                
                <p className="text-xs text-gray-500 mb-3 mt-1 line-clamp-2">
                  Duration:{" "}
                  <span className="text-gray-800 font-semibold">
                    {course.course_duration_months} months
                  </span>
                </p>

                <div className="flex justify-between items-center mt-4">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {course.enrolled_students} Students
                  </span>
                  <Link
                    to={`/instructor/course/${course.id}/manage`}
                    className="text-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 
                    px-3 py-2 rounded-full hover:from-purple-700 hover:to-pink-600 
                    transition-all flex items-center gap-1"
                  >
                    Manage <ArrowRight size={14} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-600 dark:text-gray-400">
            No courses have been allocated to you yet.
          </p>
        )}
      </section>

      {/* ✅ Footer Message */}
      <section className="py-16 text-center bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-t-3xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-extrabold mb-4"
        >
          Keep Inspiring Learners 🌟
        </motion.h2>
        <p className="text-lg opacity-90 max-w-2xl mx-auto">
          Your dedication helps students achieve their dreams — continue mentoring and making a difference!
        </p>
      </section>
    </main>
  );
}
