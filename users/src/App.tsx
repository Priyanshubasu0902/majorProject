// majorProject/users/src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { UserProvider, useUser } from "./context/UserContext";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import MedicinesPage from "./pages/MedicinesPage";
import TestsPage from "./pages/TestsPage";
import DoctorsPage from "./pages/DoctorsPage";

// Protects routes — redirects to /auth if no token
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useUser();
  if (!isLoggedIn && !localStorage.getItem("token")) {
    return <Navigate to="/auth" replace />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/auth" element={<AuthPage />} />

        {/* Protected */}
        <Route path="/home"      element={<PrivateRoute><HomePage /></PrivateRoute>} />
        <Route path="/profile"   element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
        <Route path="/medicines" element={<PrivateRoute><MedicinesPage /></PrivateRoute>} />
        <Route path="/tests"     element={<PrivateRoute><TestsPage /></PrivateRoute>} />
        <Route path="/doctors"   element={<PrivateRoute><DoctorsPage /></PrivateRoute>} />

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <UserProvider>
      <AppRoutes />
    </UserProvider>
  );
}