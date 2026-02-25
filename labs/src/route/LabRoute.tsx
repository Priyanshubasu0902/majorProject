// src/routes/PharmacyRoute.tsx
import { Navigate } from "react-router-dom";
import { useLab } from "@/context/LabContext";
import { JSX } from "react/jsx-dev-runtime";

export function LabRoute({ children }: { children: JSX.Element }) {
  const { labToken, role, loading } = useLab();

  if (loading) return null;

  if (!labToken || role !== "lab") {
    return <Navigate to="/lab/login" replace />;
  }

  return children;
}
