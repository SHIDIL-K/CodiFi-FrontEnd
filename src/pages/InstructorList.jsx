// src/pages/InstructorList.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

export default function InstructorList() {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const response = await axios.get("https://codifi-backendend-new.onrender.com/api/instructors/");
        setInstructors(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch instructors");
        setLoading(false);
      }
    };
    fetchInstructors();
  }, []);

  // Skeleton while loading
  const SkeletonCard = () => (
    <div className="relative bg-white/10 dark:bg-gray-800/20 backdrop-blur-lg rounded-2xl p-6 animate-pulse shadow-md border border-transparent">
      <div className="w-24 h-24 rounded-full bg-gray-300 dark:bg-gray-700 mx-auto mb-4"></div>
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mx-auto mb-2"></div>
      <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-5/6 mx-auto"></div>
    </div>
  );

  if (error)
    return <p className="text-center mt-10 text-red-500 font-medium">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 py-16 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-4xl font-bold mb-10 text-center bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text"
        >
          Our Instructors
        </motion.h2>

        {/* Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map((_, idx) => (
              <SkeletonCard key={idx} />
            ))}
          </div>
        ) : instructors.length === 0 ? (
          <p className="text-center text-gray-500 text-lg mt-10">
            No instructors found.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {instructors.map((instructor, index) => (
              <motion.div
                key={instructor.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.8, ease: "easeOut" }}
                className="relative group bg-white/10 dark:bg-gray-800/20 backdrop-blur-lg rounded-2xl overflow-hidden shadow-md border border-transparent hover:border-blue-400/50 hover:shadow-xl transition-all duration-700"
              >
                {/* Shimmer hover effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 animate-[shimmer_2s_infinite]"></div>

                {/* Profile Image */}
                <div className="flex justify-center mt-6">
                  <img
                    src={
                      instructor.profile_picture && instructor.profile_picture !== "null"
                        ? instructor.profile_picture
                        : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                    }
                    alt={instructor.username}
                    className="w-28 h-28 rounded-full object-cover border-2 border-white/30 shadow-md"
                  />
                </div>

                {/* Info */}
                <div className="p-6 text-center">
                  <h3 className="text-xl font-semibold mb-1">
                    {instructor.username}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    {instructor.email}
                  </p>
                  {instructor.bio && (
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {instructor.bio}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Shimmer Keyframes */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
