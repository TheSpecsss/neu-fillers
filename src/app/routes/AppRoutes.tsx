import { Routes, Route, Navigate } from "react-router-dom";
import { AuthRoute } from "@/features/auth/components/AuthRoute";
import { Login } from "@/features/auth/components/Login";
import { Dashboard } from "@/features/dashboard/components/Dashboard";
import { Editor } from "@/features/editor/components/Editor";
import { Process } from "@/features/process/components/Process";
import { Upload } from "@/features/upload/components/Upload";
import { NotFound } from "@/shared/components/NotFound";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          localStorage.getItem("token") ? (
            <Navigate to="/dashboard" />
          ) : (
            <Login />
          )
        }
      />
      <Route
        path="/dashboard"
        element={<AuthRoute element={<Dashboard />} />}
      />
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/upload" element={<Upload />} />
      <Route path="/editor" element={<Editor />} />
      <Route path="/process" element={<Process />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}; 