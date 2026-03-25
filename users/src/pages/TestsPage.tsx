import { useState } from "react";
import { Search, MapPin, Clock, ChevronRight, ArrowLeft, Home, X, Star, TestTube } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import TopBar from "../components/TopBar";
import CartDrawer from "../components/CartDrawer";
import { useCart } from "../context/UserContext";

interface Lab {
  id: string; name: string; address: string; distance: string;
  rating: number; reviews: number; turnaround: string;
  homeCollection: boolean; open: boolean; tags: string[]; emoji: string;
  collectionFee: number;
}
interface Test {
  id: string; name: string; price: number; mrp: number;
  category: string; reportTime: string; homeCollection: boolean; popular: boolean;
}

const LABS: Lab[] = [
  { id: "l1", name: "Dr. Lal PathLabs", address: "14, Shakespeare Sarani, Kolkata", distance: "0.5 km", rating: 4.9, reviews: 512, turnaround: "Same Day", homeCollection: true, open: true, tags: ["NABL Accredited", "Home Collection"], emoji: "🔬", collectionFee: 0 },
  { id: "l2", name: "SRL Diagnostics", address: "22, Park Circus, Kolkata", distance: "1.1 km", rating: 4.7, reviews: 298, turnaround: "Next Day", homeCollection: true, open: true, tags: ["Trusted Chain", "Wide Tests"], emoji: "🧬", collectionFee: 50 },
  { id: "l3", name: "Thyrocare", address: "5, Tollygunge, Kolkata", distance: "2.0 km", rating: 4.6, reviews: 204, turnaround: "Next Day", homeCollection: true, open: true, tags: ["Budget Friendly", "Home Collection"], emoji: "🩺", collectionFee: 0 },
  { id: "l4", name: "Metropolis Healthcare", address: "33, Gariahat Road, Kolkata", distance: "2.4 km", rating: 4.8, reviews: 376, turnaround: "Same Day", homeCollection: false, open: true, tags: ["NABL Accredited", "Premium"], emoji: "🏛️", collectionFee: 0 },
  { id: "l5", name: "Apollo Diagnostics", address: "67, Lake Town, Kolkata", distance: "3.2 km", rating: 4.7, reviews: 289, turnaround: "Same Day", homeCollection: true, open: false, tags: ["Trusted Chain", "24 hr Reports"], emoji: "⚕️", collectionFee: 80 },
  { id: "l6", name: "Suraksha Diagnostics", address: "9, Rajarhat, Kolkata", distance: "3.8 km", rating: 4.5, reviews: 167, turnaround: "Next Day", homeCollection: true, open: true, tags: ["Affordable", "Home Collection"], emoji: "🛡️", collectionFee: 0 },
];

const LAB_TESTS: Record<string, Test[]> = {
  l1: [
    { id: "t1", name: "Complete Blood Count (CBC)", price: 299, mrp: 499, category: "Full Body", reportTime: "Same Day", homeCollection: true, popular: true },
    { id: "t2", name: "Full Body Checkup", price: 999, mrp: 2499, category: "Full Body", reportTime: "Next Day", homeCollection: true, popular: true },
    { id: "t3", name: "Lipid Profile", price: 399, mrp: 699, category: "Heart", reportTime: "Same Day", homeCollection: true, popular: false },
    { id: "t4", name: "HbA1c (Diabetes)", price: 349, mrp: 599, category: "Diabetes", reportTime: "Same Day", homeCollection: true, popular: true },
    { id: "t5", name: "Thyroid Profile (T3,T4,TSH)", price: 499, mrp: 899, category: "Thyroid", reportTime: "Next Day", homeCollection: true, popular: false },
    { id: "t6", name: "Vitamin D & B12", price: 699, mrp: 1299, category: "Vitamins", reportTime: "Next Day", homeCollection: true, popular: false },
  ],
  l2: [
    { id: "t1", name: "Complete Blood Count (CBC)", price: 280, mrp: 499, category: "Full Body", reportTime: "Same Day", homeCollection: true, popular: true },
    { id: "t7", name: "Liver Function Test (LFT)", price: 449, mrp: 799, category: "Liver", reportTime: "Same Day", homeCollection: true, popular: false },
    { id: "t8", name: "Kidney Function Test (KFT)", price: 449, mrp: 799, category: "Kidney", reportTime: "Same Day", homeCollection: false, popular: false },
    { id: "t4", name: "HbA1c (Diabetes)", price: 380, mrp: 599, category: "Diabetes", reportTime: "Next Day", homeCollection: true, popular: true },
    { id: "t5", name: "Thyroid Profile (T3,T4,TSH)", price: 520, mrp: 899, category: "Thyroid", reportTime: "Next Day", homeCollection: true, popular: false },
  ],
  l3: [
    { id: "t2", name: "Full Body Checkup", price: 799, mrp: 2499, category: "Full Body", reportTime: "Next Day", homeCollection: true, popular: true },
    { id: "t5", name: "Thyroid Profile (T3,T4,TSH)", price: 399, mrp: 899, category: "Thyroid", reportTime: "Next Day", homeCollection: true, popular: false },
    { id: "t9", name: "Urine Routine Examination", price: 99, mrp: 199, category: "General", reportTime: "Same Day", homeCollection: true, popular: false },
    { id: "t4", name: "HbA1c (Diabetes)", price: 299, mrp: 599, category: "Diabetes", reportTime: "Same Day", homeCollection: true, popular: true },
  ],
  l4: [
    { id: "t1", name: "Complete Blood Count (CBC)", price: 320, mrp: 499, category: "Full Body", reportTime: "Same Day", homeCollection: false, popular: true },
    { id: "t3", name: "Lipid Profile", price: 449, mrp: 699, category: "Heart", reportTime: "Same Day", homeCollection: false, popular: false },
    { id: "t10", name: "Echocardiogram", price: 1200, mrp: 2000, category: "Heart", reportTime: "Same Day", homeCollection: false, popular: false },
    { id: "t6", name: "Vitamin D & B12", price: 649, mrp: 1299, category: "Vitamins", reportTime: "Next Day", homeCollection: false, popular: false },
    { id: "t7", name: "Liver Function Test (LFT)", price: 399, mrp: 799, category: "Liver", reportTime: "Same Day", homeCollection: false, popular: false },
  ],
  l5: [
    { id: "t2", name: "Full Body Checkup", price: 1099, mrp: 2499, category: "Full Body", reportTime: "Same Day", homeCollection: true, popular: true },
    { id: "t8", name: "Kidney Function Test (KFT)", price: 399, mrp: 799, category: "Kidney", reportTime: "Same Day", homeCollection: true, popular: false },
    { id: "t1", name: "Complete Blood Count (CBC)", price: 270, mrp: 499, category: "Full Body", reportTime: "Same Day", homeCollection: true, popular: true },
  ],
  l6: [
    { id: "t4", name: "HbA1c (Diabetes)", price: 249, mrp: 599, category: "Diabetes", reportTime: "Next Day", homeCollection: true, popular: true },
    { id: "t9", name: "Urine Routine Examination", price: 80, mrp: 199, category: "General", reportTime: "Next Day", homeCollection: true, popular: false },
    { id: "t5", name: "Thyroid Profile (T3,T4,TSH)", price: 349, mrp: 899, category: "Thyroid", reportTime: "Next Day", homeCollection: true, popular: false },
    { id: "t3", name: "Lipid Profile", price: 329, mrp: 699, category: "Heart", reportTime: "Next Day", homeCollection: true, popular: false },
  ],
};

const ALL_TESTS_FLAT = Object.entries(LAB_TESTS).flatMap(([labId, tests]) =>
  tests.map(t => ({ ...t, labId, lab: LABS.find(l => l.id === labId)! }))
);

const SORT_OPTIONS = ["Nearest", "Rating", "Fastest Reports", "Home Collection"];

export default function TestsPage() {
  const { addTest, testCount, testItems } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [providerSearch, setProviderSearch] = useState("");
  const [testProductSearch, setTestProductSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"providers" | "tests">("providers");
  const [selectedLab, setSelectedLab] = useState<Lab | null>(null);
  const [sortBy, setSortBy] = useState("Nearest");
  const [showHomeOnly, setShowHomeOnly] = useState(false);
  const [testSearch, setTestSearch] = useState("");

  const filteredLabs = LABS.filter(l =>
    l.name.toLowerCase().includes(providerSearch.toLowerCase()) ||
    l.address.toLowerCase().includes(providerSearch.toLowerCase())
  ).filter(l => showHomeOnly ? l.homeCollection : true)
  .sort((a, b) => {
    if (sortBy === "Rating") return b.rating - a.rating;
    if (sortBy === "Fastest Reports") return a.turnaround.localeCompare(b.turnaround);
    if (sortBy === "Home Collection") return (b.homeCollection ? 1 : 0) - (a.homeCollection ? 1 : 0);
    return parseFloat(a.distance) - parseFloat(b.distance);
  });

  const testResults = ALL_TESTS_FLAT.filter(t =>
    t.name.toLowerCase().includes(testProductSearch.toLowerCase())
  );

  const labTests = selectedLab
    ? (LAB_TESTS[selectedLab.id] || []).filter(t =>
        t.name.toLowerCase().includes(testSearch.toLowerCase())
      )
    : [];

  const handleAddTest = (test: Test, lab: Lab) => {
    addTest(
      { id: test.id, name: test.name, price: test.price, mrp: test.mrp, reportTime: test.reportTime, homeCollection: test.homeCollection },
      { id: lab.id, name: lab.name, address: lab.address, emoji: lab.emoji, collectionFee: lab.collectionFee }
    );
  };

  const isBooked = (testId: string) => testItems.some(i => i.id === testId);
  const disc = (p: number, m: number) => Math.round(((m - p) / m) * 100);

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} defaultTab="tests" />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            {selectedLab && (
              <button onClick={() => { setSelectedLab(null); setTestSearch(""); }}
                className="p-2 rounded-xl hover:bg-slate-200 text-slate-500 transition shrink-0">
                <ArrowLeft size={18} />
              </button>
            )}
            <div>
              <h2 className="text-xl font-semibold text-slate-800">
                {selectedLab ? selectedLab.name : "Lab Tests"}
              </h2>
              <p className="text-sm text-slate-400 mt-0.5">
                {selectedLab
                  ? `${selectedLab.address} · ${selectedLab.distance}`
                  : "Search by test name or browse certified labs near you"}
              </p>
            </div>
          </div>
          <button onClick={() => setCartOpen(true)} className="relative p-2 shrink-0">
            <TestTube size={22} className="text-slate-600" />
            {testCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-bold">{testCount}</span>
            )}
          </button>
        </div>

        <AnimatePresence mode="wait">

          {/* ── LAB DETAIL ── */}
          {selectedLab ? (
            <motion.div key="lab-detail" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.22 }}>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-5">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-3xl shrink-0">{selectedLab.emoji}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-semibold text-slate-800">{selectedLab.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${selectedLab.open ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-500 border border-red-100"}`}>
                        {selectedLab.open ? "Open" : "Closed"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{selectedLab.address}</p>
                    <div className="flex items-center gap-3 mt-2 flex-wrap text-xs">
                      <span className="text-amber-600 font-semibold flex items-center gap-0.5"><Star size={10} className="fill-amber-400 text-amber-400" /> {selectedLab.rating} <span className="font-normal text-slate-400">({selectedLab.reviews})</span></span>
                      <span className="text-slate-500 flex items-center gap-1"><Clock size={10} /> Reports: {selectedLab.turnaround}</span>
                      {selectedLab.homeCollection && <span className="text-slate-500 flex items-center gap-1"><Home size={10} className="text-emerald-500" /> Home collection {selectedLab.collectionFee === 0 ? "(Free)" : `(₹${selectedLab.collectionFee})`}</span>}
                    </div>
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {selectedLab.tags.map(t => (
                        <span key={t} className="text-[11px] bg-slate-50 border border-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative mb-5">
                <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={testSearch} onChange={e => setTestSearch(e.target.value)} placeholder="Search tests in this lab..."
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition shadow-sm" />
              </div>

              <div className="space-y-3">
                {labTests.map((t, i) => {
                  const booked = isBooked(t.id);
                  return (
                    <motion.div key={t.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                      className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition">
                      <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-xl shrink-0">🧪</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-slate-800">{t.name}</p>
                          {t.popular && <span className="text-[10px] bg-amber-50 text-amber-600 border border-amber-100 px-1.5 py-0.5 rounded-full font-medium">Popular</span>}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                          <span className="flex items-center gap-1"><Clock size={10} /> {t.reportTime}</span>
                          {t.homeCollection && <span className="flex items-center gap-1"><Home size={10} className="text-emerald-500" /> Home collection</span>}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-base font-bold text-slate-900">₹{t.price}</p>
                        <p className="text-xs text-slate-400 line-through">₹{t.mrp}</p>
                        <p className="text-xs text-emerald-600 font-medium mb-1.5">{disc(t.price, t.mrp)}% off</p>
                        <button onClick={() => handleAddTest(t, selectedLab)} disabled={booked}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${booked ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-900 text-white hover:bg-slate-700"}`}>
                          {booked ? "✓ Booked" : "Book"}
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              {labTests.length === 0 && <EmptyState icon="🔍" msg="No tests found." />}
            </motion.div>

          ) : (
            <motion.div key="lab-list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>

              {/* Tab toggle */}
              <div className="flex bg-slate-100 rounded-2xl p-1 mb-4">
                <button onClick={() => setActiveTab("providers")}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === "providers" ? "bg-white shadow text-slate-800" : "text-slate-500"}`}>
                  🔬 Labs
                </button>
                <button onClick={() => setActiveTab("tests")}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === "tests" ? "bg-white shadow text-slate-800" : "text-slate-500"}`}>
                  🧪 Tests
                </button>
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                {activeTab === "providers" ? (
                  <input value={providerSearch} onChange={e => setProviderSearch(e.target.value)}
                    placeholder="Search lab name or area..."
                    className="w-full pl-11 pr-10 py-3.5 rounded-2xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition shadow-sm" />
                ) : (
                  <input value={testProductSearch} onChange={e => setTestProductSearch(e.target.value)}
                    placeholder="Search test name..."
                    className="w-full pl-11 pr-10 py-3.5 rounded-2xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition shadow-sm" />
                )}
                {(activeTab === "providers" ? providerSearch : testProductSearch) && (
                  <button onClick={() => activeTab === "providers" ? setProviderSearch("") : setTestProductSearch("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><X size={14} /></button>
                )}
              </div>

              {/* Sort/filter row — only for labs tab */}
              {activeTab === "providers" && (
                <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide">
                  {SORT_OPTIONS.map(s => (
                    <button key={s} onClick={() => setSortBy(s)}
                      className={`px-3 py-2 rounded-xl text-sm font-medium border whitespace-nowrap transition shrink-0 ${sortBy === s ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"}`}>
                      {s}
                    </button>
                  ))}
                  <button onClick={() => setShowHomeOnly(!showHomeOnly)}
                    className={`px-3 py-2 rounded-xl text-sm font-medium border whitespace-nowrap transition shrink-0 ${showHomeOnly ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-500 border-slate-200"}`}>
                    🏠 Home Collection
                  </button>
                </div>
              )}

              {/* ── TEST SEARCH RESULTS ── */}
              {activeTab === "tests" ? (
                <>
                  <p className="text-sm text-slate-500 mb-4">
                    {testProductSearch.trim() ? (
                      <><span className="font-semibold text-slate-700">{testResults.length}</span> result{testResults.length !== 1 ? "s" : ""} for "<span className="text-emerald-600 font-medium">{testProductSearch}</span>" across <span className="font-semibold text-slate-700">{new Set(testResults.map(r => r.labId)).size}</span> labs</>
                    ) : "Enter a test name to search across all labs"}
                  </p>
                  <div className="space-y-3">
                    {testResults.map((r, i) => {
                      const booked = isBooked(r.id);
                      return (
                        <motion.div key={`${r.id}-${r.labId}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                          className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition">
                          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-2xl shrink-0">🧪</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-semibold text-slate-800">{r.name}</p>
                              {r.popular && <span className="text-[10px] bg-amber-50 text-amber-600 border border-amber-100 px-1.5 py-0.5 rounded-full font-medium">Popular</span>}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                              {r.homeCollection && <span className="flex items-center gap-1"><Home size={10} className="text-emerald-500" /> Home collection</span>}
                              <span className="flex items-center gap-1"><Clock size={10} /> {r.reportTime}</span>
                            </div>
                            <button onClick={() => setSelectedLab(r.lab)} className="flex items-center gap-1 text-xs text-emerald-600 hover:underline mt-1">
                              {r.lab.emoji} {r.lab.name} · {r.lab.distance}
                            </button>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-base font-bold text-slate-900">₹{r.price}</p>
                            <p className="text-xs text-slate-400 line-through">₹{r.mrp}</p>
                            <p className="text-xs text-emerald-600 font-medium mb-1.5">{disc(r.price, r.mrp)}% off</p>
                            <button onClick={() => handleAddTest(r, r.lab)} disabled={booked}
                              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${booked ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-900 text-white hover:bg-slate-700"}`}>
                              {booked ? "✓ Booked" : "Book"}
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                    {testResults.length === 0 && testProductSearch.trim() && <EmptyState icon="🔍" msg={`No tests found for "${testProductSearch}"`} />}
                    {!testProductSearch.trim() && <EmptyState icon="🧪" msg="Enter a test name to search across all labs" />}
                  </div>
                </>
              ) : (
                /* ── LAB LIST ── */
                <>
                  <p className="text-sm text-slate-500 mb-4 flex items-center gap-1.5">
                    <MapPin size={13} className="text-emerald-500" /> {filteredLabs.length} certified labs near your location
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredLabs.map((l, i) => (
                      <motion.div key={l.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        onClick={() => setSelectedLab(l)}
                        className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-5 cursor-pointer hover:shadow-lg hover:border-blue-100 transition-all group ${!l.open ? "opacity-65" : ""}`}>
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-3xl shrink-0 group-hover:scale-105 transition-transform">{l.emoji}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="text-sm font-semibold text-slate-800">{l.name}</h3>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${l.open ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>
                                {l.open ? "Open" : "Closed"}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5 truncate">{l.address}</p>
                            <div className="flex items-center gap-3 mt-1.5 flex-wrap text-xs">
                              <span className="text-amber-600 font-semibold flex items-center gap-0.5"><Star size={10} className="fill-amber-400 text-amber-400" /> {l.rating} <span className="font-normal text-slate-400">({l.reviews})</span></span>
                              <span className="text-slate-500 flex items-center gap-1"><Clock size={10} /> Reports: {l.turnaround}</span>
                              <span className="text-slate-500">{l.distance}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-3.5 pt-3 border-t border-slate-50">
                          <div className="flex gap-1.5 flex-wrap">
                            {l.tags.map(tag => (
                              <span key={tag} className="text-[11px] bg-slate-50 text-slate-500 border border-slate-100 px-2 py-0.5 rounded-full">{tag}</span>
                            ))}
                          </div>
                          <span className="flex items-center gap-1 text-xs font-medium text-blue-600 group-hover:gap-2 transition-all shrink-0">
                            {l.homeCollection ? (l.collectionFee === 0 ? "Free home collection" : `Home collection ₹${l.collectionFee}`) : "Visit lab"}
                            <ChevronRight size={13} />
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  {filteredLabs.length === 0 && <EmptyState icon="🔬" msg="No labs found." />}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function EmptyState({ icon, msg }: { icon: string; msg: string }) {
  return (
    <div className="text-center py-16">
      <p className="text-4xl mb-2">{icon}</p>
      <p className="text-sm text-slate-400">{msg}</p>
    </div>
  );
}