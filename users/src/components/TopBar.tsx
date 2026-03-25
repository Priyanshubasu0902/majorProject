import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MapPin, ChevronDown, User, X, Check } from "lucide-react";
import { useUser } from "../context/UserContext";
import { motion, AnimatePresence } from "framer-motion";

const NAV_ITEMS = [
  { label: "Home", path: "/home", icon: "🏠" },
  { label: "Medicines", path: "/medicines", icon: "💊" },
  { label: "Tests", path: "/tests", icon: "🧪" },
  { label: "Doctors", path: "/doctors", icon: "👨‍⚕️" },
];

export default function TopBar() {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [showAddressPicker, setShowAddressPicker] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Top row */}
          <div className="flex items-center justify-between py-3 gap-4">
            {/* Logo */}
            <h1 className="text-xl font-semibold tracking-wide text-slate-900 shrink-0 cursor-pointer" onClick={() => navigate("/home")}>
              Med<span className="text-emerald-600">Lux</span>
            </h1>

            {/* Address selector */}
            <button
              onClick={() => { setShowAddressPicker(p => !p); setShowProfileMenu(false); }}
              className="flex items-center gap-1.5 text-left min-w-0 group"
            >
              <MapPin size={15} className="text-emerald-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 leading-none mb-0.5">Deliver to</p>
                <p className="text-sm font-medium text-slate-700 truncate max-w-[180px] sm:max-w-xs group-hover:text-emerald-700 transition">
                  {user.defaultAddress}
                </p>
              </div>
              <ChevronDown size={13} className={`text-slate-400 shrink-0 transition-transform ${showAddressPicker ? "rotate-180" : ""}`} />
            </button>

            {/* Profile */}
            <button
              onClick={() => { setShowProfileMenu(p => !p); setShowAddressPicker(false); }}
              className="flex items-center gap-2 shrink-0"
            >
              <div className="w-9 h-9 rounded-full bg-emerald-100 border-2 border-emerald-200 flex items-center justify-center overflow-hidden shadow-sm">
                {user.avatar
                  ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                  : <User size={16} className="text-emerald-600" />}
              </div>
              <span className="hidden sm:block text-sm font-medium text-slate-700 max-w-[100px] truncate">
                {user.fullName.split(" ")[0]}
              </span>
              <ChevronDown size={13} className={`hidden sm:block text-slate-400 transition-transform ${showProfileMenu ? "rotate-180" : ""}`} />
            </button>
          </div>

          {/* Bottom nav */}
          <nav className="flex gap-1 pb-1 overflow-x-auto scrollbar-hide">
            {NAV_ITEMS.map(item => {
              const active = location.pathname === item.path;
              return (
                <button key={item.path} onClick={() => navigate(item.path)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                    active
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                  }`}>
                  <span>{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Address picker dropdown */}
      <AnimatePresence>
        {showAddressPicker && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setShowAddressPicker(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="fixed top-[108px] left-4 right-4 sm:left-auto sm:right-auto sm:w-96 sm:mx-auto z-40 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-slate-700">Choose delivery address</p>
                <button onClick={() => setShowAddressPicker(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-2">
                {user.addresses.map(addr => (
                  <button key={addr} onClick={() => { setUser({ defaultAddress: addr }); setShowAddressPicker(false); }}
                    className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition flex items-start gap-3 ${
                      user.defaultAddress === addr
                        ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                        : "border-slate-100 hover:border-slate-200 text-slate-600"
                    }`}>
                    <MapPin size={14} className="mt-0.5 shrink-0 text-emerald-500" />
                    <span className="flex-1">{addr}</span>
                    {user.defaultAddress === addr && <Check size={14} className="text-emerald-600 shrink-0 mt-0.5" />}
                  </button>
                ))}
                <button className="w-full text-center py-2.5 text-sm text-emerald-600 font-medium hover:bg-emerald-50 rounded-xl transition">
                  + Add new address
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Profile dropdown */}
      <AnimatePresence>
        {showProfileMenu && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setShowProfileMenu(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="fixed top-[60px] right-4 z-40 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 w-64"
            >
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-11 h-11 rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden">
                  {user.avatar
                    ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                    : <User size={20} className="text-emerald-600" />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{user.fullName}</p>
                  <p className="text-xs text-slate-400 truncate">{user.email}</p>
                </div>
              </div>
              <div className="pt-2 space-y-1">
                {[
                  { label: "My Profile", icon: "👤", action: () => { navigate("/profile"); setShowProfileMenu(false); } },
                  { label: "My Orders", icon: "📦", action: () => {} },
                  { label: "My Tests", icon: "🧪", action: () => {} },
                  { label: "Settings", icon: "⚙️", action: () => {} },
                ].map(item => (
                  <button key={item.label} onClick={item.action}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition">
                    <span>{item.icon}</span> {item.label}
                  </button>
                ))}
                <div className="pt-1 border-t border-slate-100">
                  <button onClick={() => navigate("/")}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-rose-500 hover:bg-rose-50 transition">
                    🚪 Sign Out
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}