// src/pages/CreateOrder.tsx
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useLab } from "@/context/LabContext";
import {
  Search, Plus, Trash2, AlertCircle, Loader2, FlaskConical,
  ShoppingCart, User, CreditCard, FileText, ChevronRight,
  RotateCcw, BadgeCheck, X, Banknote, Smartphone, Wallet,
  Receipt, Calendar, Clock,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────
interface Test {
  _id: string;
  name: string;
  type: string;
  price: number;
  discount: number;
  requirement: string;
  caution: string;
  visitLab: boolean;
  visibility: boolean;
  duration_of_result: { value: number; unit: string };
}
interface CartItem { test: Test }

type PaymentMethod = "cash" | "upi" | "card" | "netbanking" | "wallet";

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; Icon: any }[] = [
  { value: "cash",       label: "Cash",        Icon: Banknote   },
  { value: "upi",        label: "UPI",         Icon: Smartphone },
  { value: "card",       label: "Card",        Icon: CreditCard },
  { value: "netbanking", label: "Net Banking", Icon: Receipt    },
  { value: "wallet",     label: "Wallet",      Icon: Wallet     },
];

const effectivePrice = (t: Test) => Math.round(t.price - (t.price * t.discount) / 100);

export default function CreateOrder() {
  const { labToken, fetchOrders, tests } = useLab();
  const backendURL = import.meta.env.VITE_BACKEND_URL;

  // Search
  const [query, setQuery]     = useState("");
  const searchRef             = useRef<HTMLInputElement>(null);
  const containerRef          = useRef<HTMLDivElement>(null);

  const searchResults: Test[] = query.trim()
    ? tests.filter((t: Test) =>
        t.name.toLowerCase().includes(query.toLowerCase()) ||
        t.type.toLowerCase().includes(query.toLowerCase())
      )
    : [];
  const showDropdown = query.trim().length > 0;

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node))
        setQuery("");
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Cart — tests are unique (one per order, no qty)
  const [cart, setCart] = useState<CartItem[]>([]);

  // Patient
  const [name,   setName]   = useState("");
  const [phone,  setPhone]  = useState("");
  const [email,  setEmail]  = useState("");
  const [age,    setAge]    = useState("");
  const [gender, setGender] = useState("");

  // Schedule
  const [scheduleType,  setScheduleType]  = useState<"now" | "later">("now");
  const [scheduledAt,   setScheduledAt]   = useState("");

  // Payment
  const [method,        setMethod]        = useState<PaymentMethod>("cash");
  const [transactionId, setTxnId]         = useState("");
  const [patientNote,   setPatientNote]   = useState("");
  const [receptionNote, setReceptionNote] = useState("");

  // Submission
  const [submitting, setSubmitting] = useState(false);
  const [success,    setSuccess]    = useState(false);

  // Derived
  const total      = cart.reduce((s, i) => s + effectivePrice(i.test), 0);
  const forceVisit = cart.some(i => i.test.visitLab);
  const canSubmit  = cart.length > 0 && name.trim() !== "" && phone.trim() !== "" &&
    (scheduleType === "now" || scheduledAt !== "");

  const addTest = (test: Test) => {
    if (cart.find(i => i.test._id === test._id)) {
      toast.info("Test already added.");
      setQuery(""); return;
    }
    setCart(prev => [...prev, { test }]);
    setQuery("");
    searchRef.current?.focus();
  };

  const removeTest = (id: string) => setCart(prev => prev.filter(i => i.test._id !== id));

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const payload = {
        patient: { name: name.trim(), phone, email, age: age ? Number(age) : undefined, gender: gender || undefined },
        items: cart.map(i => ({ serviceId: i.test._id })),
        schedule: scheduleType === "now"
          ? { type: "now" }
          : { type: "later", scheduledAt },
        payment: { method, status: method === "cod" ? "cash_on_delivery" : "paid", transactionId },
        notes: { fromPatient: patientNote, fromReceptionist: receptionNote },
      };

      const res = await axios.post(`${backendURL}/api/lab/createOrder`, payload, {
        headers: { Authorization: `Bearer ${labToken}` },
      });

      if (res.data.success) {
        toast.success("Order created successfully!");
        fetchOrders();
        setSuccess(true);
      } else {
        toast.error(res.data.message || "Failed to create order.");
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Network error.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setCart([]); setName(""); setPhone(""); setEmail(""); setAge(""); setGender("");
    setScheduleType("now"); setScheduledAt(""); setMethod("cash"); setTxnId("");
    setPatientNote(""); setReceptionNote(""); setSuccess(false);
    setTimeout(() => searchRef.current?.focus(), 100);
  };

  // ── Success screen ─────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center p-8">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <BadgeCheck size={40} className="text-emerald-600" />
          </div>
          <h2 className="text-2xl font-semibold text-slate-900 mb-1">Order Created!</h2>
          <p className="text-slate-500 text-sm mb-8">Lab test booking completed successfully.</p>
          <button onClick={resetForm}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 rounded-2xl transition flex items-center justify-center gap-2 text-sm">
            <RotateCcw size={15} /> New Order
          </button>
        </div>
      </div>
    );
  }

  // ── Main form ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      <div className="mb-8">
        <h1 className="text-4xl font-light text-slate-900">
          Create <span className="font-semibold text-emerald-600">Lab Order</span>
        </h1>
        <p className="mt-2 text-slate-500 text-sm">
          Walk-in inclinic booking — search tests, fill patient details and collect payment.
        </p>
      </div>

      {/* Force visit banner */}
      {forceVisit && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-2xl px-5 py-3.5 flex items-center gap-3">
          <AlertCircle size={16} className="text-blue-500 shrink-0" />
          <p className="text-sm text-blue-700">
            One or more selected tests require a lab visit. This order will be a <span className="font-semibold">visit_lab</span> order.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* ── LEFT: Search + Cart ── */}
        <div className="xl:col-span-2 space-y-5">

          {/* Search */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <FlaskConical size={15} className="text-emerald-500" /> Add Tests
            </h2>
            <div ref={containerRef} className="relative">
              <div className="relative">
                <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input ref={searchRef} type="text" value={query} autoFocus
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search by test name or type…"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-10 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition"
                />
                {query && (
                  <button onClick={() => setQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition">
                    <X size={14} />
                  </button>
                )}
              </div>

              {showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden max-h-72 overflow-y-auto">
                  {searchResults.length === 0 ? (
                    <div className="px-5 py-8 text-center text-sm text-slate-400">No tests found for "{query}"</div>
                  ) : (
                    searchResults.map(test => (
                      <button key={test._id} onClick={() => addTest(test)}
                        disabled={!test.visibility}
                        className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-emerald-50 transition text-left border-b border-slate-100 last:border-0 disabled:opacity-40 disabled:cursor-not-allowed">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                          <FlaskConical size={15} className="text-emerald-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">{test.name}</p>
                          <p className="text-xs text-slate-400">{test.type} · Result in {test.duration_of_result.value} {test.duration_of_result.unit}</p>
                        </div>
                        {test.visitLab && (
                          <span className="text-[10px] bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-lg font-medium shrink-0">Lab Visit</span>
                        )}
                        <div className="text-right shrink-0">
                          <p className="text-sm font-semibold text-emerald-600">₹{effectivePrice(test)}</p>
                          {test.discount > 0 && <p className="text-xs text-slate-400 line-through">₹{test.price}</p>}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Cart */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <ShoppingCart size={15} className="text-emerald-500" />
                Selected Tests
                {cart.length > 0 && (
                  <span className="ml-1 bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">{cart.length}</span>
                )}
              </h2>
              {cart.length > 0 && (
                <button onClick={() => setCart([])}
                  className="text-xs text-slate-400 hover:text-red-500 transition flex items-center gap-1">
                  <Trash2 size={12} /> Clear all
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-3">
                  <FlaskConical size={22} className="text-slate-300" />
                </div>
                <p className="text-sm text-slate-400">No tests selected</p>
                <p className="text-xs text-slate-300 mt-1">Search and add tests above</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-12 gap-2 px-6 py-2 bg-slate-50 border-b border-slate-100 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                  <div className="col-span-5">Test</div>
                  <div className="col-span-3">Requirement</div>
                  <div className="col-span-2 text-right">Price</div>
                  <div className="col-span-2 text-center">Action</div>
                </div>
                <div className="divide-y divide-slate-100">
                  {cart.map(({ test }) => (
                    <div key={test._id} className="grid grid-cols-12 gap-2 items-center px-6 py-4 hover:bg-slate-50 transition">
                      <div className="col-span-5 flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                          <FlaskConical size={13} className="text-emerald-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">{test.name}</p>
                          <p className="text-xs text-slate-400">{test.type}</p>
                          {test.visitLab && (
                            <span className="text-[10px] bg-blue-50 text-blue-600 border border-blue-100 px-1.5 py-0.5 rounded font-medium">Lab Visit Required</span>
                          )}
                        </div>
                      </div>
                      <div className="col-span-3">
                        <p className="text-xs text-slate-500 truncate">{test.requirement}</p>
                      </div>
                      <div className="col-span-2 text-right">
                        <p className="text-sm font-semibold text-emerald-600">₹{effectivePrice(test)}</p>
                        {test.discount > 0 && <p className="text-xs text-slate-400 line-through">₹{test.price}</p>}
                      </div>
                      <div className="col-span-2 text-center">
                        <button onClick={() => removeTest(test._id)}
                          className="text-slate-300 hover:text-red-400 transition p-1 rounded-lg hover:bg-red-50">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                  <p className="text-sm text-slate-500">{cart.length} test{cart.length !== 1 ? "s" : ""} selected</p>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Grand Total</p>
                    <p className="text-xl font-bold text-emerald-600">₹{total}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── RIGHT: Patient + Schedule + Payment + Submit ── */}
        <div className="space-y-5">

          {/* Patient */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <User size={15} className="text-emerald-500" /> Patient Details
            </h2>
            <div className="space-y-3">
              <Field label="Patient Name" required placeholder="Full name" value={name} onChange={setName} />
              <Field label="Phone Number" required placeholder="10-digit number" value={phone} onChange={setPhone} type="tel" />
              <Field label="Email Address" placeholder="optional" value={email} onChange={setEmail} type="email" />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Age" placeholder="years" value={age} onChange={setAge} type="number" />
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1.5">Gender</label>
                  <select value={gender} onChange={e => setGender(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition">
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <Calendar size={15} className="text-emerald-500" /> Schedule
            </h2>
            <div className="flex gap-2 mb-4">
              {(["now", "later"] as const).map(t => (
                <button key={t} onClick={() => setScheduleType(t)}
                  className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition flex items-center justify-center gap-2 ${
                    scheduleType === t
                      ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                      : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300"
                  }`}>
                  <Clock size={13} /> {t === "now" ? "Immediate" : "Schedule Later"}
                </button>
              ))}
            </div>
            {scheduleType === "later" && (
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1.5">Date & Time <span className="text-red-400">*</span></label>
                <input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)}
                  min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition"
                />
              </div>
            )}
          </div>

          {/* Payment */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <CreditCard size={15} className="text-emerald-500" /> Payment
            </h2>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {PAYMENT_OPTIONS.map(({ value, label, Icon }) => (
                <button key={value} onClick={() => setMethod(value)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition ${
                    method === value
                      ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                      : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300"
                  }`}>
                  <Icon size={14} className={method === value ? "text-emerald-500" : "text-slate-400"} />
                  {label}
                </button>
              ))}
            </div>
            {method !== "cash" && (
              <Field label="Transaction / Reference ID" placeholder="optional" value={transactionId} onChange={setTxnId} />
            )}
          </div>

          {/* Notes */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <FileText size={15} className="text-emerald-500" /> Notes
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1.5">Patient note</label>
                <textarea value={patientNote} onChange={e => setPatientNote(e.target.value)}
                  placeholder="e.g. latex allergy, diabetic…" rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition resize-none" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1.5">Internal note</label>
                <textarea value={receptionNote} onChange={e => setReceptionNote(e.target.value)}
                  placeholder="Internal reception note…" rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition resize-none" />
              </div>
            </div>
          </div>

          {/* Summary + Submit */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Order Summary</h2>
            <div className="space-y-2.5 text-sm mb-5">
              <div className="flex justify-between text-slate-500">
                <span>Tests</span>
                <span className="font-medium text-slate-700">{cart.length}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Collection</span>
                <span className="font-medium text-slate-700">{forceVisit ? "Lab Visit" : "Inclinic"}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Collection Fee</span>
                <span className="font-medium text-emerald-600">₹0</span>
              </div>
              <div className="border-t border-slate-100 pt-2.5 flex justify-between font-semibold">
                <span className="text-slate-800">Grand Total</span>
                <span className="text-emerald-600 text-base">₹{total}</span>
              </div>
            </div>

            {!canSubmit && cart.length > 0 && (
              <div className="mb-4 space-y-1.5">
                {name.trim() === "" && (
                  <p className="text-xs text-red-500 flex items-center gap-1.5">
                    <AlertCircle size={11} /> Patient name is required
                  </p>
                )}
                {phone.trim() === "" && (
                  <p className="text-xs text-red-500 flex items-center gap-1.5">
                    <AlertCircle size={11} /> Phone number is required
                  </p>
                )}
                {scheduleType === "later" && scheduledAt === "" && (
                  <p className="text-xs text-amber-600 flex items-center gap-1.5">
                    <AlertCircle size={11} /> Please select a scheduled date & time
                  </p>
                )}
              </div>
            )}

            <button onClick={handleSubmit} disabled={!canSubmit || submitting}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-2xl transition flex items-center justify-center gap-2 text-sm">
              {submitting ? (
                <><Loader2 size={15} className="animate-spin" /> Creating Order…</>
              ) : (
                <>Create Order <ChevronRight size={15} /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, placeholder, value, onChange, required, type = "text" }:
  { label: string; placeholder: string; value: string; onChange: (v: string) => void; required?: boolean; type?: string }) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-500 block mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition"
      />
    </div>
  );
}