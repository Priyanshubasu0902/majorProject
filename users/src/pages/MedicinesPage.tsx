// majorProject/users/src/pages/MedicinesPage.tsx
import { useState, useEffect, useCallback } from "react";
import { Search, MapPin, Clock, ChevronRight, ArrowLeft, Plus, ShoppingCart, X, Loader2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import TopBar from "../components/TopBar";
import CartDrawer from "../components/CartDrawer";
import { useCart, fetchNearbyPharmacies, apiFetch } from "../context/UserContext";
import type { NearbyPharmacy } from "../context/UserContext";

interface Medicine {
  _id: string; name: string; companyName: string; price: number;
  discount: number; type: string; no_of_Product: number;
  quantity: { amount: number; unit: string }; requiresPrescription?: boolean;
  prescription_required: boolean; image?: string; visibility: boolean;
}

interface EnrichedPharmacy extends NearbyPharmacy {
  emoji: string;
  distanceLabel: string;
  deliveryFee: number;
}

const SORT_OPTIONS = ["Nearest", "Free Delivery"];

function fmtDistance(m: number) {
  return m < 1000 ? `${m.toFixed(0)} m` : `${(m / 1000).toFixed(1)} km`;
}

// Simple deterministic emoji based on pharmacy name
function pharmacyEmoji(name: string) {
  const emojis = ["🏥", "⚕️", "💊", "🛡️", "🌿", "✨"];
  let hash = 0;
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) % emojis.length;
  return emojis[Math.abs(hash) % emojis.length];
}

const disc = (p: number, d: number) => Math.round(d);
const finalPrice = (price: number, discount: number) =>
  Math.round(price - (price * discount) / 100);

export default function MedicinesPage() {
  const { addMedicine, medicineCount, medicineItems } = useCart();
  const [cartOpen, setCartOpen] = useState(false);

  // Location
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState("");

  // Pharmacies
  const [pharmacies, setPharmacies] = useState<EnrichedPharmacy[]>([]);
  const [pharmaciesLoading, setPharmaciesLoading] = useState(false);

  // Selected pharmacy + its products
  const [selectedPharmacy, setSelectedPharmacy] = useState<EnrichedPharmacy | null>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [medicinesLoading, setMedicinesLoading] = useState(false);

  // UI state
  const [activeTab, setActiveTab] = useState<"providers" | "products">("providers");
  const [providerSearch, setProviderSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [medSearch, setMedSearch] = useState("");
  const [sortBy, setSortBy] = useState("Nearest");
  const [showOpenOnly] = useState(false);

  // ── Get device location ────────────────────────────────────────────────
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setLocationError("Location access denied. Showing all pharmacies is not available.")
    );
  }, []);

  // ── Fetch nearby pharmacies once we have coords ────────────────────────
  useEffect(() => {
    if (!coords) return;
    setPharmaciesLoading(true);
    fetchNearbyPharmacies(coords.lat, coords.lng, 10000)
      .then((raw) => {
        setPharmacies(
          raw.map((p) => ({
            ...p,
            emoji: pharmacyEmoji(p.name),
            distanceLabel: fmtDistance(p.distance),
            deliveryFee: 0, // set per-pharmacy if your model has it
          }))
        );
      })
      .catch(() => setLocationError("Failed to fetch nearby pharmacies."))
      .finally(() => setPharmaciesLoading(false));
  }, [coords]);

  // ── Fetch products when a pharmacy is selected ─────────────────────────
  const loadProducts = useCallback(async (pharmacyId: string) => {
    setMedicinesLoading(true);
    try {
      const data = await apiFetch(`/api/pharmacy/products/public/${pharmacyId}`);
      setMedicines(data.success ? data.products.filter((p: Medicine) => p.visibility) : []);
    } catch {
      setMedicines([]);
    } finally {
      setMedicinesLoading(false);
    }
  }, []);

  const handleSelectPharmacy = (p: EnrichedPharmacy) => {
    setSelectedPharmacy(p);
    setMedSearch("");
    loadProducts(p._id);
  };

  // ── Helpers ────────────────────────────────────────────────────────────
  const handleAddMedicine = (medicine: Medicine, pharmacy: EnrichedPharmacy) => {
    addMedicine(
      {
        id: medicine._id,
        name: medicine.name,
        brand: medicine.companyName,
        price: finalPrice(medicine.price, medicine.discount),
        mrp: medicine.price,
        qty: `${medicine.quantity.amount} ${medicine.quantity.unit}`,
        requiresPrescription: medicine.prescription_required,
      },
      {
        id: pharmacy._id,
        name: pharmacy.name,
        address: pharmacy.address,
        emoji: pharmacy.emoji,
        deliveryFee: pharmacy.deliveryFee,
        distance: pharmacy.distance,
      }
    );
  };

  const isInCart = (id: string) => medicineItems.some((i) => i.id === id);

  const filteredPharmacies = pharmacies
    .filter((p) =>
      p.name.toLowerCase().includes(providerSearch.toLowerCase()) ||
      p.address.toLowerCase().includes(providerSearch.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "Free Delivery") return a.deliveryFee - b.deliveryFee;
      return a.distance - b.distance; // Nearest
    });

  const filteredMedicines = medicines.filter(
    (m) =>
      m.name.toLowerCase().includes(medSearch.toLowerCase()) ||
      m.companyName.toLowerCase().includes(medSearch.toLowerCase())
  );

  // Cross-pharmacy product search (only what's loaded — encourages selecting a pharmacy)
  const productResults = medicines.filter(
    (m) =>
      productSearch.trim() &&
      (m.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        m.companyName.toLowerCase().includes(productSearch.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} defaultTab="medicines" />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          {selectedPharmacy ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setSelectedPharmacy(null); setMedSearch(""); }}
                className="p-2 rounded-xl hover:bg-slate-200 text-slate-500 transition"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <h2 className="text-lg font-semibold text-slate-800">{selectedPharmacy.name}</h2>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <MapPin size={10} /> {selectedPharmacy.address} · {selectedPharmacy.distanceLabel}
                </p>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-semibold text-slate-800">Medicines</h2>
              <p className="text-sm text-slate-400 mt-0.5">Browse nearby pharmacies</p>
            </div>
          )}
          <button onClick={() => setCartOpen(true)} className="relative p-2">
            <ShoppingCart size={22} className="text-slate-600" />
            {medicineCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {medicineCount}
              </span>
            )}
          </button>
        </div>

        {/* Location error */}
        {locationError && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs rounded-2xl px-4 py-3 mb-4">
            <AlertCircle size={14} className="shrink-0" />
            {locationError}
          </div>
        )}

        <AnimatePresence mode="wait">

          {/* ── PHARMACY DETAIL ── */}
          {selectedPharmacy ? (
            <motion.div key="detail" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.22 }}>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-5">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-3xl shrink-0">
                    {selectedPharmacy.emoji}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-slate-800">{selectedPharmacy.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{selectedPharmacy.address}</p>
                    <div className="flex items-center gap-3 mt-2 flex-wrap text-xs text-slate-500">
                      <span className="flex items-center gap-1"><MapPin size={10} /> {selectedPharmacy.distanceLabel}</span>
                      <span>{selectedPharmacy.deliveryFee === 0 ? "🟢 Free delivery" : `🚚 ₹${selectedPharmacy.deliveryFee} delivery`}</span>
                      {selectedPharmacy.delivery && <span className="text-emerald-600 font-medium">Delivery available</span>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative mb-5">
                <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={medSearch}
                  onChange={(e) => setMedSearch(e.target.value)}
                  placeholder="Search in this pharmacy..."
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition shadow-sm"
                />
              </div>

              {medicinesLoading ? (
                <div className="flex justify-center py-16">
                  <Loader2 size={28} className="animate-spin text-emerald-500" />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredMedicines.map((m, i) => {
                    const inCart = isInCart(m._id);
                    const price = finalPrice(m.price, m.discount);
                    return (
                      <motion.div
                        key={m._id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 hover:shadow-md transition"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-xl shrink-0">
                            {m.image ? (
                              <img src={m.image} alt={m.name} className="w-full h-full object-cover rounded-xl" />
                            ) : "💊"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 leading-snug">{m.name}</p>
                            <p className="text-xs text-slate-400">{m.companyName} · {m.quantity.amount} {m.quantity.unit}</p>
                            {m.prescription_required && (
                              <span className="text-[10px] bg-amber-50 text-amber-600 border border-amber-100 px-1.5 py-0.5 rounded-md font-medium">Rx required</span>
                            )}
                            {m.no_of_Product === 0 && (
                              <span className="text-[10px] bg-red-50 text-red-600 border border-red-100 px-1.5 py-0.5 rounded-md font-medium ml-1">Out of stock</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <div>
                            <span className="text-sm font-bold text-slate-900">₹{price}</span>
                            {m.discount > 0 && (
                              <>
                                <span className="text-xs text-slate-400 line-through ml-1">₹{m.price}</span>
                                <span className="text-xs text-emerald-600 font-medium ml-1">{disc(m.price, m.discount)}% off</span>
                              </>
                            )}
                          </div>
                          <button
                            onClick={() => handleAddMedicine(m, selectedPharmacy)}
                            disabled={inCart || m.no_of_Product === 0}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                              inCart
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : m.no_of_Product === 0
                                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                : "bg-slate-900 text-white hover:bg-slate-700"
                            }`}
                          >
                            {inCart ? "✓ Added" : m.no_of_Product === 0 ? "Unavailable" : <><Plus size={11} /> Add</>}
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                  {filteredMedicines.length === 0 && !medicinesLoading && (
                    <EmptyState icon="🔍" msg="No medicines found." />
                  )}
                </div>
              )}
            </motion.div>

          ) : (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>

              {/* Tab toggle */}
              <div className="flex bg-slate-100 rounded-2xl p-1 mb-4">
                <button
                  onClick={() => setActiveTab("providers")}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === "providers" ? "bg-white shadow text-slate-800" : "text-slate-500"}`}
                >
                  🏥 Pharmacies
                </button>
                <button
                  onClick={() => setActiveTab("products")}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === "products" ? "bg-white shadow text-slate-800" : "text-slate-500"}`}
                >
                  💊 Search Medicine
                </button>
              </div>

              <div className="relative mb-4">
                <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                {activeTab === "providers" ? (
                  <input
                    value={providerSearch}
                    onChange={(e) => setProviderSearch(e.target.value)}
                    placeholder="Search pharmacy name or area..."
                    className="w-full pl-11 pr-10 py-3.5 rounded-2xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition shadow-sm"
                  />
                ) : (
                  <input
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Select a pharmacy first to search medicines..."
                    className="w-full pl-11 pr-10 py-3.5 rounded-2xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition shadow-sm"
                  />
                )}
                {(activeTab === "providers" ? providerSearch : productSearch) && (
                  <button
                    onClick={() => activeTab === "providers" ? setProviderSearch("") : setProductSearch("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {activeTab === "providers" && (
                <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide">
                  {SORT_OPTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSortBy(s)}
                      className={`px-3 py-2 rounded-xl text-sm font-medium border whitespace-nowrap transition shrink-0 ${
                        sortBy === s ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {activeTab === "products" ? (
                <div className="py-12 text-center">
                  <p className="text-4xl mb-3">🏥</p>
                  <p className="text-slate-600 font-medium mb-1">Select a pharmacy first</p>
                  <p className="text-sm text-slate-400">Browse pharmacies nearby and tap one to see their medicines.</p>
                </div>
              ) : pharmaciesLoading ? (
                <div className="flex justify-center py-16">
                  <Loader2 size={28} className="animate-spin text-emerald-500" />
                </div>
              ) : (
                <>
                  <p className="text-sm text-slate-500 mb-4 flex items-center gap-1.5">
                    <MapPin size={13} className="text-emerald-500" />
                    {filteredPharmacies.length} pharmacies near your location
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredPharmacies.map((p, i) => (
                      <motion.div
                        key={p._id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => handleSelectPharmacy(p)}
                        className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 cursor-pointer hover:shadow-lg hover:border-emerald-100 transition-all group"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-3xl shrink-0 group-hover:scale-105 transition-transform">
                            {p.emoji}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-slate-800">{p.name}</h3>
                            <p className="text-xs text-slate-400 mt-0.5 truncate">{p.address}</p>
                            <div className="flex items-center gap-3 mt-1.5 flex-wrap text-xs">
                              <span className="text-slate-500 flex items-center gap-1">
                                <MapPin size={10} /> {p.distanceLabel}
                              </span>
                              {p.delivery && <span className="text-emerald-600 font-medium">Delivery</span>}
                              {p.pickup && <span className="text-slate-500">Pickup</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-3.5 pt-3 border-t border-slate-50">
                          <span className="text-xs text-slate-400">{p.email}</span>
                          <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 group-hover:gap-2 transition-all shrink-0">
                            View medicines <ChevronRight size={13} />
                          </span>
                        </div>
                      </motion.div>
                    ))}
                    {filteredPharmacies.length === 0 && !pharmaciesLoading && (
                      <EmptyState icon="🏥" msg={coords ? "No pharmacies found nearby." : "Waiting for location..."} />
                    )}
                  </div>
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
    <div className="col-span-full text-center py-16">
      <p className="text-4xl mb-2">{icon}</p>
      <p className="text-sm text-slate-400">{msg}</p>
    </div>
  );
}