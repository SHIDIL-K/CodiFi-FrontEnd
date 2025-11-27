import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import Lottie from "lottie-react";
import { motion } from "framer-motion";
import { BookOpen, Sparkles } from "lucide-react";

const BASE_URL = "https://codifi-backendend-new.onrender.com";

export default function InstructorDashboard() {
  const { user, tokens } = useContext(AuthContext);
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [animationData, setAnimationData] = useState(null);
  

  // Redirect non-instructors
  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (user.role !== "instructor") {
      if (user.role === "admin") navigate("/admin");
      else navigate("/student");
    }
  }, [user, navigate]);

  // Fetch animation from backend
  useEffect(() => {
    fetch(`${BASE_URL}/media/animations/instructor.json`)
      .then((res) => res.json())
      .then(setAnimationData)
      .catch(() => console.log("No instructor Lottie animation found."));
  }, []);

  // Fetch allocated courses
  useEffect(() => {
    if (user && user.role === "instructor" && tokens?.access) {
      fetch(`${BASE_URL}/api/instructor/courses/`, {
        headers: {
          Authorization: `Bearer ${tokens.access}`,
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to load courses");
          return res.json();
        })
        .then((data) => {
          setCourses(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching instructor courses:", err);
          setLoading(false);
        });
    }
  }, [user, tokens]);

  if (!user) return null;

  // Pending approval state
  if (!user.is_approved) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <div className="bg-white/80 dark:bg-gray-800/80 p-8 rounded-3xl shadow-lg backdrop-blur-sm text-center max-w-md">
          <Sparkles className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Instructor Account Pending Approval
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Your instructor account is awaiting admin approval. You’ll be notified once verified.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 py-16 px-6 transition-colors duration-500">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row items-center justify-between gap-10 mb-16"
        >
          <div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Instructor Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg mt-2">
              Manage your allocated courses, track performance, and create lessons easily.
            </p>
          </div>
          {animationData && (
            <div className="w-72 md:w-96">
              <Lottie animationData={animationData} loop autoplay />
            </div>
          )}
        </motion.div>

        {/* Welcome Card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-gray-200 dark:border-gray-700 p-8 rounded-3xl shadow-md mb-10"
        >
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">
            Welcome back, {user.username} 👋
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Here’s an overview of the courses assigned to you by the admin.
          </p>
        </motion.div>

        {/* Allocated Courses Section */}
        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
            My Allocated Courses
          </h2>
        </div>

        {loading ? (
          <p className="text-gray-600 dark:text-gray-400 text-center mt-8">
            Loading your courses...
          </p>
        ) : courses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-gray-500 dark:text-gray-400 bg-white/70 dark:bg-gray-800/70 p-10 rounded-3xl border border-gray-200 dark:border-gray-700"
          >
            <p className="text-lg">No courses allocated yet.</p>
            <p className="text-sm">Please contact the admin to assign courses.</p>
          </motion.div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                {course.image && (
                  <div className="overflow-hidden">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                )}
                <div className="p-5 flex flex-col flex-grow">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-3 flex-grow">
                    {course.description}
                  </p>
                  {/* ✅ Course Duration */}
                  <p className="text-xs text-gray-500 mb-3 mt-1 line-clamp-2">
                    Duration:{" "}
                    <span className="text-gray-800 font-semibold">
                      {course.course_duration_months} months
                    </span>
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
                    Created: {new Date(course.created_at).toLocaleDateString()}
                  </p>
                  <Link
                    to={`/instructor/course/${course.id}/manage`}
                    className="mt-auto inline-block text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium py-2 px-4 rounded-lg shadow hover:shadow-lg hover:scale-[1.02] transition-transform duration-200"
                  >
                    Manage Course →
                  </Link>
                </div>
              </motion.div>
            ))}

          </div>
        )}
      </div>
    </div>
  );
}
