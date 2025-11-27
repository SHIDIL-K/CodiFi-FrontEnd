import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import {
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  PaperClipIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-toastify";

const BASE_URL = "https://codifi-backendend-new.onrender.com"; // adjust if needed

export default function InstructorSignup() {
  const [animationData, setAnimationData] = useState(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [certificate, setCertificate] = useState(null);
  const [experience, setExperience] = useState("");
  const [qualification, setQualification] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ Fetch animation from backend
  useEffect(() => {
    const fetchAnimation = async () => {
      try {
        const response = await fetch(`${BASE_URL}/media/animations/instructor.json`);
        if (!response.ok) throw new Error("Failed to load animation");
        const data = await response.json();
        setAnimationData(data);
      } catch (err) {
        console.error("Animation load error:", err);
      }
    };
    fetchAnimation();
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("role", "instructor");
      if (certificate) formData.append("certificate", certificate);
      formData.append("experience", experience);
      formData.append("qualification", qualification);

      const res = await fetch(`${BASE_URL}/api/register/instructor/`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Signup failed");
      }

      toast.success("Signup submitted! Wait for admin approval before logging in.");
      navigate("/login");

    } catch (err) {
      toast.error(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-center min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 transition-colors duration-500">
      {/* 🎬 Animation Section */}
      <motion.div
        initial={{ opacity: 0, x: -80 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="hidden md:flex w-1/2 justify-center items-center"
      >
        {animationData ? (
          <div className="max-w-md w-4/5">
            <Lottie animationData={animationData} loop={true} />
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-sm">Loading animation...</p>
        )}
      </motion.div>

      {/* 🧾 Signup Form */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="w-full md:w-1/2 flex justify-center px-6 md:px-12"
      >
        <div className="w-full max-w-md bg-white/80 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Instructor Registration
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              Share your expertise and teach students worldwide
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            {/* Username */}
            <div className="relative">
              <UserIcon className="w-5 h-5 absolute left-3 top-3.5 text-gray-400 dark:text-gray-500" />
              <input
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
              />
            </div>

            {/* Email */}
            <div className="relative">
              <EnvelopeIcon className="w-5 h-5 absolute left-3 top-3.5 text-gray-400 dark:text-gray-500" />
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <LockClosedIcon className="w-5 h-5 absolute left-3 top-3.5 text-gray-400 dark:text-gray-500" />
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
              />
            </div>

            {/* Certificate */}
            <div className="relative">
              <PaperClipIcon className="w-5 h-5 absolute left-3 top-3.5 text-gray-400 dark:text-gray-500" />
              <input
                type="file"
                accept=".pdf,.jpg,.png"
                onChange={(e) => setCertificate(e.target.files[0])}
                className="w-full pl-10 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition file:mr-3 file:py-1 file:px-2 file:border-0 file:bg-green-600 file:text-white file:rounded-md file:text-sm"
              />
            </div>

            {/* Experience */}
            <div className="relative">
              <BriefcaseIcon className="w-5 h-5 absolute left-3 top-3.5 text-gray-400 dark:text-gray-500" />
              <input
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="Experience (e.g., 3 years)"
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
              />
            </div>

            {/* Qualification */}
            <div className="relative">
              <AcademicCapIcon className="w-5 h-5 absolute left-3 top-3.5 text-gray-400 dark:text-gray-500" />
              <input
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                placeholder="Qualification"
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
              />
            </div>

            {/* Info */}
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Instructors must be approved by an admin before they can log in.
            </p>

            {/* Submit Button */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={loading}
              className="w-full py-2.5 mt-2 rounded-lg text-white font-semibold shadow-md bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 disabled:opacity-50 transition"
            >
              {loading ? "Submitting..." : "Signup as Instructor"}
            </motion.button>
          </form>

          <div className="text-center mt-5 text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-green-600 dark:text-green-400 hover:underline"
            >
              Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
