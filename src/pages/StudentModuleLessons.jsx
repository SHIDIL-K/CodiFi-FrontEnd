import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, FileText, AlertCircle, ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";   // ✅ ADD THIS

const BASE_URL = "https://codifi-backendend-new.onrender.com";

export default function StudentModuleLessons() {
  const { courseId, moduleId } = useParams();
  const [lessons, setLessons] = useState([]);
  const [moduleTitle, setModuleTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/courses/${courseId}/modules-with-lessons/`);
        const data = await res.json();

        const mod = data.modules?.find((m) => m.id === parseInt(moduleId));

        if (!mod) {
          toast.warn("Module not found.");
        }

        if (mod) {
          setLessons(mod.lessons || []);
          setModuleTitle(mod.title);
        }
      } catch (err) {
        toast.error("Failed to load lessons. Please try again.");  // ✅ TOAST ADDED
        console.error("Error loading lessons:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [courseId, moduleId]);


  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-2 text-sm mb-6">
          {/* Breadcrumb */}
            
          <button
            onClick={() => navigate(`/courses/${id}/student-view/`)}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Dashboard
          </button>

          <span className="text-gray-400">/</span>

          <button
            onClick={() => navigate(`/courses/${courseId}/lessons/`)}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Modules
          </button>

          <span className="text-gray-400">/</span>

          <span className="text-gray-700 dark:text-gray-200 font-semibold">
            Lessons
          </span>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 px-4 py-2  bg-blue-600/80 text-gray-100 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
          <ArrowLeft className="w-5 h-5 text-gray-800 dark:text-gray-200" />
        </button>

        {/* ✅ Module Title */}
        <motion.h1
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-extrabold text-center mb-12 
          bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
        >
          {moduleTitle || "Module"}
        </motion.h1>

        {/* ✅ Skeleton Loader */}
        {loading && (
          <div className="grid md:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-28 rounded-2xl bg-white/20 dark:bg-gray-800/20 backdrop-blur-lg animate-pulse"
              ></div>
            ))}
          </div>
        )}

        {/* ✅ Empty State */}
        {!loading && lessons.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-20 text-center">
            <AlertCircle size={60} className="mx-auto text-gray-400 dark:text-gray-500 mb-3" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">No lessons available in this module.</p>
          </motion.div>
        )}

        {/* ✅ Lessons Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {lessons.map((lesson, idx) => (
            <motion.div
              key={lesson.id}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              onClick={() => navigate(`/lesson/${lesson.id}`)}
              className="cursor-pointer relative p-6 rounded-2xl
              bg-white/40 dark:bg-gray-800/30 backdrop-blur-xl
              border border-white/20 dark:border-gray-700/30
              shadow-lg hover:shadow-2xl hover:-translate-y-1
              transition-all duration-300 group overflow-hidden"
            >
              {/* ✅ Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition duration-700"></div>

              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600/80 rounded-xl shadow text-white">
                  <BookOpen size={26} />
                </div>

                <div>
                  <h3 className="text-xl font-bold text-indigo-700 dark:text-indigo-300">
                    {lesson.title}
                  </h3>

                  {lesson.pdf_file ? (
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                      <FileText size={16} /> Has Study Material
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      No Study Material
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
