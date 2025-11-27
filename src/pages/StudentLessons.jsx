// src/pages/StudentLessons.jsx

import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";
import { FolderOpen, BookOpen, ArrowLeft } from "lucide-react";


const BASE_URL = "https://codifi-backendend-new.onrender.com";

export default function StudentLessons() {
  const { id } = useParams(); // course ID
  const navigate = useNavigate();
  const { tokens } = useContext(AuthContext);

  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadModules = async () => {
      try {
        const res = await fetch(
          `${BASE_URL}/api/courses/${id}/modules-with-lessons/`,
          {
            headers: { Authorization: `Bearer ${tokens?.access}` },
          }
        );

        const data = await res.json();
        setModules(data.modules || []);
      } catch (err) {
        console.error("Error loading modules:", err);
      } finally {
        setLoading(false);
      }
    };

    loadModules();
  }, [id, tokens]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-purple-50 to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-24 px-6">
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

        <span className="text-gray-700 dark:text-gray-200 font-semibold">
          Modules
        </span>
      </div>
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 px-4 py-2  bg-indigo-600/80 text-gray-100 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition"
      >
        <ArrowLeft className="w-5 h-5 text-gray-800 dark:text-gray-200" />
      </button>

        {/* ✅ Page Heading */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-extrabold text-center mb-12 
          bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
        >
          Course Modules
        </motion.h1>

        {/* ✅ Loading Skeleton */}
        {loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-32 bg-white/20 dark:bg-gray-800/20 backdrop-blur-md 
                animate-pulse rounded-2xl shadow-md"
              ></div>
            ))}
          </div>
        )}

        {/* ✅ Empty State */}
        {!loading && modules.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mt-20"
          >
            <FolderOpen
              size={70}
              className="mx-auto text-gray-400 dark:text-gray-500 mb-4"
            />
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              No modules available for this course yet.
            </p>
          </motion.div>
        )}

        {/* ✅ Module Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {modules.map((m, index) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.07 }}
              onClick={() => navigate(`/courses/${id}/module/${m.id}`)}
              className="cursor-pointer relative p-6 rounded-2xl 
              bg-white/40 dark:bg-gray-800/30 backdrop-blur-xl
              shadow-lg border border-white/20 dark:border-gray-700/30
              hover:shadow-2xl hover:-translate-y-1 
              transition-all duration-300 overflow-hidden group"
            >
              {/* ✅ Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition duration-700"></div>

              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-600/80 rounded-xl shadow text-white">
                  <BookOpen size={28} />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-indigo-700 dark:text-indigo-300">
                    {m.title}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {m.lessons?.length || 0} Lessons
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
