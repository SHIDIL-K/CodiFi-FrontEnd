import React, { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";
import { LockClosedIcon, UserIcon } from "@heroicons/react/24/outline";
import Lottie from "lottie-react";

const BASE_URL = "https://codifi-backendend-new.onrender.com";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login, tokens } = useContext(AuthContext);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [lightAnim, setLightAnim] = useState(null);
  const [darkAnim, setDarkAnim] = useState(null);
  const navigate = useNavigate();

  // 🎬 Fetch login animations (light & dark)
  useEffect(() => {
    const fetchAnimations = async () => {
      try {
        const res = await fetch(`${BASE_URL}/media/animations/Login.json`);
        const data = await res.json();
        setLightAnim(data);
        setDarkAnim(data); // same animation for both modes
      } catch (err) {
        console.error("Error loading animation:", err);
      }
    };
    fetchAnimations();
  }, []);

  

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { user, tokens } = await login({ username, password });

      if (user.role === "instructor") {
        navigate("/instructor");
        return;
      }

      if (user.role === "student") {
        try {
          const res = await fetch(`${BASE_URL}/api/enrollments/`, {
            headers: { Authorization: `Bearer ${tokens.access}` },
          });

          if (!res.ok) {
            console.error("Enrollment auth error:", res.status);
            navigate("/home");
            return;
          }

          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            navigate("/student");
          } else {
            navigate("/home");
          }
        } catch (err) {
          console.error("Enrollment check failed:", err);
          navigate("/home");
        }
        return;
      }

      navigate("/courses");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="flex flex-col md:flex-row items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 transition-colors duration-500">
      {/* 🎨 Animation Section */}
      <motion.div
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="hidden md:flex w-1/2 justify-center items-center"
      >
        {lightAnim && (
          <div className="max-w-md w-4/5 dark:hidden">
            <Lottie animationData={lightAnim} loop autoplay />
          </div>
        )}
        {darkAnim && (
          <div className="max-w-md w-4/5 hidden dark:block">
            <Lottie animationData={darkAnim} loop autoplay />
          </div>
        )}
      </motion.div>

      {/* 🔐 Login Form Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="w-full md:w-1/2 flex justify-center px-6 md:px-12"
      >
        <div className="w-full max-w-md bg-white/80 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Welcome Back
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              Sign in to continue your learning journey
            </p>
          </div>

          {error && (
            <div className="mb-4 bg-red-100 dark:bg-red-900/40 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 text-sm rounded-lg p-3 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username Field */}
            <div className="relative">
              <UserIcon className="w-5 h-5 absolute left-3 top-3.5 text-gray-400 dark:text-gray-500" />
              <input
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>

            {/* Password Field */}
            <div className="relative">
              <LockClosedIcon className="w-5 h-5 absolute left-3 top-3.5 text-gray-400 dark:text-gray-500" />
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
              />
            </div>

            {/* Login Button */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={loading}
              className="w-full py-2.5 mt-2 rounded-lg text-white font-semibold shadow-md bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 transition"
            >
              {loading ? "Logging in..." : "Login"}
            </motion.button>
          </form>

          <div className="text-center mt-5 text-sm text-gray-600 dark:text-gray-400">
            Don’t have an account?{" "}
            <Link
              to="/signup"
              className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              Sign up
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
