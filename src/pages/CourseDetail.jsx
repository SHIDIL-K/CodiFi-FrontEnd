import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { ArrowLeft } from "lucide-react";


const BASE_URL = "https://codifi-backendend-new.onrender.com";

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, tokens } = useContext(AuthContext);

  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [error, setError] = useState("");

  // Reviews UI state
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hasReviewed, setHasReviewed] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);

  // Lottie animations (attempt to load 3 small animations)
  const [animHeader, setAnimHeader] = useState(null);
  const [animModules, setAnimModules] = useState(null);
  const [animReviews, setAnimReviews] = useState(null);

  useEffect(() => {
    // load small lotties if present (fail silently)
    fetch(`${BASE_URL}/media/animations/profile_avatar.json`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => j && setAnimHeader(j))
      .catch(() => {});

    fetch(`${BASE_URL}/media/animations/instructor.json`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => j && setAnimModules(j))
      .catch(() => {});

    fetch(`${BASE_URL}/media/animations/about.json`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => j && setAnimReviews(j))
      .catch(() => {});
  }, []);

  // Check if user is enrolled (preserves your original logic)
  const checkEnrollmentStatus = async () => {
    if (!tokens?.access || !user) return;
    try {
      const res = await fetch(`${BASE_URL}/api/enrollments/`, {
        headers: { Authorization: `Bearer ${tokens.access}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setEnrolled(data.some((e) => e.course.id === parseInt(id)));
    } catch (e) {
      // ignore
    }
  };

  // Load course detail (course, modules, reviews)
  useEffect(() => {
    const loadCourse = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/api/courses/${id}/detail/`, {
          headers: {
            "Content-Type": "application/json",
            ...(tokens?.access ? { Authorization: `Bearer ${tokens.access}` } : {}),
          },
        });

        if (!res.ok) throw new Error("Course not found");
        const data = await res.json();
        setCourseData(data);

        if (user) {
          const already = (data.reviews || []).some((r) => r.student === user.username);
          setHasReviewed(already);
        }

        checkEnrollmentStatus();
      } catch (err) {
        setError(err.message || "Failed to load course");
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, tokens?.access]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] text-blue-600 text-xl pt-10">
        Loading course...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-20 text-red-500 font-semibold">{error}</div>
    );
  }

  // destructure safely
  const { course = {}, modules = [], reviews = [] } = courseData || {};
  const discountedPrice = course.discount_price || null;
  const finalPrice = discountedPrice ?? course.price ?? 0;

  // Payment flow (keeps your logic; uses orderData.key when present)
  const handlePayment = async () => {
    if (!user) return navigate("/login");

    if (user.role !== "student") {
      toast.error("Only students can purchase courses.");
      return;
    }

    try {
      const orderRes = await fetch(`${BASE_URL}/api/razorpay/create-order/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokens?.access}`,
        },
        body: JSON.stringify({
          course_id: course.id,
          amount: Number(finalPrice),
        }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        toast.error(orderData.error || "Could not create payment order.");
        return;
      }

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: "INR",
        name: course.title,
        description: "Course Enrollment",
        order_id: orderData.order_id,

        handler: async function (response) {
          const verifyRes = await fetch(`${BASE_URL}/api/razorpay/verify-payment/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${tokens?.access}`,
            },
            body: JSON.stringify(response),
          });

          if (verifyRes.ok) {
            toast.success("Payment Successful!");
            setEnrolled(true);
            navigate("/student");
          } else {
            toast.error("Payment verification failed.");
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error("Payment error. Try again.");
    }
  };



  // Review actions (create/update)
  const submitReview = async () => {
    if (user?.role !== "student") {
      toast.error("Only students can submit reviews.");
      return;
    }

    if (rating === 0) {
      toast.warning("Select a star rating.");
      return;
    }

    const url = editingReviewId
      ? `${BASE_URL}/api/reviews/${editingReviewId}/update/`
      : `${BASE_URL}/api/reviews/create/`;

    const method = editingReviewId ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokens?.access}`,
        },
        body: JSON.stringify({
          course: course.id,
          rating,
          comment,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.detail || "Error submitting review");
        return;
      }

      if (editingReviewId) {
        toast.success("Review updated!");
        setCourseData({
          ...courseData,
          reviews: courseData.reviews.map((rev) =>
            rev.id === editingReviewId ? data : rev
          ),
        });
      } else {
        toast.success("Review added!");
        setCourseData({
          ...courseData,
          reviews: [...courseData.reviews, data],
        });
      }

      setEditingReviewId(null);
      setRating(0);
      setComment("");
      setHasReviewed(true);

    } catch (err) {
      toast.error("Failed to submit review.");
    }
  };



  const deleteReview = (reviewId) => {
    toast.info(
      <div>
        <p className="font-medium">Delete your review?</p>

        <div className="flex gap-3 mt-2">
          <button
            className="px-3 py-1 bg-red-600 text-white rounded"
            onClick={async () => {
              toast.dismiss();

              try {
                const res = await fetch(`${BASE_URL}/api/reviews/${reviewId}/delete/`, {
                  method: "DELETE",
                  headers: { Authorization: `Bearer ${tokens?.access}` },
                });

                if (res.ok) {
                  setCourseData({
                    ...courseData,
                    reviews: courseData.reviews.filter((r) => r.id !== reviewId),
                  });
                  setHasReviewed(false);
                  toast.success("Review deleted!");
                } else {
                  toast.error("Failed to delete review.");
                }
              } catch {
                toast.error("Server error deleting review.");
              }
            }}
          >
            Delete
          </button>

          <button
            className="px-3 py-1 bg-gray-400 rounded"
            onClick={() => toast.dismiss()}
          >
            Cancel
          </button>
        </div>
      </div>,
      { autoClose: false }
    );
  };



  // small helper to compute average safely
  const averageRating = reviews.length
    ? reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length
    : 0;

  return (
    <div className=" mx-auto px-1 pt-10 pb-24">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 m-8 mt-10 mb-3 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-gray-100 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition"
      >
        <ArrowLeft className="w-4 h-4" />
      </button>
      {/* Container: card-like center column */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border dark:border-gray-800">
        {/* Header: split left (image), right (info) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
          {/* Left: image with tasteful crop + overlay */}
          <div className="md:col-span-1 relative h-64 md:h-auto">
            {course.image ? (
              <img
                src={course.image}
                alt={course.title}
                className="w-full h-full object-cover"
                style={{ objectPosition: "center" }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-pink-400 flex items-center justify-center">
                <div className="text-white text-2xl font-bold">No Image</div>
              </div>
            )}

            {/* subtle overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
          </div>

          {/* Right: content */}
          <div className="md:col-span-2 p-6 md:p-8">
            <div className="flex items-start gap-6">
              <div className="flex-1">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white leading-tight">
                  {course.title}
                </h1>

                <p className="mt-3 text-gray-600 dark:text-gray-300 max-w-3xl">
                  {course.description}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg">
                    <div className="text-xs text-gray-500">Instructor</div>
                    <div className="font-medium text-gray-800 dark:text-gray-100">
                      {course.instructor_name || "Not assigned"}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg">
                    <div className="text-xs text-gray-500">Duration</div>
                    <div className="font-medium text-gray-800 dark:text-gray-100">
                      {course.course_duration_months} month
                      {course.course_duration_months > 1 ? "s" : ""}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg">
                    <div className="text-xs text-gray-500">Price</div>
                    <div className="font-bold text-green-600 dark:text-green-400">
                      ₹{discountedPrice ?? course.price}
                    </div>
                    {discountedPrice && (
                      <div className="text-sm line-through text-gray-400">
                        ₹{course.price}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="w-44 flex flex-col items-center pt-5 gap-3">
                  {user?.role === "instructor" || user?.role === "admin" ? (
                    <div className="text-sm italic text-gray-500 dark:text-gray-400">
                      Enrollment available for students only
                    </div>
                  ) : enrolled ? (
                    <button
                      onClick={() => navigate(`/courses/${id}/student-view/`)}
                      className="w-full px-4 py-2 rounded-full bg-green-600 text-white font-semibold hover:bg-green-700 transition"
                    >
                      View Course
                    </button>
                  ) : (
                    <button
                      onClick={handlePayment}
                      className="w-full px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-indigo-700 hover:to-purple-700 transition"
                    >
                      Enroll Now
                    </button>
                  )}

                  {/* small rating block */}
                  <div className="mt-2 flex items-center gap-3">
                    <div className="text-lg font-bold text-yellow-500">
                      {averageRating ? averageRating.toFixed(1) : "—"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                </div>
              </div>
              
            </div>

            {/* Decorative Lottie under header (subtle) */}
            {animHeader && (
              <div className="mt-6">
                <Lottie animationData={animHeader} loop={true} style={{ height: 180 }} />
              </div>
            )}
          </div>
        </div>

        {/* Modules section */}
        <div className="p-6 md:p-8 border-t dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Course Modules</h2>
              <p className="text-sm text-gray-500">Quick overview — module titles only</p>
            </div>

            {/* small lottie icon */}
            {animModules && (
              <div className="w-15 h-8 mt-6">
                <Lottie animationData={animModules} loop={true} style={{ width: 100, height: 100 }} />
              </div>
            )}
          </div>

          {/* modules grid: compact modern boxes */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {modules.length ? (
              modules.map((mod, idx) => (
                <div
                  key={mod.id}
                  className="relative group p-4 rounded-xl bg-white dark:bg-gray-800 border hover:shadow-xl transition flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-md flex items-center justify-center bg-gradient-to-br from-indigo-500 to-pink-500 text-white font-bold">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800 dark:text-gray-100 truncate">
                      {mod.title}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {mod.lessons?.length ? `${mod.lessons.length} lesson${mod.lessons.length > 1 ? "s" : ""}` : "No lessons"}
                    </div>
                  </div>

                  {/* small chevron to keep it modern (no click behavior by default) */}
                  <div className="opacity-0 group-hover:opacity-100 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-500">No modules added yet.</div>
            )}
          </div>
        </div>

        {/* Reviews + Rating area (with lottie) */}
        <div className="max-w-7xl mx-auto p-6 md:p-8 border-t dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">Course Rating</h3>
              <p className="text-sm text-gray-500">Detailed breakdown & student reviews</p>
            </div>

            {animReviews && (
              <div className="w-14 h-14">
                <Lottie animationData={animReviews} loop={true} style={{ width: 80, height: 80 }} />
              </div>
            )}
          </div>

          {/* Rating summary + distribution */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg flex flex-col items-center">
              <div className="text-4xl font-bold text-yellow-400">{averageRating ? averageRating.toFixed(1) : "—"}</div>
              <div className="mt-1 text-sm text-gray-500">{reviews.length} reviews</div>
              <div className="mt-3 text-yellow-400 text-xl">
                {"★".repeat(Math.round(averageRating))}<span className="text-gray-300">{"★".repeat(5 - Math.round(averageRating))}</span>
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="space-y-3">
                {[5,4,3,2,1].map(star => {
                  const count = reviews.filter(r => r.rating === star).length;
                  const percent = reviews.length ? Math.round((count / reviews.length) * 100) : 0;
                  return (
                    <div key={star} className="flex items-center gap-3">
                      <div className="w-10 text-sm font-medium">{star}★</div>
                      <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-400" style={{ width: `${percent}%` }} />
                      </div>
                      <div className="w-10 text-right text-sm text-gray-600">{count}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Review form (students only & enrolled) */}
          {user?.role === "student" && enrolled && (editingReviewId || !hasReviewed) && (
            <div className="mt-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Leave a Review</h4>
              <div className="flex items-center gap-2 mb-3">
                {[1,2,3,4,5].map(n => (
                  <button
                    key={n}
                    onClick={() => setRating(n)}
                    className={`text-2xl ${n <= rating ? "text-yellow-400" : "text-gray-400"}`}
                  >
                    ★
                  </button>
                ))}
              </div>

              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-3 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100"
                placeholder="Share your experience..."
              />

              <div className="mt-3 flex gap-3">
                <button
                  onClick={submitReview}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
                >
                  {editingReviewId ? "Update" : "Submit"}
                </button>

                {editingReviewId && (
                  <button
                    onClick={() => { setEditingReviewId(null); setRating(0); setComment(""); }}
                    className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Reviews list */}
          <div className="mt-6 space-y-4">
            {reviews.length ? (
              reviews.map(r => (
                <div key={r.id} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border dark:border-gray-700">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(r.student)}&background=random`}
                        alt={r.student}
                        className="w-12 h-12 rounded-full"
                      />
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">{r.student}</div>
                        <div className="text-sm text-yellow-400 mt-1">
                          {"★".repeat(r.rating)}<span className="text-gray-300">{"★".repeat(5 - r.rating)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-gray-400">{new Date(r.created_at).toLocaleString()}</div>
                  </div>

                  <p className="mt-3 text-gray-700 dark:text-gray-300">{r.comment}</p>

                  {user?.username === r.student && (
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => {
                          setRating(r.rating);
                          setComment(r.comment);
                          setEditingReviewId(r.id);
                          window.scrollTo({ top: 200, behavior: "smooth" });
                        }}
                        className="px-3 py-1 rounded-md bg-blue-600 text-white text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteReview(r.id)}
                        className="px-3 py-1 rounded-md bg-red-600 text-white text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-gray-500">No reviews yet — be the first to share your experience.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
