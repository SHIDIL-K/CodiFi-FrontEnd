import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Lottie from "lottie-react";

const BASE_URL = "https://codifi-backendend-new.onrender.com";

export default function Index() {
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroAnimation, setHeroAnimation] = useState(null);
  const coursesRef = useRef(null);

  // Parallax scroll
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 600], [0, 120]);
  const y2 = useTransform(scrollY, [0, 600], [0, -120]);

  useEffect(() => {
    const load = async () => {
      try {
        const [coursesRes, instructorsRes, animationRes] = await Promise.all([
          fetch(`${BASE_URL}/api/courses/`),
          fetch(`${BASE_URL}/api/instructors/`),
          fetch(`${BASE_URL}/media/animations/index.json`),
        ]);

        if (coursesRes.ok) setCourses(await coursesRes.json());
        if (instructorsRes.ok) setInstructors(await instructorsRes.json());
        if (animationRes.ok) setHeroAnimation(await animationRes.json());
      } catch (err) {
        console.error("Failed to load homepage data:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const scrollToCourses = () => {
    const el = document.getElementById("courses-section") || coursesRef.current;
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen text-blue-600 dark:text-blue-400">
        Loading...
      </div>
    );

  return (
    <main className="w-full overflow-x-hidden">
      {/* 🌟 Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col-reverse md:flex-row items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 overflow-hidden">
        {/* Decorative Parallax Blobs */}
        <motion.div
          style={{ y: y1 }}
          className="absolute -left-20 -top-20 w-80 h-80 rounded-full bg-blue-300/25 dark:bg-blue-600/20 blur-3xl"
        />
        <motion.div
          style={{ y: y2 }}
          className="absolute -right-20 bottom-10 w-96 h-96 rounded-full bg-pink-300/20 dark:bg-pink-500/15 blur-3xl"
        />

        {/* Text Section */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex-1 text-center md:text-left px-8 md:px-16 z-10"
        >
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Learn Without Limits.
          </h1>
          <p className="mt-4 text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-xl">
            Master real-world skills with expert-led courses. Build your
            portfolio and launch your career — one project at a time.
          </p>
          <div className="mt-8 flex flex-wrap justify-center md:justify-start gap-4">
            <button
              onClick={scrollToCourses}
              className="px-7 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-full shadow-lg hover:scale-105 transition-transform"
            >
              Explore Courses <ArrowRight className="inline w-4 h-4 ml-1" />
            </button>
            <Link
              to="/signup/instructor"
              className="px-7 py-3 border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              Become an Instructor
            </Link>
          </div>
        </motion.div>

        {/* 🎞️ Lottie Animation */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex-1 flex justify-center items-center w-full md:w-auto"
        >
          {heroAnimation && (
            <Lottie
              animationData={heroAnimation}
              loop
              className="w-[90%] md:w-[480px] h-auto"
            />
          )}
        </motion.div>
      </section>

      {/* 🎓 Courses Section */}
      <section className="px-6 md:px-16 py-12">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-bold text-center mb-10 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
        >
          Popular Courses
        </motion.h2>

        {courses.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-400">
            No courses found.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative bg-white/70 dark:bg-gray-800/60 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
              >
                <div className="relative">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
                    ₹{course.price ?? "Free"}
                  </div>
                </div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-2xl opacity-0 group-hover:opacity-100 transition" />

                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                  {course.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                  {course.description}
                </p>

                {/* ✅ Course Duration */}
                <p className="text-xs text-gray-500 mb-3">
                  Duration:{" "}
                  <span className="text-gray-800 font-semibold">
                    {course.course_duration_months} months
                  </span>
                </p>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    Instructor: {course.instructor_name|| "Instructor"}
                  </span>

                  <Link
                    to={`/courses/${course.id}`}
                    className="flex items-center text-purple-600 dark:text-purple-400 hover:underline"
                  >
                    View <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* 🧑‍🏫 Instructors Section */}
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

      {/* 🚀 CTA Section */}
      <section className="py-20 px-6 md:px-12 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to level up your skills?
          </h3>
          <p className="text-md md:text-lg mb-6 max-w-2xl mx-auto">
            Join thousands of learners and start building real projects with
            world-class instructors.
          </p>
          <Link
            to="/signup"
            className="px-8 py-3 rounded-full bg-white text-purple-700 font-semibold shadow hover:shadow-2xl transition"
          >
            Get Started
          </Link>
        </motion.div>
      </section>
    </main>
  );
}
