import { useState } from "react";
import { Search, Star, Clock, Video } from "lucide-react";
import { motion } from "framer-motion";
import TopBar from "../components/TopBar";

const SPECIALITIES = ["All", "Cardiologist", "Dermatologist", "Endocrinologist", "Orthopedic", "Neurologist", "Pediatrician", "Psychiatrist"];

const DOCTORS = [
  { name: "Dr. Priya Nair", spec: "Cardiologist", exp: "12 yrs", rating: 4.9, reviews: 312, fee: 600, next: "Today, 4:00 PM", emoji: "👩‍⚕️", video: true },
  { name: "Dr. Arjun Mehta", spec: "Dermatologist", exp: "8 yrs", rating: 4.8, reviews: 245, fee: 500, next: "Today, 6:00 PM", emoji: "👨‍⚕️", video: true },
  { name: "Dr. Sunita Rao", spec: "Endocrinologist", exp: "15 yrs", rating: 4.9, reviews: 410, fee: 800, next: "Tomorrow, 10:00 AM", emoji: "👩‍⚕️", video: false },
  { name: "Dr. Vikram Singh", spec: "Orthopedic", exp: "10 yrs", rating: 4.7, reviews: 189, fee: 700, next: "Today, 5:30 PM", emoji: "👨‍⚕️", video: true },
  { name: "Dr. Meena Iyer", spec: "Neurologist", exp: "18 yrs", rating: 4.9, reviews: 503, fee: 1000, next: "Tomorrow, 2:00 PM", emoji: "👩‍⚕️", video: false },
  { name: "Dr. Rohan Das", spec: "Pediatrician", exp: "7 yrs", rating: 4.8, reviews: 278, fee: 450, next: "Today, 7:00 PM", emoji: "👨‍⚕️", video: true },
];

export default function DoctorsPage() {
  const [search, setSearch] = useState("");
  const [spec, setSpec] = useState("All");
  const [booked, setBooked] = useState<string[]>([]);

  const filtered = DOCTORS.filter(d =>
    (spec === "All" || d.spec === spec) &&
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-slate-800">Consult Doctors</h2>
          <p className="text-sm text-slate-400 mt-0.5">Verified specialists • Online & in-person consultations</p>
        </div>

        <div className="relative mb-5">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search doctors, specialities..."
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition shadow-sm" />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {SPECIALITIES.map(s => (
            <button key={s} onClick={() => setSpec(s)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition ${
                spec === s ? "bg-emerald-600 text-white shadow-sm" : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300"
              }`}>{s}</button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((d, i) => {
            const isBooked = booked.includes(d.name);
            return (
              <motion.div key={d.name} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition flex flex-col">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-3xl shrink-0">
                    {d.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{d.name}</p>
                    <p className="text-xs text-slate-500">{d.spec} • {d.exp} exp</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Star size={11} className="text-amber-400 fill-amber-400" />
                      <span className="text-xs font-semibold text-slate-700">{d.rating}</span>
                      <span className="text-xs text-slate-400">({d.reviews} reviews)</span>
                    </div>
                  </div>
                  {d.video && (
                    <span className="flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-lg border border-blue-100 shrink-0">
                      <Video size={10} /> Online
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between py-3 border-y border-slate-50 mb-4">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Clock size={11} className="text-emerald-500" /> {d.next}
                  </div>
                  <div className="text-sm font-bold text-slate-900">₹{d.fee}</div>
                </div>

                <button onClick={() => setBooked(b => [...b, d.name])} disabled={isBooked}
                  className={`w-full py-2.5 rounded-xl text-sm font-medium transition ${
                    isBooked ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-900 text-white hover:bg-slate-800"
                  }`}>
                  {isBooked ? "✓ Appointment Booked" : "Book Appointment"}
                </button>
              </motion.div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-slate-500 text-sm">No doctors found.</p>
          </div>
        )}
      </main>
    </div>
  );
}