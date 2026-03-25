import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import MedicinesPage from "./pages/MedicinesPage";
import TestsPage from "./pages/TestsPage";
import DoctorsPage from "./pages/DoctorsPage";

export default function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/user/login" element={<AuthPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/medicines" element={<MedicinesPage />} />
          <Route path="/tests" element={<TestsPage />} />
          <Route path="/doctors" element={<DoctorsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}