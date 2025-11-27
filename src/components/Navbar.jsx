import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { SunIcon, MoonIcon, UserCircleIcon, BellIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
} from "lucide-react";

export default function Navbar() {
  const { user, logout, tokens, refreshAccessToken } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [unreadCount, setUnreadCount] = useState(0);

  const handleProfileClick = () => navigate("/profile");

  // ✅ Role-based home route
  const getHomeRoute = () => {
    if (!user) return "/index";
    if (user.role === "student") return "/home";
    if (user.role === "instructor") return "/instructor-home";
    if (user.role === "admin") return "/admin";
    return "/index";
  };

  const homeRoute = getHomeRoute();

  // 🌞 Theme Toggle
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    localStorage.setItem("theme", newTheme);
  };

  // 🔔 Fetch Notifications
  const fetchNotifications = async (accessToken) => {
    try {
      const res = await fetch("https://codifi-backendend-new.onrender.com/api/notifications/", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (res.status === 401 || res.status === 403) {
        const newAccess = await refreshAccessToken();
        if (newAccess) return fetchNotifications(newAccess);
        logout();
        return;
      }

      const data = await res.json();
      const unread = Array.isArray(data) ? data.filter((n) => !n.is_read).length : 0;
      setUnreadCount(unread);
    } catch (err) {
      console.error("Error fetching notifications:", err.message);
    }
  };

  // Auto-fetch notifications every 30s for students
  useEffect(() => {
    if (user && user.role === "student" && tokens?.access) {
      fetchNotifications(tokens.access);
      const interval = setInterval(() => fetchNotifications(tokens.access), 30000);
      return () => clearInterval(interval);
    }
  }, [user, tokens]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 backdrop-blur-md border-b ${
        isScrolled
          ? "bg-white/80 dark:bg-gray-900/80 shadow-md border-gray-200/20 dark:border-gray-800/40"
          : "bg-white/50 dark:bg-gray-900/50 border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* 🪩 Logo */}
        <Link
          to={homeRoute}
          className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:scale-105 transition-transform"
        >
          <div className="flex items-center gap-1 mb-1">
            <GraduationCap className="w-8 h-8 text-pink-400" />
            <h2 className="font-extrabold leading-tight bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              CodiFi
            </h2>
          </div>
        </Link>

        {/* 🌐 Nav Links */}
        <div className="hidden md:flex space-x-8 text-sm font-medium">
          <Link
            to={homeRoute}
            className="relative text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Home
            <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300 hover:w-full" />
          </Link>

          <Link
            to="/courses"
            className="relative text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Courses
            <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300 hover:w-full" />
          </Link>

          <Link
            to="/instructors"
            className="relative text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Instructors
            <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300 hover:w-full" />
          </Link>

          <Link
            to="/about"
            className="relative text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            About
            <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300 hover:w-full" />
          </Link>
          {!user ? (
            <Link
              to="https://codifi-backendend-new.onrender.com/admin/"
              className="relative text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Admin
              <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300 hover:w-full" />
            </Link>
          ) : (
            <></>
          )}

          {/* 🧭 Dashboards per role */}
          {user && user.role === "student" && (
            <Link
              to="/student"
              className="relative text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Dashboard
              <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300 hover:w-full" />
            </Link>
          )}
          {user && user.role === "instructor" && (
            <Link
              to="/instructor"
              className="relative text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Dashboard
              <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300 hover:w-full" />
            </Link>
          )}
          {user && user.role === "admin" && (
            <Link
              to="/admin"
              className="relative text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Dashboard
              <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300 hover:w-full" />
            </Link>
          )}
        </div>

        {/* 🌞 Theme + Auth Controls */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <motion.button
            onClick={toggleTheme}
            whileTap={{ rotate: 180, scale: 0.9 }}
            whileHover={{ scale: 1.15 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="p-2 rounded-full bg-gray-200/60 dark:bg-gray-700/50 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            <AnimatePresence mode="wait" initial={false}>
              {theme === "light" ? (
                <motion.div
                  key="moon"
                  initial={{ opacity: 0, rotate: 180 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: -180 }}
                >
                  <MoonIcon className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                </motion.div>
              ) : (
                <motion.div
                  key="sun"
                  initial={{ opacity: 0, rotate: -180 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 180 }}
                >
                  <SunIcon className="w-5 h-5 text-yellow-400" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {/* 🔔 Notification Bell (Students Only) */}
          {user && user.role === "student" && (
            <div className="relative">
              <Link
                to="/student/notifications"
                className="relative flex items-center justify-center w-9 h-9 rounded-full bg-gray-200/60 dark:bg-gray-700/50 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                <BellIcon className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center"
                  >
                    {unreadCount}
                  </motion.span>
                )}
              </Link>
            </div>
          )}

          {/* Auth Buttons */}
          {!user ? (
            <>
              <Link
                to="/login"
                className="px-4 py-1.5 text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow hover:shadow-lg hover:scale-105 transition-transform"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-4 py-1.5 text-sm font-medium border border-gray-300 dark:border-gray-600 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                Signup
              </Link>
            </>
          ) : (
            <>
              <button
                onClick={logout}
                className="hidden md:inline px-3 py-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition"
              >
                Logout
              </button>
              <div
                onClick={handleProfileClick}
                className="cursor-pointer w-10 h-10 rounded-full overflow-hidden border-2 border-blue-500 hover:scale-105 transition-transform"
              >
                {user.profile_picture ? (
                  <img
                    src={user.profile_picture}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="bg-gray-200 dark:bg-gray-700 flex justify-center items-center w-full h-full">
                    <UserCircleIcon className="w-6 h-6 text-gray-500 dark:text-gray-300" />
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
