import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

const BASE_URL = "https://codifi-backendend-new.onrender.com";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const { tokens } = useContext(AuthContext);

  const loadCourses = async (searchQuery = "") => {
    setLoading(true);
    try {
      const endpoint = searchQuery
        ? `${BASE_URL}/api/courses/search/?search=${encodeURIComponent(searchQuery)}`
        : `${BASE_URL}/api/courses/`;

      const res = await fetch(endpoint, {
        headers: {
          "Content-Type": "application/json",
          ...(tokens?.access ? { Authorization: `Bearer ${tokens.access}` } : {}),
        },
      });

      const data = await res.json();
      setCourses(data);
    } catch (err) {
      console.error("Error loading courses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setQuery(value);
    loadCourses(value);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto pt-24 dark:bg-gray-900 dark:text-gray-100 min-h-screen transition-colors">
      <h1 className="text-3xl font-extrabold mb-6 text-gray-800 dark:text-gray-100">Explore Courses</h1>

      <div className="relative mb-8 max-w-md mx-auto">
        <Search className="absolute left-3 top-3 text-gray-400 dark:text-gray-300" size={20} />
        <input
          value={query}
          onChange={handleSearch}
          placeholder="Search courses..."
          className="w-full pl-10 pr-4 py-3 border rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
        />
      </div>

      {loading ? (
        <div className="text-center text-blue-600 text-lg dark:text-blue-400">Loading...</div>
      ) : courses.length === 0 ? (
        <div className="text-center text-gray-600 dark:text-gray-300 text-lg">No courses found.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((c) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.2 }}
              className="relative rounded-2xl p-5 bg-white shadow-md border hover:shadow-2xl hover:border-blue-400 transition cursor-pointer dark:bg-gray-800 dark:border-gray-700 dark:hover:border-blue-500"
            >
              {c.has_offer && (
                <div className="absolute top-3 left-3 px-3 py-1 text-xs font-bold bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-full shadow">
                  SALE
                </div>
              )}

              {c.image && (
                <img
                  src={c.image}
                  alt={c.title}
                  className="w-full h-40 object-cover rounded-xl mb-4"
                />
              )}

              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">{c.title}</h3>

              <p className="text-sm text-gray-500 dark:text-gray-300 mb-4 leading-relaxed">
                {c.description?.slice(0, 110)}...
              </p>

              <div className="mb-2">
                {c.has_offer ? (
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">₹{c.discount_price}</span>
                    <span className="line-through text-gray-400 text-sm dark:text-gray-500">₹{c.price}</span>
                  </div>
                ) : (
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">₹{c.price}</span>
                )}
              </div>

              {c.has_offer && c.offer_expires && (
                <p className="text-xs text-red-600 dark:text-red-400 mb-2">
                  Offer ends: <span className="font-semibold">{new Date(c.offer_expires).toLocaleDateString()}</span>
                </p>
              )}

              <p className="text-xs text-gray-400 dark:text-gray-300 mb-3">
                Instructor: <span className="text-gray-700 dark:text-gray-100 font-medium">{c.instructor_name || "Not assigned"}</span>
              </p>

              <p className="text-xs text-gray-500 dark:text-gray-300 mb-3">
                Duration: <span className="text-gray-800 dark:text-gray-100 font-semibold">{c.course_duration_months} months</span>
              </p>

              <Link
                to={`/courses/${c.id}`}
                className="inline-block w-full text-center mt-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow hover:shadow-lg transition"
              >
                View Course
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
