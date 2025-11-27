import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { ArrowLeft } from "lucide-react";



const BASE_URL = "https://codifi-backendend-new.onrender.com";

export default function CourseFeedbackPage() {
  const { id } = useParams();
  const { tokens, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [reviews, setReviews] = useState([]);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [hasReviewed, setHasReviewed] = useState(false);

  // ✅ Check enrollment
  const checkEnrollment = async () => {
    if (!tokens?.access) return;

    const res = await fetch(`${BASE_URL}/api/enrollments/`, {
      headers: { Authorization: `Bearer ${tokens.access}` },
    });

    const data = await res.json();
    const isEnrolled = data.some((e) => e.course.id === Number(id));

    setEnrolled(isEnrolled);
  };

  // ✅ Load reviews
  const loadReviews = async () => {
    const res = await fetch(`${BASE_URL}/api/courses/${id}/reviews/`);
    const data = await res.json();

    setReviews(data);

    const myReview = data.find((r) => r.student === user?.username);
    if (myReview) {
      setHasReviewed(true);
      setRating(myReview.rating);
      setComment(myReview.comment);
      setEditingId(myReview.id);
    }

    setLoading(false);
  };

  useEffect(() => {
    checkEnrollment();
    loadReviews();
  }, [id]);

  if (loading)
    return <div className="p-10 text-center text-blue-500">Loading...</div>;

  if (!enrolled)
    return (
      <div className="p-10 text-center text-red-500">
        You must be enrolled to leave a review.
      </div>
    );

  const submitReview = async () => {
    if (rating === 0) return toast.error("Select a rating first");

    const url = editingId
      ? `${BASE_URL}/api/reviews/${editingId}/update/`
      : `${BASE_URL}/api/reviews/create/`;

    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokens.access}`,
      },
      body: JSON.stringify({
        course: id,
        rating,
        comment,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.detail || "Something went wrong");
      return;
    }

    // ✅ Update UI
    if (editingId) {
      setReviews(reviews.map((r) => (r.id === editingId ? data : r)));
    } else {
      setReviews([...reviews, data]);
      setEditingId(data.id);
    }

    setHasReviewed(true);
    toast.success("Review saved!");
  };

  const deleteReview = async () => {
    if (!window.confirm("Delete review?")) return;

    const res = await fetch(`${BASE_URL}/api/reviews/${editingId}/delete/`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${tokens.access}` },
    });

    if (res.ok) {
      setReviews(reviews.filter((r) => r.id !== editingId));
      setRating(0);
      setComment("");
      setHasReviewed(false);
      setEditingId(null);
    }
  };

  const Star = ({ filled, onClick }) => (
    <span
      onClick={onClick}
      className={`cursor-pointer text-4xl ${
        filled ? "text-yellow-400" : "text-gray-400"
      }`}
    >
      ★
    </span>
  );

  return (
    <div className="min-h-screen px-6 py-24 
        bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 
        dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">

      <div className="max-w-3xl mx-auto">
        
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 px-4 py-2  bg-gradient-to-r from-indigo-600 to-purple-600 text-gray-100 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition"
      >
        <ArrowLeft className="w-5 h-5 text-gray-200" />
      </button>

        {/* 🏷️ Page Header */}
        <h1 className="text-4xl font-extrabold text-center mb-10 
          bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 
          bg-clip-text text-transparent drop-shadow">
          ⭐ Course Review
        </h1>

        {/* 📝 Review Form Container */}
        <div className="p-8 rounded-2xl shadow-xl 
            bg-white/70 dark:bg-gray-800/60 backdrop-blur-2xl 
            border border-gray-200 dark:border-gray-700 mb-12">

          <h2 className="text-2xl font-semibold mb-5 
              text-gray-900 dark:text-gray-100">
            {editingId ? "Edit Your Review" : "Write a Review"}
          </h2>

          {/* ⭐ Star Rating */}
          <div className="flex gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((n) => (
              <span
                key={n}
                onClick={() => setRating(n)}
                className={`cursor-pointer text-4xl transition 
                  ${n <= rating ? "text-yellow-400" : "text-gray-400 dark:text-gray-600"}
                  hover:scale-110`}
              >
                ★
              </span>
            ))}
          </div>

          <textarea
            className="w-full p-4 rounded-xl 
              bg-gray-50 dark:bg-gray-900/40 
              border border-gray-300 dark:border-gray-700 
              text-gray-800 dark:text-gray-200 
              focus:ring-2 focus:ring-indigo-500 outline-none transition"
            rows="4"
            placeholder="Write your feedback..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          <div className="mt-5 flex flex-wrap gap-4">
            <button
              onClick={submitReview}
              className="px-6 py-3 rounded-xl shadow-md text-white font-semibold
                bg-gradient-to-r from-indigo-600 to-purple-600
                hover:from-indigo-700 hover:to-purple-700 transition"
            >
              {editingId ? "Update Review" : "Submit Review"}
            </button>

            {editingId && (
              <button
                onClick={deleteReview}
                className="px-6 py-3 rounded-xl shadow-md text-white font-semibold
                  bg-gradient-to-r from-red-600 to-pink-600
                  hover:from-red-700 hover:to-pink-700 transition"
              >
                Delete Review
              </button>
            )}
          </div>
        </div>

        {/* 📜 All Reviews */}
        <h2 className="text-3xl font-bold mb-6 
          text-gray-900 dark:text-gray-100">
          All Reviews
        </h2>

        {reviews.length === 0 && (
          <p className="text-center py-10 text-gray-500 dark:text-gray-400">
            No reviews for this course yet.
          </p>
        )}

        {reviews.map((r) => (
          <div
            key={r.id}
            className="p-6 mb-6 rounded-2xl shadow-lg 
              bg-white/60 dark:bg-gray-800/50 backdrop-blur-xl 
              border border-gray-200 dark:border-gray-700 transition hover:shadow-xl"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                {r.student}
              </h3>
              <span className="text-yellow-400 text-xl">
                {"★".repeat(r.rating)}
              </span>
            </div>

            <p className="mt-3 text-gray-700 dark:text-gray-300">{r.comment}</p>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
              {new Date(r.created_at).toLocaleString()}
            </p>
          </div>
        ))}

      </div>
    </div>
  );
}
