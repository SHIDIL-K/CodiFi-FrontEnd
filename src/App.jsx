import React, { useContext, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import About from "./pages/About";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import InstructorSignup from "./pages/InstructorSignup";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import InstructorDashboard from "./pages/InstructorDashboard";
import InstructorCourseManage from "./pages/InstructorCourseManage";
import StudentDashboard from "./pages/StudentDashboard";
import Profile from "./pages/ProfilePage";
import Index from "./pages/Index";
import InstructorList from "./pages/InstructorList";
import Home from "./pages/Home";
import InstructorHome from "./pages/InstructorHome";
import StudentCourseWorkspace from "./pages/StudentCourseWorkspace";
import CourseFeedback from "./pages/FeedbackPage";
import TaskListPage from "./pages/TaskListPage";
import TaskDetailPage  from "./pages/TaskDetailPage";
import StudentLessons from "./pages/StudentLessons";
import StudentModuleLessons from "./pages/StudentModuleLessons";
import StudentLessonDetail from "./pages/StudentLessonDetail";
import StudentLiveSessions from "./pages/StudentLiveSessions";
import ChatWidget from "./components/ChatWidget";
import NotificationsPage from "./pages/NotificationsPage";
import StudentQuizPage from "./pages/StudentQuizPage";
import InstructorChatList from "./pages/InstructorChatList";
import InstructorCourseChat from "./pages/InstructorCourseChat";
import StudentCourseChat from "./pages/StudentCourseChat";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";



export default function App() {
  const { loadUser } = useContext(AuthContext);

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <div className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-500 min-h-screen">
      <Navbar />
      <ToastContainer position="top-right" theme="colored" />
      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/index" />} />
          <Route path="/index" element={<Index />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/signup/instructor" element={<InstructorSignup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/instructors" element={<InstructorList />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/about" element={<About />} />
          
          
          <Route 
            path="/student/chat/:chatroom_id" 
            element={
              <ProtectedRoute roleRequired="student">
                <StudentCourseChat />
              </ProtectedRoute>
            }
          />

          <Route 
            path="/instructor/chat/:chatroom_id" 
            element={
              <ProtectedRoute roleRequired="instructor">
                <InstructorCourseChat />
              </ProtectedRoute>
            }
          />

          <Route 
            path="/instructor/chats" 
            element={
              <ProtectedRoute roleRequired="instructor">
                <InstructorChatList />
              </ProtectedRoute>
            } 
          />

          <Route
            path="/courses/:id/tasks/list"
            element={
              <ProtectedRoute roleRequired="student">
                <TaskListPage />
              </ProtectedRoute>
            }
          />

          <Route 
            path="/courses/:id/feedback/"  
            element={
              <ProtectedRoute roleRequired="student">
                <CourseFeedback />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/student/notifications" 
            element={
              <ProtectedRoute roleRequired="student">
                <NotificationsPage />
                </ProtectedRoute >
            }
          />

          <Route
            path="/courses/:id/live-sessions/"
            element={
              <ProtectedRoute roleRequired="student">
                <StudentLiveSessions />
              </ProtectedRoute>
            }
          />

            <Route
            path="/courses/:id/quiz/"
            element={
              <ProtectedRoute roleRequired="student">
                <StudentQuizPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/courses/:id/lessons"
            element={
              <ProtectedRoute roleRequired="student">
                <StudentLessons />
              </ProtectedRoute>
            }
          />

          <Route
            path="/courses/:courseId/module/:moduleId"
            element={
              <ProtectedRoute roleRequired="student">
                <StudentModuleLessons />
              </ProtectedRoute>
            }
          />

          <Route
            path="/lesson/:id"
            element={
              <ProtectedRoute roleRequired="student">
                <StudentLessonDetail />
              </ProtectedRoute>
            }
          />


          <Route 
            path="/courses/:id/student-view/" 
            element={
              <ProtectedRoute roleRequired="student">
                <StudentCourseWorkspace />
              </ProtectedRoute>
            } 
          />

          <Route
            path="/courses/:id/tasks/:taskId"
            element={
              <ProtectedRoute roleRequired="student">
                <TaskDetailPage  />
              </ProtectedRoute>
            }
          />

          <Route
            path="/home"
            element={
              <ProtectedRoute roleRequired="student">
                <Home />
              </ProtectedRoute>
            }
          />

          <Route
            path="/instructor-home"
            element={
              <ProtectedRoute roleRequired="instructor">
                <InstructorHome />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/instructor"
            element={
              <ProtectedRoute roleRequired="instructor">
                <InstructorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/instructor/course/:id/manage"
            element={
              <ProtectedRoute roleRequired="instructor">
                <InstructorCourseManage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student"
            element={
              <ProtectedRoute roleRequired="student">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
}
