import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function ProtectedRoute({ children, roleRequired }) {
  const { user, tokens } = useContext(AuthContext);

  // 🔒 Check if user and token exist
  if (!tokens || !tokens.access || !user) {
    return <Navigate to="/login" replace />;
  }

  // 🎭 Role-based access control
  if (roleRequired && user.role !== roleRequired) {
    if (user.role === "admin") return <Navigate to="/admin" replace />;
    if (user.role === "instructor") return <Navigate to="/instructor" replace />;
    if (user.role === "student") return <Navigate to="/student" replace />;
    return <Navigate to="/" replace />;
  }

  // ✅ Everything OK — render the child component
  return children;
}
