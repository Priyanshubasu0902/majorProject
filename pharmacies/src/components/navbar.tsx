import React from "react";
import { Card } from "./ui/card";

const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 w-full px-6">
      {/* Full-width glass card */}
      <Card className="w-full mt-4 rounded-3xl border border-white/40 bg-white/70 backdrop-blur-xl shadow-lg">
        
        {/* Centered content */}
        <nav className="mx-auto max-w-7xl flex items-center justify-between px-8 py-4">
          
          {/* Logo */}
          <div className="flex flex-col">
            <h1 className="text-2xl font-semibold tracking-wide text-slate-900">
              Med<span className="text-emerald-600">Lux</span>
            </h1>
            <span className="text-xs text-slate-500">
              Partner Portal
            </span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-600">
            <a className="hover:text-emerald-600 transition" href="#">
              Dashboard
            </a>
            <a className="hover:text-emerald-600 transition" href="#">
              Products
            </a>
            <a className="hover:text-emerald-600 transition" href="#">
              Orders
            </a>
            <a className="hover:text-emerald-600 transition" href="#">
              Profile
            </a>
          </div>

          {/* Action */}
          <button className="rounded-full bg-emerald-600 px-6 py-2 text-sm font-medium text-white shadow-md hover:bg-emerald-700 transition">
            Logout
          </button>

        </nav>
      </Card>
    </header>
  );
};

export default Navbar;
