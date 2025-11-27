// src/pages/About.jsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import { Users, BookOpen, Award, Globe2, Heart, Rocket } from "lucide-react";

const BASE_URL = "https://codifi-backendend-new.onrender.com";

export default function About() {
  const [animationData, setAnimationData] = useState(null);

  // Load Lottie Animation
  useEffect(() => {
    fetch(`${BASE_URL}/media/animations/about.json`)
      .then((res) => res.json())
      .then(setAnimationData)
      .catch(() => console.log("No about.json animation found"));
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 via-blue-50 to-purple-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-800 dark:text-gray-100 pt-28 pb-20 transition-colors duration-500">
      {/* 🌟 Hero Section */}
      <section className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between px-6 gap-10 mb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-1 text-center md:text-left"
        >
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
            About <span className="text-pink-500">CodiFi</span>
          </h1>
          <p className="mt-6 text-lg text-gray-700 dark:text-gray-300 max-w-xl">
            CodiFi is your one-stop e-learning platform built to empower learners,
            instructors, and organizations. We make learning interactive, accessible,
            and future-ready.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          className="flex-1 flex justify-center"
        >
          {animationData ? (
            <Lottie animationData={animationData} loop autoplay className="w-[380px] h-[380px]" />
          ) : (
            <div className="text-4xl">🎓</div>
          )}
        </motion.div>
      </section>

      {/* 💡 Mission & Vision Section */}
      <section className="max-w-6xl mx-auto px-6 mb-20">
        <h2 className="text-3xl font-bold text-center mb-12">Our Mission & Vision</h2>
        <div className="grid md:grid-cols-2 gap-10">
          {[
            {
              icon: <Rocket className="w-8 h-8 text-blue-500" />,
              title: "Our Mission",
              desc: "To bridge the skill gap by offering practical, project-based courses that prepare learners for real-world success.",
              gradient: "from-blue-500 to-purple-500",
            },
            {
              icon: <Globe2 className="w-8 h-8 text-pink-500" />,
              title: "Our Vision",
              desc: "To create a global learning community that inspires innovation, collaboration, and lifelong growth.",
              gradient: "from-pink-500 to-purple-600",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.03 }}
              className={`p-8 rounded-3xl shadow-xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all`}
            >
              <div className={`p-3 inline-block rounded-xl bg-gradient-to-br ${item.gradient} bg-opacity-20`}>
                {item.icon}
              </div>
              <h3 className="text-2xl font-semibold mt-4">{item.title}</h3>
              <p className="mt-3 text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 📘 What We Offer */}
      <section className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg py-20 border-y border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            What We Offer
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              {
                title: "For Students",
                desc: "Access interactive lessons, track your progress, and gain in-demand skills for your future career.",
                icon: <BookOpen className="w-8 h-8 text-indigo-500" />,
              },
              {
                title: "For Instructors",
                desc: "Manage assigned courses, deliver engaging lessons, and connect with students effectively.",
                icon: <Users className="w-8 h-8 text-green-500" />,
              },
              {
                title: "For Admins",
                desc: "Effortlessly manage users, courses, and the learning environment with an intuitive dashboard.",
                icon: <Award className="w-8 h-8 text-yellow-500" />,
              },
            ].map((card, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
                className="p-8 rounded-2xl shadow-xl bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 text-center"
              >
                <div className="flex justify-center mb-4">{card.icon}</div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                  {card.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {card.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 👥 Team Section (Optional Placeholder) */}
      <section className="max-w-6xl mx-auto px-6 mt-20">
        <h2 className="text-3xl font-bold text-center mb-10">
          Meet Our Team
        </h2>
        <div className="text-center text-gray-600 dark:text-gray-400">
          <p>
            Our team of educators, developers, and mentors work together to make learning simple, enjoyable, and impactful.  
            <br />
            <span className="text-pink-500 font-medium">Team section coming soon 🚀</span>
          </p>
        </div>
      </section>

      {/* ❤️ Footer Message */}
      <section className="mt-24 py-12 text-center bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-t-3xl">
        <h2 className="text-2xl md:text-3xl font-extrabold mb-3">
          Empowering Learners. Transforming Futures.
        </h2>
        <p className="text-sm opacity-90 max-w-2xl mx-auto">
          Together, we’re building a learning revolution — one course, one student, one success story at a time.
        </p>
      </section>
    </main>
  );
}
