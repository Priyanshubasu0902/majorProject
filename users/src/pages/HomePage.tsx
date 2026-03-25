import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Clock, Star, TrendingUp } from "lucide-react";
import TopBar from "../components/TopBar";
import { useUser } from "../context/UserContext";

const QUICK_ACTIONS = [
  { label: "Book a Test", icon: "🧪", color: "bg-blue-50 border-blue-100", iconBg: "bg-blue-100", path: "/tests" },
  { label: "Buy Medicine", icon: "💊", color: "bg-emerald-50 border-emerald-100", iconBg: "bg-emerald-100", path: "/medicines" },
  { label: "Consult Doctor", icon: "👨‍⚕️", color: "bg-purple-50 border-purple-100", iconBg: "bg-purple-100", path: "/doctors" },
  { label: "Scan Report", icon: "📄", color: "bg-amber-50 border-amber-100", iconBg: "bg-amber-100", path: "/scan" },
];

const RECENT_ORDERS = [
  { label: "CBC Blood Test", date: "28 Feb 2026", status: "Completed", icon: "🩸" },
  { label: "Paracetamol 500mg × 10", date: "25 Feb 2026", status: "Delivered", icon: "💊" },
  { label: "Dr. Priya Nair Consult", date: "20 Feb 2026", status: "Completed", icon: "👩‍⚕️" },
];

const HEALTH_TIPS = [
  { title: "Stay Hydrated", desc: "Drink 8 glasses of water daily for optimal health.", icon: "💧", color: "from-blue-50 to-cyan-50 border-blue-100" },
  { title: "Sleep Well", desc: "7-9 hours of quality sleep boosts immunity.", icon: "😴", color: "from-indigo-50 to-purple-50 border-indigo-100" },
  { title: "Exercise Daily", desc: "30 min of moderate activity improves heart health.", icon: "🏃", color: "from-emerald-50 to-teal-50 border-emerald-100" },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const stagger = { container: { animate: { transition: { staggerChildren: 0.07 } } }, item: { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } } };

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8">

        {/* Greeting */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h2 className="text-2xl font-semibold text-slate-800">
            {greeting}, <span className="text-emerald-600">{user.fullName.split(" ")[0]}</span> 👋
          </h2>
          <p className="text-sm text-slate-400 mt-1">How can we help you today?</p>
        </motion.div>

        {/* Health Banner */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Annual Health Package</p>
            <h3 className="text-xl font-semibold">Get your full body checkup</h3>
            <p className="text-sm text-slate-300 mt-1">70+ tests • Home sample collection • Reports in 24 hrs</p>
          </div>
          <button onClick={() => navigate("/tests")}
            className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3 rounded-2xl text-sm font-medium flex items-center gap-2 transition shrink-0">
            Book Now <ArrowRight size={15} />
          </button>
        </motion.div>

        {/* Quick Actions */}
        <section>
          <h3 className="text-base font-semibold text-slate-700 mb-3">Quick Actions</h3>
          <motion.div className="grid grid-cols-2 sm:grid-cols-4 gap-3"
            variants={stagger.container} initial="initial" animate="animate">
            {QUICK_ACTIONS.map((a) => (
              <motion.button key={a.label} variants={stagger.item} onClick={() => navigate(a.path)}
                className={`${a.color} border rounded-2xl p-4 text-center hover:shadow-md transition-all active:scale-[0.98] group`}>
                <div className={`${a.iconBg} w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl group-hover:scale-110 transition-transform`}>
                  {a.icon}
                </div>
                <p className="text-sm font-medium text-slate-700">{a.label}</p>
              </motion.button>
            ))}
          </motion.div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-slate-700 flex items-center gap-2">
                <Clock size={15} className="text-slate-400" /> Recent Activity
              </h3>
              <button className="text-xs text-emerald-600 hover:underline">View all</button>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
              {RECENT_ORDERS.map((o, i) => (
                <div key={i} className="flex items-center gap-3 p-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-xl border border-slate-100">{o.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{o.label}</p>
                    <p className="text-xs text-slate-400">{o.date}</p>
                  </div>
                  <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-medium border border-emerald-100">
                    {o.status}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Health Tips */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-slate-700 flex items-center gap-2">
                <TrendingUp size={15} className="text-slate-400" /> Health Tips
              </h3>
            </div>
            <div className="space-y-3">
              {HEALTH_TIPS.map((tip, i) => (
                <div key={i} className={`bg-gradient-to-r ${tip.color} border rounded-2xl p-4 flex items-center gap-4`}>
                  <div className="text-2xl">{tip.icon}</div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{tip.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{tip.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Top Doctors teaser */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-slate-700 flex items-center gap-2">
              <Star size={15} className="text-amber-400" /> Top Rated Doctors
            </h3>
            <button onClick={() => navigate("/doctors")} className="text-xs text-emerald-600 hover:underline">See all</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { name: "Dr. Priya Nair", spec: "Cardiologist", rating: 4.9, exp: "12 yrs", emoji: "👩‍⚕️" },
              { name: "Dr. Arjun Mehta", spec: "Dermatologist", rating: 4.8, exp: "8 yrs", emoji: "👨‍⚕️" },
              { name: "Dr. Sunita Rao", spec: "Endocrinologist", rating: 4.9, exp: "15 yrs", emoji: "👩‍⚕️" },
            ].map((d, i) => (
              <div key={i} className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-3 shadow-sm hover:shadow-md transition cursor-pointer group">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">{d.emoji}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{d.name}</p>
                  <p className="text-xs text-slate-400">{d.spec}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-amber-500 font-medium">⭐ {d.rating}</span>
                    <span className="text-xs text-slate-400">• {d.exp}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}