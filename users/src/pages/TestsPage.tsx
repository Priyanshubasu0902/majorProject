// majorProject/users/src/pages/TestsPage.tsx
import { useState, useEffect, useCallback } from "react";
import { Search, MapPin, Clock, ChevronRight, ArrowLeft, Home, X, TestTube, Loader2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import TopBar from "../components/TopBar";
import CartDrawer from "../components/CartDrawer";
import { useCart, fetchNearbyLabs, apiFetch } from "../context/UserContext";
import type { NearbyLab } from "../context/UserContext";

interface LabService {
  _id: string; name: string; description: string; type: string;
  price: number; discount: number; visitLab: boolean; visibility: boolean;
  duration_of_test: { value: number; unit: string };
  duration_of_result: { value: number; unit: string };
  requirement: string; caution: string; image?: string;
}

interface EnrichedLab extends NearbyLab {
  emoji: string;
  distanceLabel: string;
  collectionFee: number;
}

const SORT_OPTIONS = ["Nearest", "Home Collection"];

function fmtDistance(m: number) {
  return m < 1000 ? `${m.toFixed(0)} m` : `${(m / 1000).toFixed(1)} km`;
}

function labEmoji(name: string) {
  const emojis = ["🔬", "🧬", "🩺", "🏛️", "⚕️", "🛡️"];
  let hash = 0;
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) % emojis.length;
  return emojis[Math.abs(hash) % emojis.length];
}

const finalPrice = (price: number, discount: number) =>
  Math.round(price - (price * discount) / 100);

export default function TestsPage() {
  const { addTest, testCount, testItems } = useCart();
  const [cartOpen, setCartOpen] = useState(false);

  // Location
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState("");

  // Labs
  const [labs, setLabs] = useState<EnrichedLab[]>([]);
  const [labsLoading, setLabsLoading] = useState(false);

  // Selected lab + its services
  const [selectedLab, setSelectedLab] = useState<EnrichedLab | null>(null);
  const [services, setServices] = useState<LabService[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);

  // UI state
  const [providerSearch, setProviderSearch] = useState("");
  const [serviceSearch, setServiceSearch] = useState("");
  const [sortBy, setSortBy] = useState("Nearest");
  const [showHomeOnly, setShowHomeOnly] = useState(false);

  // ── Get device location ────────────────────────────────────────────────
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setLocationError("Location access denied.")
    );
  }, []);

  // ── Fetch nearby labs once we have coords ──────────────────────────────
  useEffect(() => {
    if (!coords) return;
    setLabsLoading(true);
    fetchNearbyLabs(coords.lat, coords.lng, 10000)
      .then((raw) => {
        setLabs(
          raw.map((l) => ({
            ...l,
            emoji: labEmoji(l.name),
            distanceLabel: fmtDistance(l.distance),
            collectionFee: l.serviceType === "atLab" ? 0 : 50,
          }))
        );
      })
      .catch(() => setLocationError("Failed to fetch nearby labs."))
      .finally(() => setLabsLoading(false));
  }, [coords]);

  // ── Fetch services when a lab is selected ─────────────────────────────
  const loadServices = useCallback(async (labId: string) => {
    setServicesLoading(true);
    try {
      const data = await apiFetch(`/api/lab/tests/public/${labId}`);
      setServices(data.success ? data.tests.filter((t: LabService) => t.visibility) : []);
    } catch {
      setServices([]);
    } finally {
      setServicesLoading(false);
    }
  }, []);

  const handleSelectLab = (l: EnrichedLab) => {
    setSelectedLab(l);
    setServiceSearch("");
    loadServices(l._id);
  };

  // ── Helpers ────────────────────────────────────────────────────────────
  const handleAddTest = (service: LabService, lab: EnrichedLab) => {
    addTest(
      {
        id: service._id,
        name: service.name,
        price: finalPrice(service.price, service.discount),
        mrp: service.price,
        reportTime: `${service.duration_of_result.value} ${service.duration_of_result.unit}`,
        homeCollection: !service.visitLab,
      },
      {
        id: lab._id,
        name: lab.name,
        address: lab.address,
        emoji: lab.emoji,
        collectionFee: lab.collectionFee,
        distance: lab.distance,
      }
    );
  };

  const isBooked = (id: string) => testItems.some((i) => i.id === id);

  const filteredLabs = labs
    .filter((l) => {
      const q = providerSearch.toLowerCase();
      return l.name.toLowerCase().includes(q) || l.address.toLowerCase().includes(q);
    })
    .filter((l) => showHomeOnly ? l.serviceType !== "atLab" : true)
    .sort((a, b) => {
      if (sortBy === "Home Collection")
        return (a.serviceType === "atLab" ? 1 : 0) - (b.serviceType === "atLab" ? 1 : 0);
      return a.distance - b.distance;
    });

  const filteredServices = services.filter(
    (s) =>
      s.name.toLowerCase().includes(serviceSearch.toLowerCase()) ||
      s.type.toLowerCase().includes(serviceSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} defaultTab="tests" />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            {selectedLab && (
              <button
                onClick={() => { setSelectedLab(null); setServiceSearch(""); }}
                className="p-2 rounded-xl hover:bg-slate-200 text-slate-500 transition shrink-0"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div>
              <h2 className="text-xl font-semibold text-slate-800">
                {selectedLab ? selectedLab.name : "Lab Tests"}
              </h2>
              <p className="text-sm text-slate-400 mt-0.5">
                {selectedLab
                  ? `${selectedLab.address} · ${selectedLab.distanceLabel}`
                  : "Browse certified labs near you"}
              </p>
            </div>
          </div>
          <button onClick={() => setCartOpen(true)} className="relative p-2 shrink-0">
            <TestTube size={22} className="text-slate-600" />
            {testCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {testCount}
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

          {/* ── LAB DETAIL ── */}
          {selectedLab ? (
            <motion.div key="lab-detail" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.22 }}>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-5">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-3xl shrink-0">
                    {selectedLab.emoji}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-slate-800">{selectedLab.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{selectedLab.address}</p>
                    <div className="flex items-center gap-3 mt-2 flex-wrap text-xs text-slate-500">
                      <span className="flex items-center gap-1"><MapPin size={10} /> {selectedLab.distanceLabel}</span>
                      {selectedLab.serviceType !== "atLab" && (
                        <span className="text-emerald-600 font-medium flex items-center gap-1">
                          <Home size={10} />
                          Home collection {selectedLab.collectionFee === 0 ? "(Free)" : `(₹${selectedLab.collectionFee})`}
                        </span>
                      )}
                      <span className="capitalize">{selectedLab.serviceType === "both" ? "Home + Lab visit" : selectedLab.serviceType}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative mb-5">
                <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={serviceSearch}
                  onChange={(e) => setServiceSearch(e.target.value)}
                  placeholder="Search tests in this lab..."
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition shadow-sm"
                />
              </div>

              {servicesLoading ? (
                <div className="flex justify-center py-16">
                  <Loader2 size={28} className="animate-spin text-blue-500" />
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredServices.map((s, i) => {
                    const booked = isBooked(s._id);
                    const price = finalPrice(s.price, s.discount);
                    return (
                      <motion.div
                        key={s._id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition"
                      >
                        <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-xl shrink-0">
                          {s.image ? (
                            <img src={s.image} alt={s.name} className="w-full h-full object-cover rounded-xl" />
                          ) : "🧪"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800">{s.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{s.type}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Clock size={10} /> Results: {s.duration_of_result.value} {s.duration_of_result.unit}
                            </span>
                            {!s.visitLab && (
                              <span className="flex items-center gap-1">
                                <Home size={10} className="text-emerald-500" /> Home collection
                              </span>
                            )}
                          </div>
                          {s.requirement && (
                            <p className="text-[10px] text-amber-600 mt-0.5">{s.requirement}</p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-base font-bold text-slate-900">₹{price}</p>
                          {s.discount > 0 && (
                            <>
                              <p className="text-xs text-slate-400 line-through">₹{s.price}</p>
                              <p className="text-xs text-emerald-600 font-medium mb-1.5">{s.discount}% off</p>
                            </>
                          )}
                          <button
                            onClick={() => handleAddTest(s, selectedLab)}
                            disabled={booked}
                            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                              booked
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-slate-900 text-white hover:bg-slate-700"
                            }`}
                          >
                            {booked ? "✓ Booked" : "Book"}
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                  {filteredServices.length === 0 && (
                    <EmptyState icon="🔍" msg="No tests found." />
                  )}
                </div>
              )}
            </motion.div>

          ) : (
            <motion.div key="lab-list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>

              <div className="relative mb-4">
                <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={providerSearch}
                  onChange={(e) => setProviderSearch(e.target.value)}
                  placeholder="Search lab name or area..."
                  className="w-full pl-11 pr-10 py-3.5 rounded-2xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition shadow-sm"
                />
                {providerSearch && (
                  <button onClick={() => setProviderSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X size={14} />
                  </button>
                )}
              </div>

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
                <button
                  onClick={() => setShowHomeOnly(!showHomeOnly)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium border whitespace-nowrap transition shrink-0 ${
                    showHomeOnly ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-500 border-slate-200"
                  }`}
                >
                  🏠 Home Collection
                </button>
              </div>

              {labsLoading ? (
                <div className="flex justify-center py-16">
                  <Loader2 size={28} className="animate-spin text-blue-500" />
                </div>
              ) : (
                <>
                  <p className="text-sm text-slate-500 mb-4 flex items-center gap-1.5">
                    <MapPin size={13} className="text-emerald-500" />
                    {filteredLabs.length} certified labs near your location
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredLabs.map((l, i) => (
                      <motion.div
                        key={l._id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => handleSelectLab(l)}
                        className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 cursor-pointer hover:shadow-lg hover:border-blue-100 transition-all group"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-3xl shrink-0 group-hover:scale-105 transition-transform">
                            {l.emoji}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-slate-800">{l.name}</h3>
                            <p className="text-xs text-slate-400 mt-0.5 truncate">{l.address}</p>
                            <div className="flex items-center gap-3 mt-1.5 flex-wrap text-xs">
                              <span className="text-slate-500 flex items-center gap-1">
                                <MapPin size={10} /> {l.distanceLabel}
                              </span>
                              {l.serviceType !== "atLab" && (
                                <span className="text-emerald-600 font-medium flex items-center gap-1">
                                  <Home size={10} /> Home collection
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-3.5 pt-3 border-t border-slate-50">
                          <span className="text-xs text-slate-400 capitalize">
                            {l.serviceType === "both"
                              ? "Home + Lab visit"
                              : l.serviceType === "atHome"
                              ? "Home collection only"
                              : "Lab visit only"}
                          </span>
                          <span className="flex items-center gap-1 text-xs font-medium text-blue-600 group-hover:gap-2 transition-all shrink-0">
                            View tests <ChevronRight size={13} />
                          </span>
                        </div>
                      </motion.div>
                    ))}
                    {filteredLabs.length === 0 && (
                      <EmptyState icon="🔬" msg={coords ? "No labs found nearby." : "Waiting for location..."} />
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