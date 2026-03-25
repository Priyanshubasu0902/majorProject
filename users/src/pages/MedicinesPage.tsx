import { useState } from "react";
import { Search, MapPin, Clock, ChevronRight, ArrowLeft, Plus, ShoppingCart, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import TopBar from "../components/TopBar";
import CartDrawer from "../components/CartDrawer";
import { useCart } from "../context/UserContext";

interface Pharmacy {
  id: string; name: string; address: string; distance: string;
  rating: number; reviews: number; deliveryTime: string;
  deliveryFee: number; open: boolean; tags: string[]; emoji: string;
}
interface Medicine {
  id: string; name: string; brand: string; price: number; mrp: number;
  category: string; qty: string; requiresPrescription: boolean;
}

const PHARMACIES: Pharmacy[] = [
  { id: "p1", name: "MedPlus Pharmacy", address: "12, Park Street, Kolkata", distance: "0.4 km", rating: 4.8, reviews: 342, deliveryTime: "20 min", deliveryFee: 0, open: true, tags: ["24/7", "Free Delivery"], emoji: "🏥" },
  { id: "p2", name: "Apollo Pharmacy", address: "45, Salt Lake Sector V", distance: "1.2 km", rating: 4.7, reviews: 218, deliveryTime: "30 min", deliveryFee: 20, open: true, tags: ["Trusted Chain", "Wide Range"], emoji: "⚕️" },
  { id: "p3", name: "Netmeds Store", address: "7, Elgin Road, Kolkata", distance: "1.8 km", rating: 4.6, reviews: 189, deliveryTime: "45 min", deliveryFee: 0, open: true, tags: ["Free Delivery", "Generics"], emoji: "💊" },
  { id: "p4", name: "Guardian Pharmacy", address: "88, Camac Street, Kolkata", distance: "2.1 km", rating: 4.5, reviews: 143, deliveryTime: "35 min", deliveryFee: 15, open: false, tags: ["Certified"], emoji: "🛡️" },
  { id: "p5", name: "Frank Ross Pharmacy", address: "3, Lindsay Street, Kolkata", distance: "2.6 km", rating: 4.9, reviews: 401, deliveryTime: "25 min", deliveryFee: 0, open: true, tags: ["24/7", "Free Delivery", "Premium"], emoji: "🌿" },
  { id: "p6", name: "Wellness Forever", address: "21, New Town Action Area I", distance: "3.0 km", rating: 4.6, reviews: 167, deliveryTime: "50 min", deliveryFee: 25, open: true, tags: ["Wellness", "Vitamins"], emoji: "✨" },
];

const PHARMACY_MEDICINES: Record<string, Medicine[]> = {
  p1: [
    { id: "m1", name: "Paracetamol 500mg", brand: "Crocin", price: 28, mrp: 35, category: "Fever & Pain", qty: "Strip of 15", requiresPrescription: false },
    { id: "m2", name: "Azithromycin 500mg", brand: "Azee", price: 85, mrp: 120, category: "Antibiotics", qty: "Strip of 3", requiresPrescription: true },
    { id: "m3", name: "Vitamin D3 60K", brand: "D-Rise", price: 85, mrp: 120, category: "Vitamins", qty: "Strip of 4", requiresPrescription: false },
    { id: "m4", name: "Cetirizine 10mg", brand: "Alerid", price: 22, mrp: 30, category: "Allergy", qty: "Strip of 10", requiresPrescription: false },
    { id: "m5", name: "Metformin 500mg", brand: "Glycomet", price: 42, mrp: 55, category: "Diabetes", qty: "Strip of 10", requiresPrescription: true },
    { id: "m6", name: "Omeprazole 20mg", brand: "Omez", price: 55, mrp: 70, category: "Digestion", qty: "Strip of 15", requiresPrescription: false },
  ],
  p2: [
    { id: "m1", name: "Paracetamol 500mg", brand: "Dolo", price: 30, mrp: 35, category: "Fever & Pain", qty: "Strip of 15", requiresPrescription: false },
    { id: "m7", name: "Atorvastatin 10mg", brand: "Lipitor", price: 95, mrp: 130, category: "Heart", qty: "Strip of 10", requiresPrescription: true },
    { id: "m8", name: "Vitamin C 500mg", brand: "Limcee", price: 38, mrp: 50, category: "Vitamins", qty: "Strip of 15", requiresPrescription: false },
    { id: "m9", name: "Clindamycin Gel", brand: "Clindac A", price: 145, mrp: 180, category: "Skin Care", qty: "30g tube", requiresPrescription: false },
    { id: "m5", name: "Metformin 500mg", brand: "Glycomet", price: 45, mrp: 55, category: "Diabetes", qty: "Strip of 10", requiresPrescription: true },
  ],
  p3: [
    { id: "m3", name: "Vitamin D3 60K", brand: "D-Rise", price: 80, mrp: 120, category: "Vitamins", qty: "Strip of 4", requiresPrescription: false },
    { id: "m10", name: "Pantoprazole 40mg", brand: "Pan-D", price: 65, mrp: 90, category: "Digestion", qty: "Strip of 15", requiresPrescription: false },
    { id: "m4", name: "Cetirizine 10mg", brand: "Alerid", price: 20, mrp: 30, category: "Allergy", qty: "Strip of 10", requiresPrescription: false },
    { id: "m11", name: "Amlodipine 5mg", brand: "Amlokind", price: 55, mrp: 75, category: "Heart", qty: "Strip of 10", requiresPrescription: true },
  ],
  p4: [
    { id: "m7", name: "Atorvastatin 10mg", brand: "Lipitor", price: 90, mrp: 130, category: "Heart", qty: "Strip of 10", requiresPrescription: true },
    { id: "m12", name: "Levocetirizine 5mg", brand: "Levocet", price: 35, mrp: 50, category: "Allergy", qty: "Strip of 10", requiresPrescription: false },
    { id: "m8", name: "Vitamin C 500mg", brand: "Limcee", price: 36, mrp: 50, category: "Vitamins", qty: "Strip of 15", requiresPrescription: false },
  ],
  p5: [
    { id: "m1", name: "Paracetamol 500mg", brand: "Crocin", price: 26, mrp: 35, category: "Fever & Pain", qty: "Strip of 15", requiresPrescription: false },
    { id: "m2", name: "Azithromycin 500mg", brand: "Azee", price: 80, mrp: 120, category: "Antibiotics", qty: "Strip of 3", requiresPrescription: true },
    { id: "m9", name: "Clindamycin Gel", brand: "Clindac A", price: 138, mrp: 180, category: "Skin Care", qty: "30g tube", requiresPrescription: false },
    { id: "m3", name: "Vitamin D3 60K", brand: "D-Rise", price: 82, mrp: 120, category: "Vitamins", qty: "Strip of 4", requiresPrescription: false },
  ],
  p6: [
    { id: "m8", name: "Vitamin C 500mg", brand: "Limcee", price: 40, mrp: 50, category: "Vitamins", qty: "Strip of 15", requiresPrescription: false },
    { id: "m3", name: "Vitamin D3 60K", brand: "D-Rise", price: 88, mrp: 120, category: "Vitamins", qty: "Strip of 4", requiresPrescription: false },
    { id: "m14", name: "Omega-3 Fish Oil", brand: "Inlife", price: 320, mrp: 450, category: "Vitamins", qty: "60 capsules", requiresPrescription: false },
    { id: "m4", name: "Cetirizine 10mg", brand: "Alerid", price: 22, mrp: 30, category: "Allergy", qty: "Strip of 10", requiresPrescription: false },
  ],
};

const ALL_MEDICINES_FLAT = Object.entries(PHARMACY_MEDICINES).flatMap(([pharmId, meds]) =>
  meds.map(m => ({ ...m, pharmacyId: pharmId, pharmacy: PHARMACIES.find(p => p.id === pharmId)! }))
);

const SORT_OPTIONS = ["Nearest", "Rating", "Fastest", "Free Delivery"];

export default function MedicinesPage() {
  const { addMedicine, medicineCount, medicineItems } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [providerSearch, setProviderSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"providers" | "products">("providers");
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [sortBy, setSortBy] = useState("Nearest");
  const [showOpenOnly, setShowOpenOnly] = useState(false);
  const [medSearch, setMedSearch] = useState("");

  const filteredPharmacies = PHARMACIES.filter(p =>
    p.name.toLowerCase().includes(providerSearch.toLowerCase()) ||
    p.address.toLowerCase().includes(providerSearch.toLowerCase())
  ).filter(p => showOpenOnly ? p.open : true)
  .sort((a, b) => {
    if (sortBy === "Rating") return b.rating - a.rating;
    if (sortBy === "Fastest") return parseInt(a.deliveryTime) - parseInt(b.deliveryTime);
    if (sortBy === "Free Delivery") return a.deliveryFee - b.deliveryFee;
    return parseFloat(a.distance) - parseFloat(b.distance);
  });

  const productResults = ALL_MEDICINES_FLAT.filter(m =>
    m.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    m.brand.toLowerCase().includes(productSearch.toLowerCase())
  );

  const pharmacyMeds = selectedPharmacy
    ? (PHARMACY_MEDICINES[selectedPharmacy.id] || []).filter(m =>
        m.name.toLowerCase().includes(medSearch.toLowerCase()) ||
        m.brand.toLowerCase().includes(medSearch.toLowerCase())
      )
    : [];

  const handleAddMedicine = (medicine: Medicine, pharmacy: Pharmacy) => {
    addMedicine(
      { id: medicine.id, name: medicine.name, brand: medicine.brand, price: medicine.price, mrp: medicine.mrp, qty: medicine.qty, requiresPrescription: medicine.requiresPrescription },
      { id: pharmacy.id, name: pharmacy.name, address: pharmacy.address, emoji: pharmacy.emoji, deliveryFee: pharmacy.deliveryFee, deliveryTime: pharmacy.deliveryTime }
    );
  };

  const isInCart = (mid: string) => medicineItems.some(i => i.id === mid);
  const disc = (p: number, m: number) => Math.round(((m - p) / m) * 100);

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} defaultTab="medicines" />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          {selectedPharmacy ? (
            <div className="flex items-center gap-3">
              <button onClick={() => { setSelectedPharmacy(null); setMedSearch(""); }}
                className="p-2 rounded-xl hover:bg-slate-200 text-slate-500 transition">
                <ArrowLeft size={18} />
              </button>
              <div>
                <h2 className="text-lg font-semibold text-slate-800">{selectedPharmacy.name}</h2>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <MapPin size={10} /> {selectedPharmacy.address} · {selectedPharmacy.distance}
                </p>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-semibold text-slate-800">Medicines</h2>
              <p className="text-sm text-slate-400 mt-0.5">Search by medicine name or browse nearby pharmacies</p>
            </div>
          )}
          <button onClick={() => setCartOpen(true)} className="relative p-2">
            <ShoppingCart size={22} className="text-slate-600" />
            {medicineCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 text-white text-xs rounded-full flex items-center justify-center font-bold">{medicineCount}</span>
            )}
          </button>
        </div>

        <AnimatePresence mode="wait">

          {/* ── PHARMACY DETAIL ── */}
          {selectedPharmacy ? (
            <motion.div key="detail" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.22 }}>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-5">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-3xl shrink-0">{selectedPharmacy.emoji}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-semibold text-slate-800">{selectedPharmacy.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${selectedPharmacy.open ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-500 border border-red-100"}`}>
                        {selectedPharmacy.open ? "Open" : "Closed"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{selectedPharmacy.address}</p>
                    <div className="flex items-center gap-3 mt-2 flex-wrap text-xs text-slate-500">
                      <span className="text-amber-600 font-semibold">⭐ {selectedPharmacy.rating} <span className="font-normal text-slate-400">({selectedPharmacy.reviews})</span></span>
                      <span className="flex items-center gap-1"><Clock size={11} /> {selectedPharmacy.deliveryTime}</span>
                      <span>{selectedPharmacy.deliveryFee === 0 ? "🟢 Free delivery" : `🚚 ₹${selectedPharmacy.deliveryFee} delivery`}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative mb-5">
                <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={medSearch} onChange={e => setMedSearch(e.target.value)} placeholder="Search in this pharmacy..."
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition shadow-sm" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {pharmacyMeds.map((m, i) => {
                  const inCart = isInCart(m.id);
                  return (
                    <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                      className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 hover:shadow-md transition">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-xl shrink-0">💊</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 leading-snug">{m.name}</p>
                          <p className="text-xs text-slate-400">{m.brand} · {m.qty}</p>
                          {m.requiresPrescription && <span className="text-[10px] bg-amber-50 text-amber-600 border border-amber-100 px-1.5 py-0.5 rounded-md font-medium">Rx required</span>}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div>
                          <span className="text-sm font-bold text-slate-900">₹{m.price}</span>
                          <span className="text-xs text-slate-400 line-through ml-1">₹{m.mrp}</span>
                          <span className="text-xs text-emerald-600 font-medium ml-1">{disc(m.price, m.mrp)}% off</span>
                        </div>
                        <button onClick={() => handleAddMedicine(m, selectedPharmacy)} disabled={inCart}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition ${inCart ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-900 text-white hover:bg-slate-700"}`}>
                          {inCart ? "✓ Added" : <><Plus size={11} /> Add</>}
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              {pharmacyMeds.length === 0 && <EmptyState icon="🔍" msg="No medicines found." />}
            </motion.div>

          ) : (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>

              {/* Tab toggle */}
              <div className="flex bg-slate-100 rounded-2xl p-1 mb-4">
                <button onClick={() => setActiveTab("providers")}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === "providers" ? "bg-white shadow text-slate-800" : "text-slate-500"}`}>
                  🏥 Pharmacies
                </button>
                <button onClick={() => setActiveTab("products")}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === "products" ? "bg-white shadow text-slate-800" : "text-slate-500"}`}>
                  💊 Medicines
                </button>
              </div>

              {/* Search bar */}
              <div className="relative mb-4">
                <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                {activeTab === "providers" ? (
                  <input value={providerSearch} onChange={e => setProviderSearch(e.target.value)}
                    placeholder="Search pharmacy name or area..."
                    className="w-full pl-11 pr-10 py-3.5 rounded-2xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition shadow-sm" />
                ) : (
                  <input value={productSearch} onChange={e => setProductSearch(e.target.value)}
                    placeholder="Search medicine name or brand..."
                    className="w-full pl-11 pr-10 py-3.5 rounded-2xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition shadow-sm" />
                )}
                {(activeTab === "providers" ? providerSearch : productSearch) && (
                  <button onClick={() => activeTab === "providers" ? setProviderSearch("") : setProductSearch("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><X size={14} /></button>
                )}
              </div>

              {/* Sort/filter row — only for providers tab */}
              {activeTab === "providers" && (
                <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide">
                  {SORT_OPTIONS.map(s => (
                    <button key={s} onClick={() => setSortBy(s)}
                      className={`px-3 py-2 rounded-xl text-sm font-medium border whitespace-nowrap transition shrink-0 ${sortBy === s ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"}`}>
                      {s}
                    </button>
                  ))}
                  <button onClick={() => setShowOpenOnly(!showOpenOnly)}
                    className={`px-3 py-2 rounded-xl text-sm font-medium border whitespace-nowrap transition shrink-0 ${showOpenOnly ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-500 border-slate-200"}`}>
                    🟢 Open Now
                  </button>
                </div>
              )}

              {/* ── PRODUCT SEARCH RESULTS ── */}
              {activeTab === "products" ? (
                <>
                  <p className="text-sm text-slate-500 mb-4">
                    {productSearch.trim() ? (
                      <><span className="font-semibold text-slate-700">{productResults.length}</span> result{productResults.length !== 1 ? "s" : ""} for "<span className="text-emerald-600 font-medium">{productSearch}</span>" across <span className="font-semibold text-slate-700">{new Set(productResults.map(r => r.pharmacyId)).size}</span> pharmacies</>
                    ) : "Enter a medicine name to search across all pharmacies"}
                  </p>
                  <div className="space-y-3">
                    {productResults.map((r, i) => {
                      const inCart = isInCart(r.id);
                      return (
                        <motion.div key={`${r.id}-${r.pharmacyId}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                          className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition">
                          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-2xl shrink-0">💊</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800">{r.name}</p>
                            <p className="text-xs text-slate-400">{r.brand} · {r.qty}</p>
                            {r.requiresPrescription && <span className="text-[10px] bg-amber-50 text-amber-600 border border-amber-100 px-1.5 py-0.5 rounded-md font-medium">Rx required</span>}
                            <button onClick={() => setSelectedPharmacy(r.pharmacy)}
                              className="flex items-center gap-1 text-xs text-emerald-600 hover:underline mt-1">
                              {r.pharmacy.emoji} {r.pharmacy.name} · {r.pharmacy.distance} · {r.pharmacy.deliveryTime}
                            </button>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-base font-bold text-slate-900">₹{r.price}</p>
                            <p className="text-xs text-slate-400 line-through">₹{r.mrp}</p>
                            <p className="text-xs text-emerald-600 font-medium mb-2">{disc(r.price, r.mrp)}% off</p>
                            <button onClick={() => handleAddMedicine(r, r.pharmacy)} disabled={inCart}
                              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${inCart ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-900 text-white hover:bg-slate-700"}`}>
                              {inCart ? "✓ Added" : "+ Add"}
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                    {productResults.length === 0 && productSearch.trim() && <EmptyState icon="💊" msg={`No medicines found for "${productSearch}"`} />}
                    {!productSearch.trim() && <EmptyState icon="💊" msg="Enter a medicine name to search across all pharmacies" />}
                  </div>
                </>
              ) : (
                /* ── PHARMACY LIST ── */
                <>
                  <p className="text-sm text-slate-500 mb-4 flex items-center gap-1.5">
                    <MapPin size={13} className="text-emerald-500" /> {filteredPharmacies.length} pharmacies near your location
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredPharmacies.map((p, i) => (
                      <motion.div key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        onClick={() => setSelectedPharmacy(p)}
                        className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-5 cursor-pointer hover:shadow-lg hover:border-emerald-100 transition-all group ${!p.open ? "opacity-65" : ""}`}>
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-3xl shrink-0 group-hover:scale-105 transition-transform">{p.emoji}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="text-sm font-semibold text-slate-800">{p.name}</h3>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${p.open ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>
                                {p.open ? "Open" : "Closed"}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5 truncate">{p.address}</p>
                            <div className="flex items-center gap-3 mt-1.5 flex-wrap text-xs">
                              <span className="text-amber-600 font-semibold">⭐ {p.rating} <span className="font-normal text-slate-400">({p.reviews})</span></span>
                              <span className="text-slate-500 flex items-center gap-1"><Clock size={10} /> {p.deliveryTime}</span>
                              <span className="text-slate-500">{p.distance}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-3.5 pt-3 border-t border-slate-50">
                          <div className="flex gap-1.5 flex-wrap">
                            {p.tags.map(tag => (
                              <span key={tag} className="text-[11px] bg-slate-50 text-slate-500 border border-slate-100 px-2 py-0.5 rounded-full">{tag}</span>
                            ))}
                          </div>
                          <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 group-hover:gap-2 transition-all shrink-0">
                            {p.deliveryFee === 0 ? "Free delivery" : `₹${p.deliveryFee} delivery`}
                            <ChevronRight size={13} />
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  {filteredPharmacies.length === 0 && <EmptyState icon="🏥" msg="No pharmacies found." />}
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