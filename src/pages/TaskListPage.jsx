import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { Clock, CheckCircle, XCircle, ArrowLeft } from "lucide-react";

const BASE_URL = "https://codifi-backendend-new.onrender.com";

export default function TaskListPage() {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const { tokens } = useContext(AuthContext);

  const [tasks, setTasks] = useState([]);
  const [submissionsMap, setSubmissionsMap] = useState({});
  const [loading, setLoading] = useState(true);

  // Load tasks
  const loadTasks = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/tasks/?course=${courseId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokens?.access}`,
        },
      });

      if (!res.ok) {
        toast.error("Failed to load tasks.");
        return;
      }

      const data = await res.json();
      setTasks(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load tasks.");
    }
  };

  // Load submissions
  const loadSubmissions = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/student/submissions/`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokens?.access}`,
        },
      });

      const data = await res.json();

      const map = {};
      if (Array.isArray(data)) {
        data.forEach((s) => {
          map[s.task] = s;
        });
      }
      setSubmissionsMap(map);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([loadTasks(), loadSubmissions()]).finally(() =>
      setLoading(false)
    );
  }, [courseId, tokens?.access]);

  // Status Badge Component
  const statusBadge = (submission) => {
    if (!submission) {
      return (
        <span className="px-3 py-1 text-xs rounded-full bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
          Not Submitted
        </span>
      );
    }

    const s = submission.status.toLowerCase();

    if (s === "approved") {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full bg-green-600/20 text-green-700 dark:bg-green-800 dark:text-green-200">
          <CheckCircle className="w-4 h-4" /> Approved
        </span>
      );
    }
    if (s === "rejected") {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full bg-red-600/20 text-red-700 dark:bg-red-800 dark:text-red-200">
          <XCircle className="w-4 h-4" /> Rejected
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full bg-yellow-400/20 text-yellow-700 dark:bg-yellow-700 dark:text-yellow-200">
        <Clock className="w-4 h-4" /> Pending
      </span>
    );
  };

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 px-5 py-10">
        
        {/* Breadcrumb */}
          
        <button
        onClick={() => navigate("/student")}
        className="text-blue-600 dark:text-blue-400 hover:underline"
        >
        Dashboard
        </button>

        <span className="text-gray-400">/</span>

        <span className="text-gray-700 dark:text-gray-200 font-semibold">
            Task List
        </span>

       <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 mt-4 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-gray-100 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

      {/* Header Section */}
      <div className="max-w-4xl mx-auto flex items-center justify-between mb-10">
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Daily Tasks
        </h1>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="text-center py-10 text-gray-600 dark:text-gray-300">
          Loading tasks...
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400">
          No tasks assigned yet.
        </div>
      ) : (
        <div className="max-w-6xl mx-auto grid 
            grid-cols-1 
            sm:grid-cols-2 
            lg:grid-cols-3 
            gap-8"
        >

          {tasks.map((t, index) => {
            const submission = submissionsMap[t.id];

            return (
              <div
                key={t.id}
                onClick={() => navigate(`/courses/${courseId}/tasks/${t.id}`)}
                className={`cursor-pointer relative p-7 rounded-3xl shadow-md hover:shadow-xl transition-all bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-gray-200 dark:border-gray-700 group`}
              >
                {/* Soft gradient hover overlay */}
                <div
                  className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-10 transition bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500`}
                />

                <div className="relative z-10 flex justify-between">

                  {/* Left section */}
                  <div>
                    <div className="flex items-center gap-4 mb-2">
                      <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-pink-500 text-white font-bold shadow">
                        {index + 1}
                      </div>

                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {t.title}
                      </h2>
                    </div>

                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Due:{" "}
                      {t.due_date
                        ? new Date(t.due_date).toLocaleString()
                        : "—"}
                    </p>
                  </div>

                  {/* Right section */}
                  <div className="flex flex-col items-end gap-3">
                    {statusBadge(submission)}
                  </div>

                </div>
              </div>
            );
          })}

        </div>
      )}
    </div>
  );
}
