// src/routes/PharmacyRoute.tsx
import { Navigate } from "react-router-dom";
import { usePharmacy } from "@/context/PharmacyContext";
import { JSX } from "react/jsx-dev-runtime";

export function PharmacyRoute({ children }: { children: JSX.Element }) {
  const { pharmacyToken, role, loading } = usePharmacy();

  if (loading) return null;

  if (!pharmacyToken || role !== "pharmacy") {
    return <Navigate to="/pharmacy/login" replace />;
  }

  return children;
}
