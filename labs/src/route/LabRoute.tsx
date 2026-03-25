// src/routes/PharmacyRoute.tsx
import { Navigate } from "react-router-dom";
import { useLab } from "@/context/LabContext";
import type { JSX } from "react";

export function LabRoute({ children }: { children: JSX.Element }) {
  const { labToken, role, loading } = useLab();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-emerald-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!labToken || role !== "lab") {
    return <Navigate to="/lab/login" replace />;
  }

  return children;
}
