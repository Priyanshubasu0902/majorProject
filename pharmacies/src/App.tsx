import { Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar";
import Sidebar from "./components/sidebar";
import Dashboard from "./pages/Dashboard";
import AddProduct from "./pages/AddProducts";
import ViewProducts from "./pages/ViewProducts";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";
import React from "react";
import Footer from "./components/Footer";

const App = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      <Navbar />

      <div className="flex">
        <Sidebar />
      <main className="flex-1 p-10 bg-slate-50">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/addproduct" element={<AddProduct />} />
          <Route path="/products" element={<ViewProducts />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
      </div>
      <Footer />
      </div>
  );
};

export default App;
