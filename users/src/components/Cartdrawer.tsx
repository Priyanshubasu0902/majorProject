import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Trash2, ShoppingCart, TestTube, MapPin, Clock, ChevronRight, AlertTriangle, Loader2 } from "lucide-react";
import { useState } from "react";
import { useCart } from "../context/UserContext";

type CartTab = "medicines" | "tests";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  defaultTab?: CartTab;
}

export default function CartDrawer({ open, onClose, defaultTab = "medicines" }: CartDrawerProps) {
  const {
    medicineProvider, medicineItems, removeMedicine, updateMedicineQty,
    clearMedicineCart, medicineTotal, medicineCount,
    testProvider, testItems, removeTest, updateTestQty,
    clearTestCart, testTotal, testCount,
    conflictInfo, resolveConflict,
  } = useCart();

  const [tab, setTab] = useState<CartTab>(defaultTab);
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState<CartTab | null>(null);

  const handlePlaceOrder = async (type: CartTab) => {
    setPlacing(true);
    await new Promise(r => setTimeout(r, 1500));
    setPlacing(false);
    setPlaced(type);
    if (type === "medicines") clearMedicineCart();
    else clearTestCart();
    setTimeout(() => setPlaced(null), 3000);
  };

  const disc = (p: number, m: number) => Math.round(((m - p) / m) * 100);

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
          />
        )}
      </AnimatePresence>

      {/* Conflict dialog */}
      <AnimatePresence>
        {conflictInfo && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-[70]" />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.22 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[80] w-[90%] max-w-sm bg-white rounded-3xl shadow-2xl p-6"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                  <AlertTriangle size={18} className="text-amber-500" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-800">Replace cart?</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Your cart already has {conflictInfo.type === "medicine" ? "medicines" : "tests"} from another {conflictInfo.type === "medicine" ? "pharmacy" : "lab"}.
                    Adding from <span className="font-medium text-slate-700">{conflictInfo.newProvider.name}</span> will clear the existing cart.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => resolveConflict(false)}
                  className="flex-1 py-3 rounded-2xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">
                  Keep existing
                </button>
                <button onClick={() => resolveConflict(true)}
                  className="flex-1 py-3 rounded-2xl bg-rose-500 text-white text-sm font-medium hover:bg-rose-600 transition">
                  Replace cart
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white shadow-2xl z-60 flex flex-col"
            style={{ zIndex: 60 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-800">Your Cart</h2>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition">
                <X size={18} />
              </button>
            </div>

            {/* Tab toggle */}
            <div className="px-5 pt-4">
              <div className="flex bg-slate-100 rounded-2xl p-1">
                <button onClick={() => setTab("medicines")}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${tab === "medicines" ? "bg-white shadow text-slate-800" : "text-slate-500"}`}>
                  <ShoppingCart size={14} />
                  Medicines
                  {medicineCount > 0 && (
                    <span className="bg-emerald-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">{medicineCount}</span>
                  )}
                </button>
                <button onClick={() => setTab("tests")}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${tab === "tests" ? "bg-white shadow text-slate-800" : "text-slate-500"}`}>
                  <TestTube size={14} />
                  Tests
                  {testCount > 0 && (
                    <span className="bg-blue-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">{testCount}</span>
                  )}
                </button>
              </div>
            </div>

            {/* Cart content */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <AnimatePresence mode="wait">

                {/* ── MEDICINE CART ── */}
                {tab === "medicines" && (
                  <motion.div key="med-cart" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.18 }}>

                    {placed === "medicines" ? (
                      <OrderPlaced type="medicine" />
                    ) : medicineItems.length === 0 ? (
                      <EmptyCart icon="💊" label="No medicines in cart" sub="Browse pharmacies to add medicines" />
                    ) : (
                      <>
                        {/* Provider info */}
                        {medicineProvider && (
                          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3.5 mb-4 flex items-center gap-3">
                            <span className="text-2xl">{medicineProvider.emoji}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-emerald-800">{medicineProvider.name}</p>
                              <p className="text-xs text-emerald-600 flex items-center gap-1 mt-0.5">
                                <MapPin size={10} /> {medicineProvider.address}
                              </p>
                              {medicineProvider.deliveryFee !== undefined && (
                                <p className="text-xs text-emerald-600 flex items-center gap-1">
                                  <Clock size={10} /> {medicineProvider.deliveryTime} · {medicineProvider.deliveryFee === 0 ? "Free delivery" : `₹${medicineProvider.deliveryFee} delivery`}
                                </p>
                              )}
                            </div>
                            <button onClick={clearMedicineCart} className="text-rose-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}

                        {/* Items */}
                        <div className="space-y-3 mb-4">
                          {medicineItems.map(item => (
                            <motion.div key={item.id} layout
                              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
                              className="bg-slate-50 rounded-2xl border border-slate-100 p-3.5 flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-lg shrink-0">💊</div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-800 truncate">{item.name}</p>
                                <p className="text-xs text-slate-400">{item.brand} · {item.qty}</p>
                                {item.requiresPrescription && (
                                  <span className="text-[10px] bg-amber-50 text-amber-600 border border-amber-100 px-1.5 py-0.5 rounded-md font-medium">Rx</span>
                                )}
                                <div className="flex items-center gap-1.5 mt-1.5">
                                  <span className="text-sm font-bold text-slate-900">₹{item.price}</span>
                                  <span className="text-xs text-slate-400 line-through">₹{item.mrp}</span>
                                  <span className="text-xs text-emerald-600 font-medium">{disc(item.price, item.mrp)}% off</span>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-2 shrink-0">
                                <button onClick={() => removeMedicine(item.id)} className="text-slate-300 hover:text-rose-400 transition">
                                  <X size={13} />
                                </button>
                                <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-1.5 py-1">
                                  <button onClick={() => updateMedicineQty(item.id, item.quantity - 1)}
                                    className="w-5 h-5 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition">
                                    <Minus size={10} />
                                  </button>
                                  <span className="text-sm font-semibold text-slate-800 w-5 text-center">{item.quantity}</span>
                                  <button onClick={() => updateMedicineQty(item.id, item.quantity + 1)}
                                    className="w-5 h-5 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition">
                                    <Plus size={10} />
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>

                        {/* Bill summary */}
                        <BillSummary
                          subtotal={medicineTotal}
                          deliveryFee={medicineProvider?.deliveryFee ?? 0}
                          type="medicine"
                        />
                      </>
                    )}
                  </motion.div>
                )}

                {/* ── TEST CART ── */}
                {tab === "tests" && (
                  <motion.div key="test-cart" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.18 }}>

                    {placed === "tests" ? (
                      <OrderPlaced type="test" />
                    ) : testItems.length === 0 ? (
                      <EmptyCart icon="🧪" label="No tests in cart" sub="Browse labs to add tests" />
                    ) : (
                      <>
                        {testProvider && (
                          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-3.5 mb-4 flex items-center gap-3">
                            <span className="text-2xl">{testProvider.emoji}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-blue-800">{testProvider.name}</p>
                              <p className="text-xs text-blue-600 flex items-center gap-1 mt-0.5">
                                <MapPin size={10} /> {testProvider.address}
                              </p>
                              {testProvider.collectionFee !== undefined && (
                                <p className="text-xs text-blue-600">
                                  {testProvider.collectionFee === 0 ? "🏠 Free home collection" : `🏠 Home collection ₹${testProvider.collectionFee}`}
                                </p>
                              )}
                            </div>
                            <button onClick={clearTestCart} className="text-rose-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}

                        <div className="space-y-3 mb-4">
                          {testItems.map(item => (
                            <motion.div key={item.id} layout
                              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
                              className="bg-slate-50 rounded-2xl border border-slate-100 p-3.5 flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-lg shrink-0">🧪</div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-800 truncate">{item.name}</p>
                                <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                                  <span className="flex items-center gap-1"><Clock size={9} /> {item.reportTime}</span>
                                  {item.homeCollection && <span>🏠 Home</span>}
                                </div>
                                <div className="flex items-center gap-1.5 mt-1.5">
                                  <span className="text-sm font-bold text-slate-900">₹{item.price}</span>
                                  <span className="text-xs text-slate-400 line-through">₹{item.mrp}</span>
                                  <span className="text-xs text-emerald-600 font-medium">{disc(item.price, item.mrp)}% off</span>
                                </div>
                              </div>
                              <button onClick={() => removeTest(item.id)} className="text-slate-300 hover:text-rose-400 transition shrink-0">
                                <X size={13} />
                              </button>
                            </motion.div>
                          ))}
                        </div>

                        <BillSummary
                          subtotal={testTotal}
                          deliveryFee={testProvider?.collectionFee ?? 0}
                          type="test"
                        />
                      </>
                    )}
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* Footer CTA */}
            {((tab === "medicines" && medicineItems.length > 0 && placed !== "medicines") ||
              (tab === "tests" && testItems.length > 0 && placed !== "tests")) && (
              <div className="px-5 py-4 border-t border-slate-100 bg-white">
                <button
                  onClick={() => handlePlaceOrder(tab)}
                  disabled={placing}
                  className="w-full bg-slate-900 text-white py-4 rounded-2xl font-semibold text-sm hover:bg-slate-800 active:scale-[0.99] transition flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {placing ? (
                    <><Loader2 size={16} className="animate-spin" /> Placing order…</>
                  ) : (
                    <>
                      {tab === "medicines" ? "Place Medicine Order" : "Book Tests"}
                      <span className="bg-white/20 px-2 py-0.5 rounded-lg text-xs font-bold">
                        ₹{tab === "medicines"
                          ? (medicineTotal + (medicineProvider?.deliveryFee ?? 0))
                          : (testTotal + (testProvider?.collectionFee ?? 0))}
                      </span>
                      <ChevronRight size={15} />
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function BillSummary({ subtotal, deliveryFee, type }: { subtotal: number; deliveryFee: number; type: "medicine" | "test" }) {
  const label = type === "medicine" ? "Delivery fee" : "Collection fee";
  const savings = 0; // could compute from mrp diffs
  return (
    <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 space-y-2.5">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Bill Summary</p>
      <div className="flex justify-between text-sm text-slate-600">
        <span>Item total</span>
        <span className="font-medium text-slate-800">₹{subtotal}</span>
      </div>
      <div className="flex justify-between text-sm text-slate-600">
        <span>{label}</span>
        <span className={deliveryFee === 0 ? "text-emerald-600 font-medium" : "font-medium text-slate-800"}>
          {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
        </span>
      </div>
      <div className="border-t border-slate-200 pt-2.5 flex justify-between">
        <span className="text-sm font-bold text-slate-800">Total</span>
        <span className="text-base font-bold text-slate-900">₹{subtotal + deliveryFee}</span>
      </div>
    </div>
  );
}

function EmptyCart({ icon, label, sub }: { icon: string; label: string; sub: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <p className="text-base font-semibold text-slate-700">{label}</p>
      <p className="text-sm text-slate-400 mt-1 max-w-[200px]">{sub}</p>
    </div>
  );
}

function OrderPlaced({ type }: { type: "medicine" | "test" }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-20 text-center">
      <motion.div
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.1 }}
        className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-4xl mb-5">
        ✅
      </motion.div>
      <p className="text-lg font-bold text-slate-800">
        {type === "medicine" ? "Order Placed!" : "Tests Booked!"}
      </p>
      <p className="text-sm text-slate-400 mt-1.5 max-w-[220px]">
        {type === "medicine"
          ? "Your medicines are on the way. Track in My Orders."
          : "Your test has been booked. Track in My Tests."}
      </p>
    </motion.div>
  );
}