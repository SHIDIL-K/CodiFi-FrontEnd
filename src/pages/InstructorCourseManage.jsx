// src/pages/InstructorCourseManage.jsx
import React, { useEffect, useState, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { ArrowLeft } from "lucide-react";



const BASE_URL = "https://codifi-backendend-new.onrender.com";

export default function InstructorCourseManage() {
  const { id } = useParams();
  const { tokens, user } = useContext(AuthContext);

  const [course, setCourse] = useState(null);
  const [activeTab, setActiveTab] = useState("lessons");
  const [lessons, setLessons] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [students, setStudents] = useState([]);
  const [lessonForm, setLessonForm] = useState({
    title: "",
    youtube_video_url: "",
    pdf_file: null,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [modules, setModules] = useState([]);
  const [moduleForm, setModuleForm] = useState({ title: "" });
  const [selectedModule, setSelectedModule] = useState(null);
  const [zoomForm, setZoomForm] = useState({ topic: "", start_time: "", duration: 60 });
  const [zoomMeetings, setZoomMeetings] = useState([]);
  const [liveSessions, setLiveSessions] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [quizForm, setQuizForm] = useState({ title: "" });
  const [questionForm, setQuestionForm] = useState({ quiz: "", text: "", correct_option: "" });
  const [optionForm, setOptionForm] = useState({ question: "", text: "" });
  const [editQuiz, setEditQuiz] = useState(null);
  const [editQuestion, setEditQuestion] = useState(null);
  const [busyQuestion, setBusyQuestion] = useState(false);
  const navigate = useNavigate();

  const confirmToast = (message, onConfirm) => {
    toast(
      ({ closeToast }) => (
        <div className="text-sm">
          <p className="font-semibold mb-2">{message}</p>
          <div className="flex gap-2 mt-2">
            <button
              className="px-3 py-1 bg-red-600 text-white rounded"
              onClick={() => {
                closeToast();
                onConfirm();
              }}
            >
              Yes
            </button>
            <button
              className="px-3 py-1 bg-gray-300 rounded"
              onClick={closeToast}
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { closeOnClick: false }
    );
  };


  const loadQuizzes = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/courses/${id}/quizzes/`, {
        headers: { Authorization: `Bearer ${tokens?.access}` },
      });
      const data = await res.json();
      setQuizzes(data);
    } catch (err) {
      console.error("Error loading quizzes:", err);
    }
  };

  useEffect(() => {
    if (activeTab === "quizzes") loadQuizzes();
  }, [activeTab]);



  const handleYouTubeSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const res = await fetch(
        `${BASE_URL}/api/youtube/search/?q=${encodeURIComponent(searchQuery)}`,
        {
          headers: { Authorization: `Bearer ${tokens?.access}` },
        }
      );
      const data = await res.json();
      setSearchResults(data.items || []);
    } catch (err) {
      console.error("YouTube search error:", err);
      toast.error("YouTube search failed")
    }
  };


  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    question: "",
    due_date: "",
  });
  const [editTask, setEditTask] = useState(null); // object for modal editing
  const [busy, setBusy] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedStudent, setExpandedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submittingReviewFor, setSubmittingReviewFor] = useState(null);

  // ---------------------- Load course ----------------------
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/api/courses/${id}/detail/`);
        const data = await res.json();
        // support both {course, lessons} and direct course object
        setCourse(data.course ?? data);
        setLessons(data.lessons || []);
      } catch (err) {
        console.error("Error loading course:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);


  const loadModules = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/instructor/courses/${id}/modules/`, {
        headers: { Authorization: `Bearer ${tokens?.access}` },
      });
      const data = await res.json();
      setModules(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading modules:", err);
    }
  };
  useEffect(() => { loadModules(); }, [id]);



  // ---------------------- Load lessons ----------------------
  const loadLessons = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/courses/${id}/lessons/`, {
        headers: {
          Authorization: `Bearer ${tokens?.access}`,
        },
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(err || "Failed to fetch lessons");
      }

      const data = await response.json();
      setLessons(Array.isArray(data.lessons) ? data.lessons : []);
    } catch (error) {
      console.error("Error loading lessons:", error);
    }
  };

  // fetch lessons when page loads or course ID changes
  useEffect(() => {
    loadLessons();
  }, [id]);



  // ---------------------- Load tasks & submissions ----------------------
  const loadTasksAndSubs = async () => {
    try {
      // tasks (global endpoint filtered by course)
      const tRes = await fetch(`${BASE_URL}/api/tasks/`);
      const taskData = await tRes.json();
      setTasks(
        Array.isArray(taskData)
          ? taskData.filter((t) => t.course === parseInt(id))
          : []
      );

      // instructor submissions for this course
      const sRes = await fetch(
        `${BASE_URL}/api/instructor/courses/${id}/submissions/`,
        { headers: { Authorization: `Bearer ${tokens?.access}` } }
      );
      const subs = await sRes.json();
      setSubmissions(Array.isArray(subs) ? subs : []);
    } catch (err) {
      console.error("Error loading tasks/submissions:", err);
    }
  };

  useEffect(() => {
    // whenever switching to relevant tabs, refresh data
    if (["tasks", "submissions", "students"].includes(activeTab)) {
      loadTasksAndSubs();
    }
  }, [activeTab, id, tokens]);




  // ---------------------- Load enrolled students ----------------------
  useEffect(() => {
    if (activeTab === "students") {
      const fetchEnrollments = async () => {
        try {
          const res = await fetch(`${BASE_URL}/api/instructor/enrollments/`, {
            headers: { Authorization: `Bearer ${tokens?.access}` },
          });

          if (res.ok) {
            const list = await res.json();
            const filtered = (Array.isArray(list) ? list : []).filter(
              (e) =>
                e.course &&
                (e.course === parseInt(id) || e.course.id === parseInt(id))
            );
            setStudents(filtered);
          }
        } catch (err) {
          console.error("Error loading enrolled students:", err);
        }
      };

      fetchEnrollments();
    }
  }, [activeTab, id, tokens]);


  // ---------------------- Load live sessions ----------------------
  const loadLiveSessions = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/instructor/courses/${id}/live-sessions/`, {
        headers: { Authorization: `Bearer ${tokens?.access}` },
      });
      const data = await res.json();
      setLiveSessions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading live sessions:", err);
    }
  };
  useEffect(() => {
    if (activeTab === "live") {
      loadLiveSessions();
      const interval = setInterval(loadLiveSessions, 60000);
      return () => clearInterval(interval);
    }
  }, [activeTab, id]);



  // ---------------------- Create Lesson ----------------------
  const handleAddLesson = async (e) => {
    e.preventDefault();

    if (!selectedModule) {
      toast.error("Please select a module before adding a lesson.");
      return;
    }

    setBusy(true);
    try {
      const formData = new FormData();
      formData.append("title", lessonForm.title);
      formData.append("youtube_video_url", lessonForm.youtube_video_url);
      if (lessonForm.pdf_file) formData.append("pdf_file", lessonForm.pdf_file);

      formData.append("course", id);
      formData.append("module", Number(selectedModule));

      const res = await fetch(`${BASE_URL}/api/instructor/lessons/create/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${tokens?.access}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        console.error("Backend Error:", data);
        throw new Error("Failed to add lesson");
      }

      setLessonForm({ title: "", youtube_video_url: "", pdf_file: null });
      await loadLessons();
      toast.success("Lesson added!");
    } catch (err) {
      console.error(err);
      toast.error("Error adding lesson");
    } finally {
      setBusy(false);
    }
  };



  // ---------------------- Create Task ----------------------
  const handleCreateTask = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch(`${BASE_URL}/api/instructor/tasks/create/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokens?.access}`,
        },
        body: JSON.stringify({ ...taskForm, course: parseInt(id) }),
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || "Failed to create task");
      }
      const created = await res.json();
      setTasks((prev) => [created, ...prev]);
      setTaskForm({ title: "", description: "", question: "", due_date: "" });
      toast.success("Task created!")
    } catch (err) {
      console.error(err);
      toast.error("Failed to create task")
    } finally {
      setBusy(false);
    }
  };

  // ---------------------- Update Task (PUT to daily-tasks endpoint) ----------------------
  const handleUpdateTask = async (e) => {
    e.preventDefault();
    if (!editTask) return;
    setBusy(true);
    try {
      // use daily-tasks endpoint you already have
      const res = await fetch(`${BASE_URL}/api/daily-tasks/${editTask.id}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokens?.access}`,
        },
        body: JSON.stringify(editTask),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "Failed to update task");
      }
      const updated = await res.json();
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setEditTask(null);
      toast.success("Task updated!")
    } catch (err) {
      console.error(err);
      toast.error("Error updating task")
    } finally {
      setBusy(false);
    }
  };

  // ---------------------- Delete Task ----------------------
  const handleDeleteTask = async (taskId) => {
  try {
    const res = await fetch(`${BASE_URL}/api/instructor/tasks/${taskId}/delete/`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${tokens?.access}` },
    });

    if (!res.ok) throw new Error("Failed to delete");

    setTasks(prev => prev.filter(t => t.id !== taskId));
    toast.success("Task deleted!");
  } catch (err) {
    toast.error("Failed to delete task");
  }
};


  // ---------------------- Submission actions (approve/reject) ----------------------
  const handleSubmissionUpdate = async (submissionId, newStatus, feedback = "") => {
    try {
      setSubmittingReviewFor(submissionId);
      const res = await fetch(
        `${BASE_URL}/api/instructor/submissions/${submissionId}/review/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokens?.access}`,
          },
          body: JSON.stringify({ status: newStatus, feedback }),
        }
      );
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "Failed to update submission");
      }
      const updated = await res.json();
      // replace in submissions array
      setSubmissions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      toast.success(`Submission ${newStatus}`)
    } catch (err) {
      console.error(err);
      toast.error("Error reviewing submission")
    } finally {
      setSubmittingReviewFor(null);
    }
  };

  // refresh submissions
  const refreshSubmissions = async () => {
    await loadTasksAndSubs();
    toast.info("Submissions refreshed")
  };

  // ---------------------- Group submissions for UI ----------------------
  const groupedSubs = submissions.reduce((acc, s) => {
    const name = s.student_name || (s.student && s.student.username) || `Student ${s.student}`;
    if (!acc[name]) acc[name] = [];
    acc[name].push(s);
    return acc;
  }, {});

  const filteredSubs = Object.entries(groupedSubs).filter(([_, subs]) =>
    statusFilter === "all" ? true : subs.some((s) => s.status === statusFilter)
  );

  // ---------------------- Stats ----------------------
  const completed = submissions.filter((s) => s.status === "approved").length;
  const pending = submissions.filter((s) => s.status === "pending").length;
  const rejected = submissions.filter((s) => s.status === "rejected").length;
  const total = submissions.length || 1;

  // small helper for date formatting
  const fmt = (iso) => (iso ? new Date(iso).toLocaleString() : "-");

  if (loading)
    return (
      <div className="p-6 text-gray-600 dark:text-gray-300 text-center mt-20">Loading course...</div>
    );

    

  return (
    <div className="p-6 pt-28 max-w-6xl mx-auto min-h-screen bg-gray-50 dark:bg-gray-900 dark:text-gray-100 transition-colors">
      {/* Header */}
      <button
            onClick={() => navigate(-1)}
            className="flex items-center px-4 py-2 mb-5 bg-blue-700 text-gray-100 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-200" />
          </button>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-blue-700 → dark:text-blue-400 ">{course?.title}</h1>
          {/* <p className="text-gray-600 dark:text-gray-300">{course?.description}</p> */}
        </div>
        <div className="flex gap-3 items-center">
          <button
            onClick={() => { setActiveTab("students"); }}
            className="px-4 py-2 rounded bg-indigo-600 text-white"
          >
            View Enrolled ({students.length})
          </button>
          <button
            onClick={() => refreshSubmissions()}
            className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200"
          >
            Refresh Submissions 
          </button>
          <Link
            to={`/instructor/chats`}
            className="px-4 py-2 rounded bg-indigo-600 text-white"
          >
            Chat with students 
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b mb-6">
        {["lessons", "tasks", "quizzes", "submissions", "live", "students"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 border-b-2 font-semibold capitalize transition-all ${
              activeTab === tab ? "border-blue-600 text-blue-600" : "border-transparent hover:text-blue-500"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

  


      {/* ----------------- LESSONS ----------------- */}
      {activeTab === "lessons" && (
        <div className="space-y-6">

          {/* 🧱 Add Module */}
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                const res = await fetch(`${BASE_URL}/api/instructor/courses/${id}/modules/`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${tokens?.access}`,
                  },
                  body: JSON.stringify(moduleForm),
                });
                if (!res.ok) throw new Error(await res.text());
                await loadModules();
                setModuleForm({ title: "" });
                toast.success("Module created!")
              } catch (err) {
                toast.error("Error creating module")
                console.error(err);
              }
            }}
            className="bg-white dark:bg-gray-800 p-6 shadow rounded-lg dark:border dark:border-gray-700 transition-colors space-y-3"
          >
            <h2 className="text-xl font-semibold text-blue-700 → dark:text-blue-400 ">Create Module</h2>
            <input
              required
              placeholder="Module Title (e.g. Frontend)"
              value={moduleForm.title}
              onChange={(e) => setModuleForm({ title: e.target.value })}
              className="border dark:border-gray-600 p-2 rounded w-full dark:bg-gray-700 dark:text-gray-100"
            />
            <button className="bg-blue-600 text-white px-4 py-2 rounded w-full">
              Add Module
            </button>
          </form>
          {/* 🔍 YouTube Search Section */}
          <div className="bg-white dark:bg-gray-800 p-6 shadow rounded-lg dark:border dark:border-gray-700 transition-colors space-y-3">
            <select
              required
              value={selectedModule || ""}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="border dark:border-gray-600 p-2 rounded w-full dark:bg-gray-700 dark:text-gray-100"
            >
              <option value="">Select Module</option>
              {modules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
            <h2 className="text-xl font-semibold text-blue-700 → dark:text-blue-400 ">YouTube Video Search</h2>
            <input
              type="text"
              placeholder="Search YouTube videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border dark:border-gray-600 p-2 rounded w-full dark:bg-gray-700 dark:text-gray-100"
            />
            <button
              onClick={handleYouTubeSearch}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
            >
              Search
            </button>

            {searchResults.length > 0 && (
              <div className="grid md:grid-cols-2 gap-3 mt-4">
                {searchResults.map((v) => (
                  <div
                    key={v.videoId}
                    onClick={() =>
                      setLessonForm({
                        ...lessonForm,
                        youtube_video_url: `https://www.youtube.com/watch?v=${v.videoId}`,
                      })
                    }
                    className="cursor-pointer border p-3 rounded hover:bg-blue-50 transition"
                  >
                    <img
                      src={v.thumbnails.medium.url}
                      alt={v.title}
                      className="rounded mb-2"
                    />
                    <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-100">
                      {v.title}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {v.channelTitle}
                    </p>
                  </div>
                ))}
              </div>
            )}

          </div>

          {/* 📘 Add Lesson Form */}
          <form
            onSubmit={handleAddLesson}
            className="bg-white dark:bg-gray-800 p-6 shadow rounded-lg dark:border dark:border-gray-700 transition-colors space-y-3"
          >
            <h2 className="text-xl font-semibold">Add Lesson</h2>
            <input
              required
              placeholder="Lesson Title"
              value={lessonForm.title}
              onChange={(e) =>
                setLessonForm({ ...lessonForm, title: e.target.value })
              }
              className="border dark:border-gray-600 p-2 rounded w-full dark:bg-gray-700 dark:text-gray-100"            />
            <input
              type="url"
              placeholder="YouTube Video URL"
              value={lessonForm.youtube_video_url}
              onChange={(e) =>
                setLessonForm({ ...lessonForm, youtube_video_url: e.target.value })
              }
              className="border dark:border-gray-600 p-2 rounded w-full dark:bg-gray-700 dark:text-gray-100"            />
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) =>
                setLessonForm({ ...lessonForm, pdf_file: e.target.files[0] })
              }
              className="border dark:border-gray-600 p-2 rounded w-full dark:bg-gray-700 dark:text-gray-100"            />
            <button
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-2 rounded w-full"
              disabled={busy}
            >
              {busy ? "Saving..." : "Add Lesson"}
            </button>
          </form>

          {/* 🎥 Lesson List */}
          <div className="grid md:grid-cols-2 gap-4">
            {lessons.map((ls) => (
              <div
                key={ls.id}
                className="bg-gradient-to-br from-blue-50 to-white shadow p-4 rounded-lg hover:shadow-md transition"
              >
                <h3 className="font-semibold text-lg text-blue-700 → dark:text-blue-400 ">{ls.title}</h3>

                {ls.youtube_video_url && (
                  <div className="mt-3">
                    <iframe
                      className="w-full rounded-lg"
                      height="200"
                      src={`https://www.youtube.com/embed/${
                        ls.youtube_video_url.split("v=")[1]
                      }`}
                      title={ls.title}
                      allowFullScreen
                    ></iframe>
                  </div>
                )}

                {ls.pdf_file && (
                  <a
                    href={
                      ls.pdf_file.startsWith("http")
                        ? ls.pdf_file
                        : `${BASE_URL}${ls.pdf_file}`
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="text-green-600 hover:underline text-sm mt-2 block"
                  >
                    📄 View PDF
                  </a>
                )}
              </div>
            ))}
            {lessons.length === 0 && (
              <p className="text-gray-500 → dark:text-gray-400">No lessons yet.</p>
            )}
          </div>
        </div>
      )}


      {/* ----------------- TASKS ----------------- */}
      {activeTab === "tasks" && (
        <div>

          {/* CREATE TASK FORM */}
          <form 
            onSubmit={handleCreateTask}
            className="bg-white dark:bg-gray-800 dark:border dark:border-gray-700 
                      p-6 rounded shadow space-y-3 mb-6 transition-colors"
          >
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              Create Daily Task
            </h2>

            <input
              placeholder="Task Title"
              required
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              className="border dark:border-gray-600 p-2 rounded w-full 
                        dark:bg-gray-700 dark:text-gray-100"
            />

            <textarea
              placeholder="Description"
              value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              className="border dark:border-gray-600 p-2 rounded w-full 
                        dark:bg-gray-700 dark:text-gray-100"
            />

            <textarea
              placeholder="Question"
              value={taskForm.question}
              onChange={(e) => setTaskForm({ ...taskForm, question: e.target.value })}
              className="border dark:border-gray-600 p-2 rounded w-full 
                        dark:bg-gray-700 dark:text-gray-100"
            />

            <input
              type="datetime-local"
              value={taskForm.due_date}
              onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
              className="border dark:border-gray-600 p-2 rounded w-full 
                        dark:bg-gray-700 dark:text-gray-100"
            />

            <button
              className="bg-blue-600 hover:bg-blue-700 
                        dark:bg-blue-500 dark:hover:bg-blue-600 
                        text-white px-4 py-2 rounded w-full transition"
            >
              {busy ? "Saving..." : "Create Task"}
            </button>
          </form>

          {/* TASK LIST */}
          <div className="grid md:grid-cols-2 gap-4">
            {tasks.map((t) => (
              <div
                key={t.id}
                className="bg-gradient-to-r from-blue-100 to-white 
                          dark:from-gray-800 dark:to-gray-700 
                          dark:border dark:border-gray-700
                          p-4 shadow rounded-lg hover:shadow-lg transition"
              >
                <h3 className="font-semibold text-lg text-blue-700 dark:text-blue-400">
                  {t.title}
                </h3>

                <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                  {t.description}
                </p>

                {t.question && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    <strong>Q:</strong> {t.question}
                  </p>
                )}

                <div className="flex justify-between items-center mt-3">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Due: {t.due_date ? new Date(t.due_date).toLocaleString() : "—"}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditTask(t)}
                      className="text-sm bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded"
                    >
                      ✏ Edit
                    </button>

                    <button
                      onClick={() =>
                        confirmToast("Delete this task?", () => handleDeleteTask(t.id))
                      }
                      className="text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                    >
                      🗑 Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {tasks.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400">
                No tasks created.
              </p>
            )}
          </div>

        </div>
      )}


      {/* ----------------- QUIZZES ----------------- */}
      {activeTab === "quizzes" && (
        <div className="space-y-6">
          {/* Create Quiz */}
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                const res = await fetch(`${BASE_URL}/api/courses/${id}/quizzes/`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${tokens?.access}`,
                  },
                  body: JSON.stringify(quizForm),
                });
                if (!res.ok) throw new Error(await res.text());
                setQuizForm({ title: "" });
                await loadQuizzes();
                toast.success("Quiz created!")
              } catch (err) {
                console.error(err);
                toast.error("Error creating quiz")
              }
            }}
            className="bg-white dark:bg-gray-800 p-6 shadow rounded-lg dark:border dark:border-gray-700 transition-colors space-y-3"
          >
            <h2 className="text-xl font-semibold text-blue-700 → dark:text-blue-400 ">Create Quiz</h2>
            <input
              required
              placeholder="Quiz Title"
              value={quizForm.title}
              onChange={(e) => setQuizForm({ title: e.target.value })}
              className="border dark:border-gray-600 p-2 rounded w-full dark:bg-gray-700 dark:text-gray-100"            />
            <button className="bg-blue-600 text-white px-4 py-2 rounded w-full">Add Quiz</button>
          </form>

          {/* Add Question */}
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                const res = await fetch(`${BASE_URL}/api/questions/create/`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${tokens?.access}`,
                  },
                  body: JSON.stringify(questionForm),
                });
                if (!res.ok) throw new Error(await res.text());
                setQuestionForm({ quiz: "", text: "", correct_option: "" });
                await loadQuizzes();
                toast.success("Question added!")
              } catch (err) {
                toast.error("Error creating question")
              }
            }}
            className="bg-white dark:bg-gray-800 p-6 shadow rounded-lg dark:border dark:border-gray-700 transition-colors space-y-3"
          >
            <h2 className="text-xl font-semibold text-blue-700 → dark:text-blue-400 ">Add Question</h2>
            <select
              required
              value={questionForm.quiz}
              onChange={(e) => setQuestionForm({ ...questionForm, quiz: e.target.value })}
              className="border dark:border-gray-600 p-2 rounded w-full dark:bg-gray-700 dark:text-gray-100"            >
              <option value="">Select Quiz</option>
              {quizzes.map((q) => (
                <option key={q.id} value={q.id}>{q.title}</option>
              ))}
            </select>
            <textarea
              placeholder="Question Text"
              value={questionForm.text}
              onChange={(e) => setQuestionForm({ ...questionForm, text: e.target.value })}
              className="border dark:border-gray-600 p-2 rounded w-full dark:bg-gray-700 dark:text-gray-100"            />
            <input
              placeholder="Correct Option"
              value={questionForm.correct_option}
              onChange={(e) => setQuestionForm({ ...questionForm, correct_option: e.target.value })}
              className="border dark:border-gray-600 p-2 rounded w-full dark:bg-gray-700 dark:text-gray-100"            />
            <button className="bg-green-600 text-white px-4 py-2 rounded w-full">Add Question</button>
          </form>

          {/* Add Options */}
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                const res = await fetch(`${BASE_URL}/api/options/create/`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${tokens?.access}`,
                  },
                  body: JSON.stringify(optionForm),
                });
                if (!res.ok) throw new Error(await res.text());
                setOptionForm({ question: "", text: "" });
                await loadQuizzes();
                toast.success("Option added!")
              } catch (err) {
                toast.error("Error adding option")
              }
            }}
            className="bg-white dark:bg-gray-800 p-6 shadow rounded-lg dark:border dark:border-gray-700 transition-colors space-y-3"
          >
            <h2 className="text-xl font-semibold text-blue-700 → dark:text-blue-400 ">Add Option</h2>
            <select
              required
              value={optionForm.question}
              onChange={(e) => setOptionForm({ ...optionForm, question: e.target.value })}
              className="border dark:border-gray-600 p-2 rounded w-full dark:bg-gray-700 dark:text-gray-100"            >
              <option value="">Select Question</option>
              {quizzes.flatMap((q) =>
                q.questions.map((ques) => (
                  <option key={ques.id} value={ques.id}>
                    {q.title} → {ques.text.slice(0, 40)}...
                  </option>
                ))
              )}
            </select>
            <input
              required
              placeholder="Option Text"
              value={optionForm.text}
              onChange={(e) => setOptionForm({ ...optionForm, text: e.target.value })}
              className="border dark:border-gray-600 p-2 rounded w-full dark:bg-gray-700 dark:text-gray-100"            />
            <button className="bg-indigo-600 text-white px-4 py-2 rounded w-full">Add Option</button>
          </form>

          {/* Display Quizzes */}
          <div className="space-y-4">
            {quizzes.map((q) => (
              <div
                key={q.id}
                className="bg-gray-50 dark:bg-gray-800 dark:border dark:border-gray-700 
                          p-4 rounded shadow transition-colors"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-lg text-blue-700 dark:text-blue-400">
                    {q.title}
                  </h3>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditQuiz(q)}
                      className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded"
                    >
                      ✏ Edit
                    </button>

                    <button
                      onClick={() =>
                        confirmToast(
                          `Delete quiz "${q.title}" and all its questions?`,
                          async () => {
                            try {
                              const res = await fetch(`${BASE_URL}/api/quizzes/${q.id}/delete/`, {
                                method: "DELETE",
                                headers: { Authorization: `Bearer ${tokens?.access}` },
                              });

                              if (!res.ok) throw new Error();
                              await loadQuizzes();
                              toast.success("Quiz deleted!");
                            } catch (err) {
                              toast.error("Failed to delete quiz");
                            }
                          }
                        )
                      }
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                    >
                      🗑 Delete
                    </button>
                  </div>
                </div>

                {q.questions.map((ques) => (
                  <div
                    key={ques.id}
                    className="border-t dark:border-gray-700 mt-2 pt-2"
                  >
                    <div className="flex justify-between items-start">

                      {/* Left side */}
                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-200">
                          {ques.text}
                        </p>

                        <ul className="list-disc ml-6 text-sm text-gray-700 dark:text-gray-300">
                          {ques.options.map((o) => (
                            <li key={o.id}>
                              {o.text}
                              {o.text === ques.correct_option && (
                                <span className="text-green-600 dark:text-green-400 font-semibold">
                                  {" "}
                                  (✔ Correct)
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Right side buttons */}
                      <div className="flex flex-col gap-2 ml-4">
                        <button
                          onClick={() => setEditQuestion(ques)}
                          className="bg-yellow-400 hover:bg-yellow-500 text-white px-2 py-1 rounded text-sm"
                        >
                          ✏ Edit
                        </button>

                        <button
                          onClick={async () => {
                            if (!window.confirm("Delete this question?")) return;
                            try {
                              const res = await fetch(`${BASE_URL}/api/questions/${ques.id}/delete/`, {
                                method: "DELETE",
                                headers: { Authorization: `Bearer ${tokens?.access}` },
                              });
                              if (!res.ok) throw new Error(await res.text());
                              await loadQuizzes();
                              toast.success("Question deleted!")
                            } catch (err) {
                              console.error(err);
                              toast.error("Error deleting question")
                            }
                          }}
                          className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm"
                        >
                          🗑 Delete
                        </button>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {editQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6"
          >
            <h3 className="text-lg font-semibold mb-4 text-blue-700 → dark:text-blue-400 ">Edit Quiz</h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const res = await fetch(`${BASE_URL}/api/quizzes/${editQuiz.id}/update/`, {
                    method: "PUT",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${tokens?.access}`,
                    },
                    body: JSON.stringify({ title: editQuiz.title }),
                  });
                  if (!res.ok) throw new Error(await res.text());
                  await loadQuizzes();
                  setEditQuiz(null);
                  toast.success("Quiz updated!")
                } catch (err) {
                  console.error(err);
                  toast.error("Error updating quiz")
                }
              }}
              className="space-y-3"
            >
              <input
                className="border dark:border-gray-600 p-2 rounded w-full dark:bg-gray-700 dark:text-gray-100"                value={editQuiz.title}
                onChange={(e) => setEditQuiz({ ...editQuiz, title: e.target.value })}
                placeholder="Quiz title"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditQuiz(null)}
                  className="px-3 py-1 bg-gray-200 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-blue-600 text-white rounded"
                >
                  Save
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {editQuestion && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6"
        >
          <h3 className="text-lg font-semibold mb-4 text-blue-700 → dark:text-blue-400 ">Edit Question</h3>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setBusyQuestion(true);
              try {
                const res = await fetch(`${BASE_URL}/api/questions/${editQuestion.id}/update/`, {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${tokens?.access}`,
                  },
                  body: JSON.stringify({
                    quiz: editQuestion.quiz, 
                    text: editQuestion.text,
                    correct_option: editQuestion.correct_option,
                  }),
                });
                if (!res.ok) throw new Error(await res.text());
                await loadQuizzes();
                setEditQuestion(null);
                toast.success("Question updated!")
              } catch (err) {
                console.error(err);
                toast.error("Error updating question")
              } finally {
                setBusyQuestion(false);
              }
            }}
            className="space-y-3"
          >
            <textarea
              className="border dark:border-gray-600 p-2 rounded w-full dark:bg-gray-700 dark:text-gray-100"              value={editQuestion.text}
              onChange={(e) => setEditQuestion({ ...editQuestion, text: e.target.value })}
              placeholder="Question text"
              rows="3"
            />
            <input
              className="border dark:border-gray-600 p-2 rounded w-full dark:bg-gray-700 dark:text-gray-100"              value={editQuestion.correct_option}
              onChange={(e) => setEditQuestion({ ...editQuestion, correct_option: e.target.value })}
              placeholder="Correct option"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditQuestion(null)}
                className="px-3 py-1 bg-gray-200 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-blue-600 text-white rounded"
                disabled={busyQuestion}
              >
                {busyQuestion ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    )}


      {/* ----------------- SUBMISSIONS ----------------- */}
      {activeTab === "submissions" && (
        <div>

          {/* Header */}
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              Student Submissions
            </h2>

            <div className="flex items-center gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 
                          p-2 rounded transition-colors"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>

              <button
                onClick={refreshSubmissions}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 
                          dark:bg-gray-800 dark:hover:bg-gray-700 
                          dark:text-gray-100 rounded transition"
              >
                Refresh
              </button>
            </div>
          </div>

          {/* No Results */}
          {filteredSubs.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">
              No submissions found.
            </p>
          ) : (
            filteredSubs.map(([student, subs]) => (
              <div
                key={student}
                className="bg-white dark:bg-gray-800 dark:border dark:border-gray-700 
                          p-4 rounded shadow mb-4 transition-colors"
              >
                {/* Student Header */}
                <div
                  onClick={() =>
                    setExpandedStudent(expandedStudent === student ? null : student)
                  }
                  className="flex justify-between cursor-pointer 
                            hover:bg-gray-50 dark:hover:bg-gray-700 
                            p-2 rounded transition"
                >
                  <h3 className="font-semibold text-blue-600 dark:text-blue-400">
                    {student}
                  </h3>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">
                    {subs.length} submissions
                  </span>
                </div>

                {/* Expanded Submissions */}
                {expandedStudent === student && (
                  <div className="mt-3 space-y-3">
                    {subs.map((s) => (
                      <div
                        key={s.id}
                        className="border dark:border-gray-700 
                                  p-3 rounded 
                                  hover:bg-gray-50 dark:hover:bg-gray-700 
                                  transition flex flex-col md:flex-row 
                                  md:justify-between gap-3"
                      >
                        {/* Left Panel */}
                        <div className="text-gray-800 dark:text-gray-200">
                          <p>
                            <strong>Task:</strong> {s.task_title}
                          </p>

                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Submitted: {fmt(s.submitted_on)}
                          </p>

                          <p>
                            <strong>Status:</strong>{" "}
                            <span
                              className={`font-medium ${
                                s.status === "approved"
                                  ? "text-green-600 dark:text-green-400"
                                  : s.status === "rejected"
                                  ? "text-red-600 dark:text-red-400"
                                  : "text-yellow-600 dark:text-yellow-400"
                              }`}
                            >
                              {s.status?.toUpperCase()}
                            </span>
                          </p>

                          {s.submission_file && (
                            <a
                              href={
                                s.submission_file.startsWith("http")
                                  ? s.submission_file
                                  : `${BASE_URL}${s.submission_file}`
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-500 dark:text-blue-400 
                                        hover:underline text-sm"
                            >
                              📎 View Submission
                            </a>
                          )}
                        </div>

                        {/* Right Panel */}
                        <div className="flex flex-col gap-2 items-end">
                          <textarea
                            placeholder="Instructor feedback"
                            id={`feedback-${s.id}`}
                            defaultValue={s.feedback || ""}
                            className="border dark:border-gray-600 
                                      p-2 rounded w-full md:w-64 
                                      dark:bg-gray-700 dark:text-gray-100"
                          />

                          <div className="flex gap-2">
                            <button
                              onClick={async () => {
                                const fb = document.getElementById(
                                  `feedback-${s.id}`
                                ).value;
                                await handleSubmissionUpdate(s.id, "approved", fb);
                              }}
                              disabled={submittingReviewFor === s.id}
                              className="px-3 py-1 bg-green-600 hover:bg-green-700 
                                        text-white rounded"
                            >
                              {submittingReviewFor === s.id ? "..." : "Approve"}
                            </button>

                            <button
                              onClick={async () => {
                                const fb = document.getElementById(
                                  `feedback-${s.id}`
                                ).value;
                                await handleSubmissionUpdate(s.id, "rejected", fb);
                              }}
                              disabled={submittingReviewFor === s.id}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 
                                        text-white rounded"
                            >
                              {submittingReviewFor === s.id ? "..." : "Reject"}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}


      {/* ----------------- STUDENTS ----------------- */}
      {activeTab === "students" && (
        <div className="bg-white dark:bg-gray-800 p-6 shadow rounded-lg dark:border dark:border-gray-700 transition-colors">
          <h2 className="text-xl font-semibold mb-4 text-blue-700 → dark:text-blue-400 ">Enrolled Students</h2>
          {students.length === 0 ? (
            <p className="text-gray-500 → dark:text-gray-400">No students enrolled yet.</p>
          ) : (
            <ul className="space-y-2">
              {students.map((enroll) => (
                <div key={enroll.id}>
                  <p><strong>{enroll.student}</strong></p>
                  <p>Email: {enroll.email}</p>
                  <p>Enrolled On: {new Date(enroll.enrolled_on).toLocaleDateString()}</p>
                </div>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* ----------------- LIVE SESSIONS ----------------- */}
      {activeTab === "live" && (
        <div className="bg-white dark:bg-gray-800 p-6 shadow rounded-lg dark:border dark:border-gray-700 transition-colors space-y-4">
          <h2 className="text-2xl font-semibold text-blue-700 → dark:text-blue-400 ">Zoom Live Sessions</h2>

          {/* Create new Zoom session form */}
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                const res = await fetch(`${BASE_URL}/api/instructor/courses/${id}/zoom/create/`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${tokens?.access}`,
                  },
                  body: JSON.stringify({
                    topic: zoomForm.topic || `Live Session - ${course?.title}`,
                    start_time: new Date(zoomForm.start_time).toISOString(),
                    duration: parseInt(zoomForm.duration) || 60,
                  }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Failed to create meeting");
                toast.success("Zoom session created!")
                await loadLiveSessions();
                setZoomForm({ topic: "", start_time: "", duration: 60 });
              } catch (err) {
                console.error(err);
                toast.error("Failed to create meeting")
              }
            }}
            className="space-y-3"
          >
            <input
              type="text"
              placeholder="Session Topic"
              value={zoomForm.topic}
              onChange={(e) => setZoomForm({ ...zoomForm, topic: e.target.value })}
              className="border dark:border-gray-600 p-2 rounded w-full dark:bg-gray-700 dark:text-gray-100"              required
            />
            <input
              type="datetime-local"
              value={zoomForm.start_time}
              onChange={(e) => setZoomForm({ ...zoomForm, start_time: e.target.value })}
              className="border dark:border-gray-600 p-2 rounded w-full dark:bg-gray-700 dark:text-gray-100"              required
            />
            <input
              type="number"
              placeholder="Duration (minutes)"
              value={zoomForm.duration}
              onChange={(e) => setZoomForm({ ...zoomForm, duration: e.target.value })}
              className="border dark:border-gray-600 p-2 rounded w-full dark:bg-gray-700 dark:text-gray-100"              min="15"
              required
            />
            <button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-2 rounded w-full">
              Create Zoom Live Session
            </button>
          </form>

          {/* List previously created sessions */}
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-100">
              Manage Live Sessions
            </h3>

            {liveSessions.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No recent live sessions.</p>
            ) : (
              <ul className="space-y-3">
                {liveSessions.map((s) => {
                  const dt = new Date(s.start_time);
                  const date = dt.toLocaleDateString(undefined, {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  });
                  const time = dt.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  // Apply dark-mode status colors
                  const statusColor =
                    s.status === "live"
                      ? "text-green-600 dark:text-green-400"
                      : s.status === "upcoming"
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-500 dark:text-gray-400";

                  return (
                    <li
                      key={s.id}
                      className="border dark:border-gray-700 rounded p-4 
                                bg-white dark:bg-gray-800 
                                shadow flex flex-col md:flex-row 
                                justify-between items-start md:items-center 
                                gap-4 transition-colors"
                    >
                      <div>
                        <h4 className="font-semibold text-blue-700 dark:text-blue-400 text-lg">
                          {s.topic}
                        </h4>

                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          📅 <strong>{date}</strong> &nbsp; ⏰{" "}
                          <strong>{time}</strong> ({s.duration} min)
                        </p>

                        <p className={`text-sm mt-1 font-medium ${statusColor}`}>
                          {s.status === "live"
                            ? "🟢 Live Now"
                            : s.status === "upcoming"
                            ? "🕒 Upcoming"
                            : "⚫ Ended Recently"}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        {(s.status === "live" || s.status === "upcoming") && (
                          <a
                            href={s.start_url}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-green-600 hover:bg-green-700 
                                      dark:bg-green-500 dark:hover:bg-green-600 
                                      text-white px-3 py-2 rounded"
                          >
                            Start Meeting
                          </a>
                        )}

                        <button
                          onClick={async () => {
                            if (!window.confirm("Delete this session?")) return;
                            try {
                              const res = await fetch(
                                `${BASE_URL}/api/instructor/courses/${id}/live-sessions/?id=${s.id}`,
                                {
                                  method: "DELETE",
                                  headers: { Authorization: `Bearer ${tokens?.access}` },
                                }
                              );
                              const data = await res.json();
                              if (!res.ok) throw new Error(data.error || "Failed to delete");
                              toast.success("Session deleted!")
                              await loadLiveSessions();
                            } catch (err) {
                              console.error(err);
                              toast.error("Error deleting session")
                            }
                          }}
                          className="bg-red-600 hover:bg-red-700 
                                    dark:bg-red-500 dark:hover:bg-red-600 
                                    text-white px-3 py-2 rounded"
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>


        </div>
      )}


      {/* ----------------- Edit Task Modal ----------------- */}
      {editTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Edit Task</h3>
            <form onSubmit={handleUpdateTask} className="space-y-3">
              <input className="w-full border p-2 rounded" value={editTask.title} onChange={(e) => setEditTask({ ...editTask, title: e.target.value })} />
              <textarea className="w-full border p-2 rounded" value={editTask.description} onChange={(e) => setEditTask({ ...editTask, description: e.target.value })} />
              <textarea className="w-full border p-2 rounded" value={editTask.question} onChange={(e) => setEditTask({ ...editTask, question: e.target.value })} />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setEditTask(null)} className="px-3 py-1 bg-gray-200 rounded">Cancel</button>
                <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded">{busy ? "Saving..." : "Save"}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}



