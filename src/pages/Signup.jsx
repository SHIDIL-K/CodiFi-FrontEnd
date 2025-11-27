import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { UserIcon, EnvelopeIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import Lottie from "lottie-react";
import { toast } from "react-toastify";


const BASE_URL = "https://codifi-backendend-new.onrender.com";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [animation, setAnimation] = useState(null);
  const navigate = useNavigate();

  // 🎬 Fetch signup animation from backend
  useEffect(() => {
    const fetchAnimation = async () => {
      try {
        const res = await fetch(`${BASE_URL}/media/animations/register.json`);
        const data = await res.json();
        setAnimation(data);
      } catch (err) {
        console.error("Error loading animation:", err);
      }
    };
    fetchAnimation();
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/register/student/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          password,
          role: "student",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || JSON.stringify(data));

      toast.success("🎉 Signup successful! Please login.");
      navigate("/login");
    } catch (err) {
      toast.error(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex flex-col md:flex-row items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 transition-colors duration-500">
      {/* 🎨 Animation Section */}
      <motion.div
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="hidden md:flex w-1/2 justify-center items-center"
      >
        {animation && (
          <div className="max-w-md w-4/5">
            <Lottie animationData={animation} loop autoplay />
          </div>
        )}
      </motion.div>

      {/* 🧾 Signup Form Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="w-full md:w-1/2 flex justify-center px-6 md:px-12"
      >
        <div className="w-full max-w-md bg-white/80 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Create Account
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              Join our learning community
            </p>
          </div>

          {error && (
            <div className="mb-4 bg-red-100 dark:bg-red-900/40 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 text-sm rounded-lg p-3 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            {/* Username */}
            <div className="relative">
              <UserIcon className="w-5 h-5 absolute left-3 top-3.5 text-gray-400 dark:text-gray-500" />
              <input
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
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
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
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
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
              />
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <LockClosedIcon className="w-5 h-5 absolute left-3 top-3.5 text-gray-400 dark:text-gray-500" />
              <input
                required
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
              />
            </div>

            {/* Signup Button */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={loading}
              className="w-full py-2.5 mt-2 rounded-lg text-white font-semibold shadow-md bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 disabled:opacity-50 transition"
            >
              {loading ? "Signing up..." : "Sign Up"}
            </motion.button>
          </form>

          <div className="text-center mt-5 text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-pink-600 dark:text-pink-400 hover:underline"
            >
              Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
