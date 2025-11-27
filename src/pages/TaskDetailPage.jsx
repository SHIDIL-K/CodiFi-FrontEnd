import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { ArrowLeft } from "lucide-react";


const BASE_URL = "https://codifi-backendend-new.onrender.com";

export default function TaskDetailPage() {
  const { id: courseId, taskId } = useParams();
  const navigate = useNavigate();
  const { tokens } = useContext(AuthContext);

  const [task, setTask] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Load all tasks and filter manually
  const loadTaskList = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/tasks/?course=${courseId}`, {
        headers: {
          Authorization: `Bearer ${tokens?.access}`,
        },
      });

      const data = await res.json();
      const list = Array.isArray(data) ? data : data.results || [];

      const found = list.find((t) => Number(t.id) === Number(taskId));

      if (!found) {
        toast.error("Task not found.");
      }

      setTask(found || null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load task.");
    }
  };

  // Load submissions and find matching one
  const loadSubmission = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/student/submissions/`, {
        headers: { Authorization: `Bearer ${tokens?.access}` },
      });

      if (!res.ok) return;

      const data = await res.json();
      if (Array.isArray(data)) {
        const match = data.find((s) => Number(s.task) === Number(taskId));
        if (match) {
          setSubmission(match);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([loadTaskList(), loadSubmission()]).finally(() =>
      setLoading(false)
    );
    // eslint-disable-next-line
  }, [courseId, taskId, tokens?.access]);

  // Handle uploads
  const handleSubmit = async (file) => {
    if (!file) return toast.warning("Please choose a file.");

    setUploading(true);

    const formData = new FormData();
    formData.append("task", taskId);
    formData.append("submission_file", file);

    try {
      const res = await fetch(`${BASE_URL}/api/tasks/submit/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokens?.access}`,
        },
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || "Submission failed.");
        setUploading(false);
        return;
      }

      toast.success("Uploaded successfully!");
      setSubmission(result);
    } catch (error) {
      console.error(error);
      toast.error("Upload failed.");
    }
    setUploading(false);
  };

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-600">Loading task…</div>
    );
  }

  if (!task) {
    return (
      <div className="text-center py-20 text-gray-600">Task not found.</div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br pt-24 from-gray-50 via-blue-50 to-purple-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 px-5 py-10">
      <div className="flex items-center gap-2 text-sm mb-6">
        {/* Breadcrumb */}
          
        <button
          onClick={() => navigate("/student")}
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          Dashboard
        </button>

        <span className="text-gray-400">/</span>

        <button
          onClick={() => navigate(`/courses/${courseId}/tasks/list/`)}
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          Task List
        </button>

        <span className="text-gray-400">/</span>

        <span className="text-gray-700 dark:text-gray-200 font-semibold">
          Tasks
        </span>
      </div>
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-gray-100 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition"
      >
        <ArrowLeft className="w-5 h-5 text-gray-800 dark:text-gray-200" />
      </button>
          
      <div className="max-w-3xl mx-auto py-10 px-4">
        
        <div className="flex justify-between mb-6">
          <h1 className="text-xl font-bold">{task.title}</h1>
          <div />
        </div>

        <div className="bg-white dark:bg-gray-800 shadow p-6 rounded-xl">
          <p className="text-gray-700 dark:text-gray-300 mb-4">{task.description}</p>

          {task.question && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-4 mb-4">
              <p className="font-semibold text-blue-700 dark:text-blue-300">
                Question:
              </p>
              <p className="mt-1 text-gray-700 dark:text-gray-200">
                {task.question}
              </p>
            </div>
          )}

          <p className="text-sm text-gray-500 mb-4">
            <strong>Due:</strong>{" "}
            {task.due_date
              ? new Date(task.due_date).toLocaleString()
              : "Not specified"}
          </p>

          {/* Submission status */}
          <div className="mb-4">
            <strong>Status: </strong>
            <span
              className={
                submission
                  ? submission.status === "approved"
                    ? "text-green-600"
                    : submission.status === "rejected"
                    ? "text-red-600"
                    : "text-yellow-600"
                  : "text-gray-500"
              }
            >
              {submission ? submission.status : "Not submitted"}
            </span>
          </div>

          {/* Submitted file */}
          {submission && submission.submission_file && (
            <a
              href={submission.submission_file}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 underline block mb-4"
            >
              View submitted file
            </a>
          )}

          {/* Feedback */}
          {submission && submission.feedback && (
            <div className="p-3 bg-gray-100 dark:bg-gray-900 rounded mb-4">
              <strong>Feedback:</strong>
              <p className="text-gray-700 dark:text-gray-300">
                {submission.feedback}
              </p>
            </div>
          )}

          {/* Upload / Reupload */}
          {(!submission || submission.status === "rejected") && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const file = e.target.file.files[0];
                handleSubmit(file);
              }}
            >
              <input
                type="file"
                name="file"
                className="block w-full mb-4 border p-2 rounded"
              />

              <button
                type="submit"
                disabled={uploading}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                {uploading
                  ? "Uploading..."
                  : submission
                  ? "Re-upload"
                  : "Submit Task"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
