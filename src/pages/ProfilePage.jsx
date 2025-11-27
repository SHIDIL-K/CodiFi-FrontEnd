import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Edit3, Save, X, ArrowLeft } from "lucide-react";
import Lottie from "lottie-react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";




const BASE_URL = "https://codifi-backendend-new.onrender.com";

export default function Profile() {
  const { tokens, refreshAccessToken, logout } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [animationData, setAnimationData] = useState(null);
  const [completion, setCompletion] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiData, setConfettiData] = useState(null);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    bio: "",
    phone: "",
    qualification: "",
    profile_picture: null,
  });

  // ✅ Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!tokens?.access) return;
      const res = await fetch(`${BASE_URL}/api/profile/`, {
        headers: { Authorization: `Bearer ${tokens.access}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setForm({
          bio: data.bio || "",
          phone: data.phone || "",
          qualification: data.qualification || "",
          profile_picture: null,
        });
        calculateCompletion(data);
      } else if (res.status === 401) {
        const newAccess = await refreshAccessToken();
        if (newAccess) return fetchProfile();
        logout();
      }
      setLoading(false);
    };
    fetchProfile();
  }, [tokens]);

  // ✅ Load animations
  useEffect(() => {
    fetch(`${BASE_URL}/media/animations/profile_avatar.json`)
      .then((res) => res.json())
      .then(setAnimationData)
      .catch(() => console.log("No Lottie animation found"));

    fetch(`${BASE_URL}/media/animations/confetti.json`)
      .then((res) => res.json())
      .then(setConfettiData)
      .catch(() => console.log("No confetti animation found"));
  }, []);

  // ✅ Calculate profile completion %
  const calculateCompletion = (data) => {
    let score = 0;
    if (data.profile_picture) score += 25;
    if (data.bio) score += 25;
    if (data.phone) score += 25;

    if (data.role === "instructor" && data.qualification) score += 25;
    else if (data.role !== "instructor") score += 25;

    setCompletion(score);

    // 🎉 Trigger confetti + toast when profile reaches 100%
    if (score === 100 && !showConfetti) {
      toast.success("🎉 Your profile is now 100% complete!");
      setShowConfetti(true);

      setTimeout(() => setShowConfetti(false), 5000);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleFileChange = (e) => setForm({ ...form, profile_picture: e.target.files[0] });

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);

    const formData = new FormData();
    formData.append("bio", form.bio);
    formData.append("phone", form.phone);
    formData.append("qualification", form.qualification);
    if (form.profile_picture) formData.append("profile_picture", form.profile_picture);

    const res = await fetch(`${BASE_URL}/api/profile/`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${tokens.access}` },
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      setProfile(data);
      calculateCompletion(data);
      setEditMode(false);

      toast.success("Profile updated successfully!");
    } else {
      toast.error("Failed to update profile.");
    }

    setUpdating(false);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-indigo-600 font-semibold text-lg animate-pulse">
        Loading your profile...
      </div>
    );

  if (!profile)
    return (
      <p className="text-center text-red-500 font-medium mt-20">Failed to load profile.</p>
    );

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-20 px-6 overflow-hidden">
      {/* 🎉 Confetti Popup Animation */}
      <AnimatePresence>
        {showConfetti && confettiData && (
          <motion.div
            key="confetti"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            <Lottie animationData={confettiData} loop={false} />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200 dark:border-gray-700 shadow-2xl rounded-3xl p-10 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-purple-400/10 to-pink-300/10 blur-3xl pointer-events-none"></div>

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 px-4 py-2  bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-gray-100 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
          <ArrowLeft className="w-5 h-5 text-gray-800 dark:text-gray-200" />
        </button>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-center justify-between relative z-10 mb-10">
          <div className="flex flex-col items-center md:items-start">
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              My Profile
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
              Manage your account and track your profile completion.
            </p>
          </div>
          <div className="w-40 md:w-56">
            {animationData && <Lottie animationData={animationData} loop autoplay />}
          </div>
        </div>

        {/* Profile Completion */}
        <div className="flex justify-center items-center gap-6 my-10">
          <div className="w-28 h-28">
            <CircularProgressbar
              value={completion}
              text={`${completion}%`}
              styles={buildStyles({
                textColor: "#4F46E5",
                pathColor: "url(#gradient)",
                trailColor: "#E5E7EB",
              })}
            />
            <svg style={{ height: 0 }}>
              <defs>
                <linearGradient id="gradient" gradientTransform="rotate(90)">
                  <stop offset="0%" stopColor="#6366F1" />
                  <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              Profile Completion
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {completion === 100
                ? "🎉 Great job! Your profile is complete."
                : "Complete your profile to unlock your full learning experience."}
            </p>
          </div>
        </div>

        {/* Profile Display */}
        <div className="flex flex-col items-center text-center relative z-10">
          <div className="relative">
            {profile.profile_picture ? (
              <img
                src={profile.profile_picture}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl"
              />
            ) : (
              <div className="w-32 h-32 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white text-3xl font-semibold border-4 border-white shadow-xl">
                {profile.username.charAt(0).toUpperCase()}
              </div>
            )}
            {editMode && (
              <label className="absolute bottom-2 right-2 bg-indigo-600 hover:bg-purple-600 text-white p-2 rounded-full cursor-pointer shadow-md transition">
                <Camera className="w-4 h-4" />
                <input type="file" accept="image/*" onChange={handleFileChange} hidden />
              </label>
            )}
          </div>

          <h2 className="mt-4 text-3xl font-semibold text-gray-900 dark:text-white">
            {profile.username}
          </h2>
          <p className="text-gray-500 dark:text-gray-400">{profile.email}</p>
          <p className="mt-2 text-sm px-3 py-1 bg-indigo-100 dark:bg-indigo-600/30 text-indigo-700 dark:text-indigo-300 rounded-full font-medium">
            {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
          </p>
        </div>

        <hr className="my-8 border-gray-300 dark:border-gray-700" />

        {/* Profile Info / Edit Mode */}
        {!editMode ? (
          <>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p><strong>📘 Bio:</strong> {profile.bio || "Not provided"}</p>
              <p><strong>📞 Phone:</strong> {profile.phone || "Not provided"}</p>
              {profile.role === "instructor" && (
                <p><strong>🎓 Qualification:</strong> {profile.qualification || "Not provided"}</p>
              )}
            </div>

            <div className="flex justify-center mt-10">
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-full shadow-lg transition-all"
              >
                <Edit3 className="w-4 h-4" /> Edit Profile
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleUpdate} className="space-y-5 mt-6">
            <InputField label="Bio" type="textarea" name="bio" value={form.bio} onChange={handleChange} />
            <InputField label="Phone" name="phone" value={form.phone} onChange={handleChange} />
            {profile.role === "instructor" && (
              <InputField label="Qualification" name="qualification" value={form.qualification} onChange={handleChange} />
            )}
            <div className="flex justify-center gap-4 pt-6">
              <button
                type="submit"
                disabled={updating}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full shadow transition"
              >
                <Save className="w-4 h-4" />
                {updating ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => setEditMode(false)}
                className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-full shadow transition"
              >
                <X className="w-4 h-4" /> Cancel
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}

/* Reusable Input Component */
const InputField = ({ label, name, value, onChange, type = "text" }) => (
  <div>
    <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">{label}</label>
    {type === "textarea" ? (
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
        rows="3"
      />
    ) : (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
      />
    )}
  </div>
);
