import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Lottie from "lottie-react";
import { AuthContext } from "../context/AuthContext";

const BASE_URL = "https://codifi-backendend-new.onrender.com";

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroAnim, setHeroAnim] = useState(null);
  const { tokens } = useContext(AuthContext);

  // Load Lottie animation
  useEffect(() => {
    fetch(`${BASE_URL}/media/animations/STUDENT.json`)
      .then((res) => res.json())
      .then(setHeroAnim)
      .catch(() => {});
  }, []);

  // Load courses + instructors
  useEffect(() => {
    const load = async () => {
      try {
        const [cRes, iRes] = await Promise.all([
          fetch(`${BASE_URL}/api/courses/`, {
            headers: {
              Authorization: tokens?.access ? `Bearer ${tokens.access}` : "",
            },
          }),
          fetch(`${BASE_URL}/api/instructors/`),
        ]);
        if (cRes.ok) setCourses(await cRes.json());
        if (iRes.ok) setInstructors(await iRes.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-blue-600 text-xl">
        Loading...
      </div>
    );

  return (
    <main className="bg-gradient-to-b from-blue-50 via-indigo-100 to-purple-100 
    dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">

      {/* ✅ HERO SECTION */}
      <section className="relative min-h-[90vh] flex flex-col-reverse md:flex-row 
      items-center justify-center px-6 md:px-20 py-20 overflow-hidden">

        {/* Neon Background Glow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.45 }}
          transition={{ delay: 0.3 }}
          className="absolute w-[900px] h-[900px] 
            bg-[conic-gradient(at_top,_#4f46e5,_#8b5cf6,_#ec4899)]
            blur-[150px] rounded-full top-1/3 left-1/3 
            -translate-x-1/2 -translate-y-1/2"
        />

        {/* HERO TEXT */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="z-10 flex-1 text-center md:text-left"
        >
          <h1 className="text-5xl md:text-6xl font-extrabold 
          bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-600 
          text-transparent bg-clip-text leading-tight drop-shadow-xl">
            Learn Anytime, Anywhere.
          </h1>

          <p className="mt-6 text-lg md:text-xl 
          text-gray-700 dark:text-gray-300 max-w-xl">
            Join thousands of learners mastering skills through 
            modern, real-world courses.
          </p>

          <Link
            to="/courses"
            className="mt-8 inline-block px-8 py-3 rounded-full text-white font-semibold 
            bg-gradient-to-r from-purple-600 to-pink-600 hover:from-pink-700 hover:to-red-600 
            shadow-xl hover:shadow-2xl transition-all">
            Explore Courses
          </Link>
        </motion.div>

        {/* ✅ HERO LOTTIE ANIMATION */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="flex-1 flex justify-center"
        >
          {heroAnim ? (
            <Lottie animationData={heroAnim} loop autoplay className="w-[420px] h-[420px]" />
          ) : (
            <div className="text-4xl">🎬</div>
          )}
        </motion.div>
      </section>

      {/* ✅ COURSES SECTION */}
      <section className="py-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 
          text-gray-900 dark:text-gray-100">
            Featured Courses
          </h2>

          {/* ✅ Modern Portrait Glass + Neon Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {courses.length ? (
              courses.map((c, idx) => {
                // Offer countdown logic
                const expires = c.offer_expires ? new Date(c.offer_expires) : null;
                const now = new Date();
                const hoursLeft = expires ? Math.max(0, Math.floor((expires - now) / 3600000)) : 0;

                return (
                  <motion.div
                    key={c.id || idx}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    viewport={{ once: true }}
                    className="relative group bg-white/20 dark:bg-gray-800/30 backdrop-blur-xl 
                    border border-gray-200/40 dark:border-gray-700/40 rounded-3xl shadow-xl 
                    hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 p-5 overflow-hidden"
                  >
                    {/* Offer Ribbon */}
                    {c.has_offer && (
                      <div className="absolute top-4 left-4 bg-gradient-to-r 
                      from-red-600 to-orange-500 text-white text-xs font-bold px-3 py-1 
                      rounded-full shadow-xl z-10">
                        🔥 Limited Offer
                      </div>
                    )}

                    {/* Course Image */}
                    <div className="overflow-hidden rounded-2xl">
                      <img
                        src={c.image}
                        alt={c.title}
                        className="w-full h-56 object-cover rounded-2xl group-hover:scale-105 
                        transition-transform duration-500"
                      />
                    </div>

                    {/* Content */}
                    <div className="mt-5 flex flex-col">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white leading-snug">
                        {c.title}
                      </h3>

                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 mt-2">
                        {c.description}
                      </p>

                      {/* ✅ Course Duration */}
                      <p className="text-xs text-gray-500 mb-3 mt-1 line-clamp-2">
                        Duration:{" "}
                        <span className="text-gray-800 font-semibold">
                          {c.course_duration_months} months
                        </span>
                      </p>

                      <div className="mt-4 flex items-end justify-between">
                        <Link
                          to={`/courses/${c.id}`}
                          className="text-indigo-600 dark:text-indigo-400 font-semibold 
                          hover:underline flex items-center gap-1"
                        >
                          View Course <ArrowRight size={15} />
                        </Link>

                        {/* Price + Offer */}
                        {c.has_offer ? (
                          <motion.div
                            animate={{ x: [0, -3, 3, -2, 2, 0] }}
                            transition={{ duration: 0.4 }}
                            className="text-right"
                          >
                            <p className="text-green-400 font-bold text-xl neon-text">
                              ₹{c.discount_price}
                            </p>
                            <p className="line-through text-gray-400 text-sm">
                              ₹{c.price}
                            </p>
                          </motion.div>
                        ) : (
                          <span className="text-gray-900 dark:text-gray-100 font-semibold text-lg">
                            ₹{c.price}
                          </span>
                        )}
                      </div>

                      {/* Countdown */}
                      {c.has_offer && (
                        <p className="text-pink-600 text-xs mt-2 font-semibold">
                          ⏳ {hoursLeft} hours left
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <p>No courses available.</p>
            )}
          </div>
        </div>
      </section>

      {/* ✅ Instructors Section (unchanged but upgraded styling automatically applies) */}
      <section className="py-20 px-6 md:px-12 bg-gradient-to-r 
      from-indigo-100 via-purple-100 to-pink-100 
      dark:from-gray-800 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 
          text-gray-900 dark:text-gray-100">
            Meet Our Instructors
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {instructors?.length ? (
              instructors.map((inst, idx) => (
                <motion.div
                  key={inst.id || idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  viewport={{ once: true }}
                  className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border
                  border-gray-200/40 dark:border-gray-700/40 rounded-2xl shadow-xl 
                  p-6 text-center hover:shadow-2xl transition-all"
                >
                  <img
                    src={
                      inst.profile_picture ||
                      "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                    }
                    alt={inst.username}
                    className="w-28 h-28 rounded-full mx-auto object-cover border-4
                    border-indigo-200 dark:border-gray-700 mb-4"
                  />

                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                    {inst.username}
                  </h3>

                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                    {inst.bio || "Passionate educator helping you grow"}
                  </p>
                </motion.div>
              ))
            ) : (
              <p>No instructors found.</p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
