// src/pages/CreateOrder.tsx
import { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { usePharmacy } from "@/context/PharmacyContext";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShoppingCart,
  User,
  CreditCard,
  FileText,
  Package,
  ChevronRight,
  RotateCcw,
  BadgeCheck,
  X,
  Banknote,
  Smartphone,
  Wallet,
  Receipt,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────
interface Product {
  _id: string;
  name: string;
  companyName: string;
  type: string;
  price: number;
  discount: number;
  no_of_Product: number;
  prescription_required: boolean;
  quantity: { amount: number; unit: string };
  image?: string;
}

interface CartItem {
  product: Product;
  qty: number;
  rxVerified: boolean;
}

type PaymentMethod = "cash" | "upi" | "card" | "netbanking" | "wallet";

// ── Static data ────────────────────────────────────────────────────────────
const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; Icon: any }[] = [
  { value: "cash", label: "Cash", Icon: Banknote },
  { value: "upi", label: "UPI", Icon: Smartphone },
  { value: "card", label: "Card", Icon: CreditCard },
  { value: "netbanking", label: "Net Banking", Icon: Receipt },
  { value: "wallet", label: "Wallet", Icon: Wallet },
];

// ── Helpers ────────────────────────────────────────────────────────────────
const effectivePrice = (p: Product) =>
  Math.round(p.price - (p.price * p.discount) / 100);

const lineTotal = (item: CartItem) => effectivePrice(item.product) * item.qty;

// ── Component ──────────────────────────────────────────────────────────────
export default function CreateOrder() {
  const { pharmacyToken, products, fetchOrders } = usePharmacy();
  const backendURL = import.meta.env.VITE_BACKEND_URL;

  // ── Search state ───────────────────────────────────────────────────────
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter products from context — no API call needed
  const searchResults: Product[] = query.trim()
    ? products.filter(
        (p: Product) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.companyName.toLowerCase().includes(query.toLowerCase()),
      )
    : [];

  const showDropdown = query.trim().length > 0;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Cart state ─────────────────────────────────────────────────────────
  const [cart, setCart] = useState<CartItem[]>([]);

  // ── Customer state ─────────────────────────────────────────────────────
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // ── Payment state ──────────────────────────────────────────────────────
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [transactionId, setTxnId] = useState("");
  const [shopkeeperNote, setNote] = useState("");

  // ── Submission state ───────────────────────────────────────────────────
  const [step, setStep] = useState<"form" | "submitting" | "success" | "error">(
    "form",
  );
  const [errorMsg, setErrorMsg] = useState("");

  // ── Cart helpers ───────────────────────────────────────────────────────
  const addProduct = (product: Product) => {
    if (product.no_of_Product <= 0) return;
    setCart((prev) => {
      const existing = prev.find((i) => i.product._id === product._id);
      if (existing) {
        // Already in cart — increment if stock allows
        if (existing.qty >= product.no_of_Product) return prev;
        return prev.map((i) =>
          i.product._id === product._id ? { ...i, qty: i.qty + 1 } : i,
        );
      }
      // New item — Rx items start unverified, OTC items start verified
      return [
        ...prev,
        { product, qty: 1, rxVerified: !product.prescription_required },
      ];
    });
    setQuery("");
    searchRef.current?.focus();
  };

  const setQty = (id: string, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((i) => i.product._id !== id));
      return;
    }
    setCart((prev) =>
      prev.map((i) =>
        i.product._id === id
          ? { ...i, qty: Math.min(qty, i.product.no_of_Product) }
          : i,
      ),
    );
  };

  const removeItem = (id: string) =>
    setCart((prev) => prev.filter((i) => i.product._id !== id));

  const toggleRx = (id: string) =>
    setCart((prev) =>
      prev.map((i) =>
        i.product._id === id ? { ...i, rxVerified: !i.rxVerified } : i,
      ),
    );

  // ── Derived values ─────────────────────────────────────────────────────
  const itemsTotal = cart.reduce((s, i) => s + lineTotal(i), 0);
  const grandTotal = itemsTotal; // no delivery fee for instore
  const totalQty = cart.reduce((s, i) => s + i.qty, 0);
  const rxItems = cart.filter((i) => i.product.prescription_required);
  const rxRequired = rxItems.length > 0;
  const allRxDone = rxItems.every((i) => i.rxVerified);
  const canSubmit =
    cart.length > 0 && name.trim() !== "" && (!rxRequired || allRxDone);

  // ── Submit order ───────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!canSubmit) return;
    setStep("submitting");
    setErrorMsg("");

    try {
      const payload = {
        customer: { name: name.trim(), phone, email },
        items: cart.map((i) => ({
          medicineId: i.product._id,
          quantity: i.qty,
          prescriptionVerified: i.rxVerified,
        })),
        prescription: { verified: allRxDone },
        payment: {
          method,
          status: method === "cod" ? "cash_on_delivery" : "paid",
          transactionId: transactionId.trim(),
        },
        notes: {
          fromUser: "",
          fromShopkeeper: shopkeeperNote.trim(),
        },
      };

      const res = await axios.post(
        `${backendURL}/api/pharmacy/createOrder`,
        payload,
        {
          headers: { Authorization: `Bearer ${pharmacyToken}` },
        },
      );

      if (res.data.success) {
        toast.success("Order placed successfully!");
        fetchOrders();
        resetForm();
      } else {
        toast.error(res.data.message || "Order failed. Please try again.");
        setStep("form"); // stay on form so user can retry
      }
    } catch (e: any) {
      toast.error(
        e.response?.data?.message || "Network error. Please try again.",
      );
      setStep("form");
    }
  };

  // ── Reset everything for next order ───────────────────────────────────
  const resetForm = () => {
    setCart([]);
    setName("");
    setPhone("");
    setEmail("");
    setMethod("cash");
    setTxnId("");
    setNote("");
    setStep("form");
    setTimeout(() => searchRef.current?.focus(), 100);
  };

  // ══════════════════════════════════════════════════════════════════════
  // MAIN FORM
  // ══════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-4xl font-light text-slate-900">
          Create <span className="font-semibold text-emerald-600">Order</span>
        </h1>
        <p className="mt-2 text-slate-500 text-sm">
          Walk-in instore sale — search products, fill customer details and
          collect payment.
        </p>
      </div>

      {/* Error banner */}
      {step === "error" && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl px-5 py-4 flex items-start gap-3">
          <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-700">Order failed</p>
            <p className="text-xs text-red-500 mt-0.5">{errorMsg}</p>
          </div>
          <button
            onClick={() => setStep("form")}
            className="text-red-400 hover:text-red-600 transition"
          >
            <X size={15} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* ══════════════════════════════════════════════════════════════
            LEFT COLUMN — Product search + Cart table
        ══════════════════════════════════════════════════════════════ */}
        <div className="xl:col-span-2 space-y-5">
          {/* Search card */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <Package size={15} className="text-emerald-500" />
              Add Products
            </h2>

            <div ref={containerRef} className="relative">
              {/* Input */}
              <div className="relative">
                <Search
                  size={15}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  ref={searchRef}
                  type="text"
                  value={query}
                  autoFocus
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by product name or company…"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-10 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Dropdown */}
              {showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden max-h-72 overflow-y-auto">
                  {searchResults.length === 0 ? (
                    <div className="px-5 py-8 text-center text-sm text-slate-400">
                      No products found for "{query}"
                    </div>
                  ) : (
                    searchResults.map((product) => (
                      <button
                        key={product._id}
                        onClick={() => addProduct(product)}
                        disabled={product.no_of_Product <= 0}
                        className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-emerald-50 transition text-left border-b border-slate-100 last:border-0 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {/* Icon */}
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                          <Package size={15} className="text-emerald-500" />
                        </div>

                        {/* Product info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-slate-400">
                            {product.companyName} · {product.quantity.amount}{" "}
                            {product.quantity.unit}
                          </p>
                        </div>

                        {/* Rx badge */}
                        {product.prescription_required && (
                          <span className="text-[10px] bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-lg font-medium shrink-0">
                            Rx
                          </span>
                        )}

                        {/* Price */}
                        <div className="text-right shrink-0">
                          <p className="text-sm font-semibold text-emerald-600">
                            ₹{effectivePrice(product)}
                          </p>
                          {product.discount > 0 && (
                            <p className="text-xs text-slate-400 line-through">
                              ₹{product.price}
                            </p>
                          )}
                        </div>

                        {/* Stock badge */}
                        <div
                          className={`text-xs px-2 py-1 rounded-lg font-medium shrink-0 ${
                            product.no_of_Product > 10
                              ? "bg-emerald-50 text-emerald-600"
                              : product.no_of_Product > 0
                                ? "bg-amber-50 text-amber-600"
                                : "bg-red-50 text-red-500"
                          }`}
                        >
                          {product.no_of_Product > 0
                            ? `${product.no_of_Product} left`
                            : "Out of stock"}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Cart table */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Cart header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <ShoppingCart size={15} className="text-emerald-500" />
                Cart
                {cart.length > 0 && (
                  <span className="ml-1 bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">
                    {totalQty} item{totalQty !== 1 ? "s" : ""}
                  </span>
                )}
              </h2>
              {cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="text-xs text-slate-400 hover:text-red-500 transition flex items-center gap-1"
                >
                  <Trash2 size={12} /> Clear all
                </button>
              )}
            </div>

            {/* Empty state */}
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-3">
                  <ShoppingCart size={22} className="text-slate-300" />
                </div>
                <p className="text-sm text-slate-400">Your cart is empty</p>
                <p className="text-xs text-slate-300 mt-1">
                  Search and add products above to get started
                </p>
              </div>
            ) : (
              <>
                {/* Column headers */}
                <div className="grid grid-cols-12 gap-2 px-6 py-2 bg-slate-50 border-b border-slate-100 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                  <div className="col-span-4">Product</div>
                  <div className="col-span-2 text-right">Unit Price</div>
                  <div className="col-span-2 text-center">Qty</div>
                  <div className="col-span-2 text-right">Subtotal</div>
                  <div className="col-span-2 text-center">Rx</div>
                </div>

                {/* Cart rows */}
                <div className="divide-y divide-slate-100">
                  {cart.map((item) => (
                    <div
                      key={item.product._id}
                      className="grid grid-cols-12 gap-2 items-center px-6 py-4 hover:bg-slate-50 transition"
                    >
                      {/* Product info */}
                      <div className="col-span-4 flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                          <Package size={13} className="text-emerald-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">
                            {item.product.name}
                          </p>
                          <p className="text-xs text-slate-400 truncate">
                            {item.product.companyName} ·{" "}
                            {item.product.quantity.amount}{" "}
                            {item.product.quantity.unit}
                          </p>
                        </div>
                      </div>

                      {/* Unit price */}
                      <div className="col-span-2 text-right">
                        <p className="text-sm font-semibold text-slate-800">
                          ₹{effectivePrice(item.product)}
                        </p>
                        {item.product.discount > 0 && (
                          <p className="text-xs text-slate-400 line-through">
                            ₹{item.product.price}
                          </p>
                        )}
                      </div>

                      {/* Qty stepper */}
                      <div className="col-span-2 flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setQty(item.product._id, item.qty - 1)}
                          className="w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-500 transition"
                        >
                          <Minus size={11} />
                        </button>
                        <span className="text-sm font-semibold text-slate-800 w-6 text-center">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => setQty(item.product._id, item.qty + 1)}
                          disabled={item.qty >= item.product.no_of_Product}
                          className="w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-500 transition disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Plus size={11} />
                        </button>
                      </div>

                      {/* Subtotal */}
                      <div className="col-span-2 text-right">
                        <p className="text-sm font-semibold text-emerald-600">
                          ₹{lineTotal(item)}
                        </p>
                      </div>

                      {/* Rx toggle + remove */}
                      <div className="col-span-2 flex items-center justify-center gap-2">
                        {item.product.prescription_required ? (
                          <button
                            onClick={() => toggleRx(item.product._id)}
                            title={
                              item.rxVerified
                                ? "Prescription verified — click to unmark"
                                : "Click to mark prescription as verified"
                            }
                            className={`text-[10px] px-2.5 py-1 rounded-lg border font-medium transition flex items-center gap-1 ${
                              item.rxVerified
                                ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                : "bg-amber-50 text-amber-600 border-amber-200"
                            }`}
                          >
                            {item.rxVerified ? (
                              <>
                                <CheckCircle2 size={10} /> Verified
                              </>
                            ) : (
                              <>
                                <AlertCircle size={10} /> Verify Rx
                              </>
                            )}
                          </button>
                        ) : (
                          <span className="text-xs text-slate-300 font-medium">
                            OTC
                          </span>
                        )}
                        <button
                          onClick={() => removeItem(item.product._id)}
                          className="text-slate-300 hover:text-red-400 transition p-1 rounded-lg hover:bg-red-50"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cart footer totals */}
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                  <p className="text-sm text-slate-500">
                    {totalQty} item{totalQty !== 1 ? "s" : ""} in cart
                  </p>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Grand Total</p>
                    <p className="text-xl font-bold text-emerald-600">
                      ₹{grandTotal.toFixed(2)}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Rx warning banner */}
          {rxRequired && !allRxDone && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3.5 flex items-center gap-3">
              <AlertCircle size={16} className="text-amber-500 shrink-0" />
              <p className="text-sm text-amber-700">
                Some items require a prescription. Please verify all Rx items
                before placing the order.
              </p>
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════════════════════════
            RIGHT COLUMN — Customer + Payment + Notes + Submit
        ══════════════════════════════════════════════════════════════ */}
        <div className="space-y-5">
          {/* Customer details */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <User size={15} className="text-emerald-500" />
              Customer Details
            </h2>
            <div className="space-y-3">
              <Field
                label="Customer Name"
                required
                placeholder="Walk-in Customer"
                value={name}
                onChange={setName}
              />
              <Field
                label="Phone Number"
                placeholder="10-digit mobile number"
                value={phone}
                onChange={setPhone}
                type="tel"
              />
              <Field
                label="Email Address"
                placeholder="optional"
                value={email}
                onChange={setEmail}
                type="email"
              />
            </div>
          </div>

          {/* Payment method */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <CreditCard size={15} className="text-emerald-500" />
              Payment Method
            </h2>

            <div className="grid grid-cols-2 gap-2 mb-4">
              {PAYMENT_OPTIONS.map(({ value, label, Icon }) => (
                <button
                  key={value}
                  onClick={() => setMethod(value)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition ${
                    method === value
                      ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                      : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700"
                  }`}
                >
                  <Icon
                    size={14}
                    className={
                      method === value ? "text-emerald-500" : "text-slate-400"
                    }
                  />
                  {label}
                </button>
              ))}
            </div>

            {/* Transaction ID — only for non-cash */}
            {method !== "cash" && (
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1.5">
                  Transaction / Reference ID
                  <span className="text-slate-400 font-normal ml-1">
                    (optional)
                  </span>
                </label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTxnId(e.target.value)}
                  placeholder="UPI ref / card last 4 digits…"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition"
                />
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <FileText size={15} className="text-emerald-500" />
              Notes
            </h2>
            <textarea
              value={shopkeeperNote}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Internal note for this order (optional)…"
              rows={3}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition resize-none"
            />
          </div>

          {/* Order summary + Place Order */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">
              Order Summary
            </h2>

            <div className="space-y-2.5 text-sm mb-5">
              <div className="flex justify-between text-slate-500">
                <span>Items</span>
                <span className="font-medium text-slate-700">{totalQty}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span className="font-medium text-slate-700">
                  ₹{itemsTotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Delivery Fee</span>
                <span className="font-medium text-emerald-600">
                  ₹0 (Instore)
                </span>
              </div>
              <div className="border-t border-slate-100 pt-2.5 flex justify-between font-semibold">
                <span className="text-slate-800">Grand Total</span>
                <span className="text-emerald-600 text-base">
                  ₹{grandTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Inline validation hints */}
            {!canSubmit && cart.length > 0 && (
              <div className="mb-4 space-y-1.5">
                {name.trim() === "" && (
                  <p className="text-xs text-red-500 flex items-center gap-1.5">
                    <AlertCircle size={11} /> Customer name is required
                  </p>
                )}
                {rxRequired && !allRxDone && (
                  <p className="text-xs text-amber-600 flex items-center gap-1.5">
                    <AlertCircle size={11} /> Verify all prescription items
                  </p>
                )}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={!canSubmit || step === "submitting"}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-2xl transition flex items-center justify-center gap-2 text-sm"
            >
              {step === "submitting" ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Placing Order…
                </>
              ) : (
                <>
                  Place Order <ChevronRight size={15} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Reusable field ─────────────────────────────────────────────────────────
function Field({
  label,
  placeholder,
  value,
  onChange,
  required,
  type = "text",
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-500 block mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition"
      />
    </div>
  );
}

// ── Summary row ────────────────────────────────────────────────────────────
function SummaryRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-slate-500">{label}</span>
      <span className={`font-medium text-slate-800 ${mono ? "font-mono" : ""}`}>
        {value}
      </span>
    </div>
  );
}
