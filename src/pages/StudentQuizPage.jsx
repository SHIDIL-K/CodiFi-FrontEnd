// src/pages/StudentQuizPage.jsx
import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { ArrowLeft } from "lucide-react";

const BASE_URL = "https://codifi-backendend-new.onrender.com";

export default function StudentQuizPage() {
  const { id } = useParams(); // course id
  const { tokens } = useContext(AuthContext);
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [quizStates, setQuizStates] = useState({}); // { quizId: { answers, results, submitted } }
  const [loading, setLoading] = useState(true);

  // Fetch quizzes for this course
  const loadQuizzes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/courses/${id}/quizzes/`, {
        headers: { Authorization: `Bearer ${tokens?.access}` },
      });
      const data = await res.json();
      setQuizzes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading quizzes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuizzes();
  }, [id]);

  // Handle option selection
  const handleOptionSelect = (quizId, questionId, optionText) => {
    setQuizStates((prev) => ({
      ...prev,
      [quizId]: {
        ...(prev[quizId] || { answers: {}, results: {}, submitted: false }),
        answers: {
          ...(prev[quizId]?.answers || {}),
          [questionId]: optionText,
        },
      },
    }));
  };

  // Submit a single quiz
  const handleSubmitQuiz = async (quiz) => {
    const currentQuiz = quizStates[quiz.id] || { answers: {}, results: {} };
    const answers = currentQuiz.answers;

    if (!Object.keys(answers).length) {
      toast.warning("Please answer at least one question before submitting this quiz!");
      return;
    }

    try {
      const resultsObj = {};

      for (const q of quiz.questions) {
        if (answers[q.id]) {
          const payload = {
            quiz: quiz.id,
            question: q.id,
            selected_option: answers[q.id],
          };

          const res = await fetch(`${BASE_URL}/api/attempts/create/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${tokens?.access}`,
            },
            body: JSON.stringify(payload),
          });

          const data = await res.json();
          resultsObj[q.id] = data.is_correct;
        }
      }

      const total = quiz.questions.length;
      const correct = Object.values(resultsObj).filter(Boolean).length;
      const scorePercent = Math.round((correct / total) * 100);

      setQuizStates((prev) => ({
        ...prev,
        [quiz.id]: {
          ...prev[quiz.id],
          results: resultsObj,
          submitted: true,
          score: scorePercent,
        },
      }));

      toast.success(`"${quiz.title}" submitted! You scored ${scorePercent}%`);
    } catch (err) {
      console.error("Error submitting quiz:", err);
      toast.error("Error submitting quiz!");
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-600 dark:text-gray-300 animate-pulse">
        Loading quizzes...
      </div>
    );
  }

  if (quizzes.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
        No quizzes available for this course yet.
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 pt-28 space-y-8 transition-colors duration-300 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 px-4 py-2  bg-gradient-to-r from-indigo-600 to-purple-600 text-gray-100 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
          <ArrowLeft className="w-5 h-5 text-gray-200" />
        </button>
      <h1 className="text-3xl font-bold text-blue-700 dark:text-blue-400 mb-6 text-center">
        Course Quizzes 🧠
      </h1>

      {quizzes.map((quiz) => {
        const quizState = quizStates[quiz.id] || {
          answers: {},
          results: {},
          submitted: false,
          score: null,
        };
        const { answers, results, submitted, score } = quizState;

        return (
          <div
            key={quiz.id}
            className="rounded-2xl shadow-lg bg-white dark:bg-gray-800 p-6 border border-gray-200 dark:border-gray-700 transition hover:shadow-2xl"
          >
            <h2 className="text-2xl font-semibold text-blue-700 dark:text-blue-400 mb-3">
              {quiz.title}
            </h2>

            {quiz.questions.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No questions added yet.</p>
            ) : (
              quiz.questions.map((q, idx) => (
                <div
                  key={q.id}
                  className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4 space-y-2 bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 transition hover:scale-[1.01]"
                >
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {idx + 1}. {q.text}
                  </p>
                  <div className="space-y-2">
                    {q.options.map((opt) => (
                      <label
                        key={opt.id}
                        className={`block border rounded-lg px-4 py-2 cursor-pointer transition-all ${
                          answers[q.id] === opt.text
                            ? "bg-blue-100 border-blue-600 dark:bg-blue-800/30 dark:border-blue-400"
                            : "border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`q_${quiz.id}_${q.id}`}
                          value={opt.text}
                          checked={answers[q.id] === opt.text}
                          disabled={submitted}
                          onChange={() =>
                            handleOptionSelect(quiz.id, q.id, opt.text)
                          }
                          className="mr-2 accent-blue-600 dark:accent-blue-400"
                        />
                        <span className="text-gray-800 dark:text-gray-200">{opt.text}</span>
                      </label>
                    ))}
                  </div>

                  {submitted && results[q.id] !== undefined && (
                    <p
                      className={`mt-2 font-semibold ${
                        results[q.id]
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {results[q.id] ? "✅ Correct" : "❌ Wrong"}
                    </p>
                  )}
                </div>
              ))
            )}

            {!submitted && quiz.questions.length > 0 && (
              <button
                onClick={() => handleSubmitQuiz(quiz)}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold shadow transition transform hover:scale-[1.02]"
              >
                Submit "{quiz.title}"
              </button>
            )}

            {submitted && (
              <div className="text-center text-green-700 dark:text-green-400 font-medium text-lg mt-4">
                🎉 You submitted this quiz!
                <br />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Your Score:
                </span>{" "}
                <span className="font-bold text-blue-700 dark:text-blue-400">
                  {score}%
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
