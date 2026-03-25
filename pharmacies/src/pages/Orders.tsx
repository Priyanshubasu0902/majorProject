// src/pages/Orders.tsx
import { useState } from "react";
import { usePharmacy, PharmacyOrder } from "@/context/PharmacyContext";
import {
  RefreshCw, Package, User, Phone, Mail, MapPin,
  CreditCard, FileText, Clock, ChevronDown, ChevronUp,
  AlertCircle, CheckCircle2, XCircle, Loader2,
} from "lucide-react";

// ── Status config ──────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  PharmacyOrder["currentStatus"],
  { label: string; bg: string; text: string; dot: string }
> = {
  pending:          { label: "Pending",           bg: "bg-slate-100",   text: "text-slate-600",   dot: "bg-slate-400"   },
  confirmed:        { label: "Confirmed",          bg: "bg-blue-50",     text: "text-blue-700",    dot: "bg-blue-500"    },
  preparing:        { label: "Preparing",          bg: "bg-amber-50",    text: "text-amber-700",   dot: "bg-amber-500"   },
  ready_for_pickup: { label: "Ready for Pickup",   bg: "bg-purple-50",   text: "text-purple-700",  dot: "bg-purple-500"  },
  out_for_delivery: { label: "Out for Delivery",   bg: "bg-indigo-50",   text: "text-indigo-700",  dot: "bg-indigo-500"  },
  delivered:        { label: "Delivered",          bg: "bg-emerald-50",  text: "text-emerald-700", dot: "bg-emerald-500" },
  picked_up:        { label: "Picked Up",          bg: "bg-emerald-50",  text: "text-emerald-700", dot: "bg-emerald-500" },
  completed:        { label: "Completed",          bg: "bg-emerald-50",  text: "text-emerald-700", dot: "bg-emerald-500" },
  cancelled:        { label: "Cancelled",          bg: "bg-red-50",      text: "text-red-700",     dot: "bg-red-500"     },
  refund_initiated: { label: "Refund Initiated",   bg: "bg-orange-50",   text: "text-orange-700",  dot: "bg-orange-500"  },
  refunded:         { label: "Refunded",           bg: "bg-orange-50",   text: "text-orange-700",  dot: "bg-orange-500"  },
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash:       "Cash",
  upi:        "UPI",
  card:       "Card",
  netbanking: "Net Banking",
  cod:        "Cash on Delivery",
  wallet:     "Wallet",
};

const CHANNEL_LABELS: Record<string, string> = {
  instore: "Instore",
  online:  "Online",
};

const ORDER_TYPE_LABELS: Record<string, string> = {
  inshop:   "Walk-in",
  delivery: "Delivery",
  pickup:   "Pickup",
};

// ── Helpers ────────────────────────────────────────────────────────────────
const formatDate = (dateStr: string | null) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

// ── Main Component ─────────────────────────────────────────────────────────
export default function Orders() {
  const { orders, ordersLoading, fetchOrders } = usePharmacy();

  // Which order card is expanded
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [channelFilter, setChannelFilter] = useState<string>("all");

  const toggleExpand = (id: string) =>
    setExpandedId(prev => (prev === id ? null : id));

  // Apply filters
  const filteredOrders = orders.filter(o => {
    const matchStatus  = statusFilter  === "all" || o.currentStatus === statusFilter;
    const matchChannel = channelFilter === "all" || o.channel        === channelFilter;
    return matchStatus && matchChannel;
  });

  // Summary counts
  const counts = {
    total:     orders.length,
    completed: orders.filter(o => ["completed", "delivered", "picked_up"].includes(o.currentStatus)).length,
    pending:   orders.filter(o => ["pending", "confirmed", "preparing"].includes(o.currentStatus)).length,
    cancelled: orders.filter(o => o.currentStatus === "cancelled").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-4xl font-light text-slate-900">
            Customer{" "}
            <span className="font-semibold text-emerald-600">Orders</span>
          </h1>
          <p className="mt-2 text-slate-500 text-sm">
            View and manage all orders placed at your pharmacy
          </p>
        </div>
        <button
          onClick={fetchOrders}
          disabled={ordersLoading}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition disabled:opacity-50"
        >
          <RefreshCw size={14} className={ordersLoading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <SummaryCard label="Total Orders"  value={counts.total}     color="text-slate-800" />
        <SummaryCard label="Completed"     value={counts.completed}  color="text-emerald-600" />
        <SummaryCard label="In Progress"   value={counts.pending}    color="text-amber-600" />
        <SummaryCard label="Cancelled"     value={counts.cancelled}  color="text-red-500" />
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-200"
        >
          <option value="all">All Statuses</option>
          {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
            <option key={val} value={val}>{cfg.label}</option>
          ))}
        </select>

        {/* Channel filter */}
        <select
          value={channelFilter}
          onChange={e => setChannelFilter(e.target.value)}
          className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-200"
        >
          <option value="all">All Channels</option>
          <option value="instore">Instore</option>
          <option value="online">Online</option>
        </select>
      </div>

      {/* ── Loading ── */}
      {ordersLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-emerald-500" />
        </div>
      )}

      {/* ── Empty state ── */}
      {!ordersLoading && filteredOrders.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mb-4">
            <Package size={28} className="text-slate-300" />
          </div>
          <p className="text-slate-500 font-medium">No orders found</p>
          <p className="text-slate-400 text-sm mt-1">
            {statusFilter !== "all" || channelFilter !== "all"
              ? "Try adjusting your filters"
              : "Orders will appear here once customers place them"}
          </p>
        </div>
      )}

      {/* ── Order cards ── */}
      {!ordersLoading && (
        <div className="space-y-4">
          {filteredOrders.map(order => {
            const statusCfg = STATUS_CONFIG[order.currentStatus] ?? STATUS_CONFIG.pending;
            const isExpanded = expandedId === order._id;

            return (
              <div
                key={order._id}
                className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
              >
                {/* ── Card header (always visible) ── */}
                <div
                  className="px-6 py-5 flex items-center gap-4 cursor-pointer hover:bg-slate-50 transition"
                  onClick={() => toggleExpand(order._id)}
                >
                  {/* Order number + type */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-slate-900 font-mono">
                        {order.orderNumber}
                      </p>
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-lg font-medium">
                        {CHANNEL_LABELS[order.channel]}
                      </span>
                      <span className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-lg font-medium">
                        {ORDER_TYPE_LABELS[order.orderType]}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {order.customer.name}
                      {order.customer.phone ? ` · ${order.customer.phone}` : ""}
                      {" · "}
                      {formatDate(order.createdAt)}
                    </p>
                  </div>

                  {/* Grand total */}
                  <div className="text-right shrink-0">
                    <p className="text-base font-bold text-emerald-600">
                      ₹{order.pricing.grandTotal.toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-400">
                      {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                    </p>
                  </div>

                  {/* Status badge */}
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 ${statusCfg.bg} ${statusCfg.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                    {statusCfg.label}
                  </div>

                  {/* Expand toggle */}
                  <div className="text-slate-400 shrink-0">
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>

                {/* ── Expanded detail ── */}
                {isExpanded && (
                  <div className="border-t border-slate-100 px-6 py-6 space-y-6">

                    {/* Row 1: Customer + Payment */}
                    <div className="grid md:grid-cols-2 gap-6">

                      {/* Customer */}
                      <Section title="Customer" icon={<User size={14} className="text-emerald-500" />}>
                        <DetailRow icon={<User size={12} />}    label="Name"    value={order.customer.name} />
                        <DetailRow icon={<Phone size={12} />}   label="Phone"   value={order.customer.phone || "—"} />
                        <DetailRow icon={<Mail size={12} />}    label="Email"   value={order.customer.email || "—"} />
                        <DetailRow
                          icon={<AlertCircle size={12} />}
                          label="Type"
                          value={order.customer.isWalkIn ? "Walk-in" : "Registered User"}
                        />
                      </Section>

                      {/* Payment */}
                      <Section title="Payment" icon={<CreditCard size={14} className="text-emerald-500" />}>
                        <DetailRow
                          icon={<CreditCard size={12} />}
                          label="Method"
                          value={PAYMENT_METHOD_LABELS[order.payment.method] ?? order.payment.method}
                        />
                        <DetailRow
                          icon={<CheckCircle2 size={12} />}
                          label="Status"
                          value={order.payment.status.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                          valueClass={
                            order.payment.status === "paid"
                              ? "text-emerald-600 font-semibold"
                              : order.payment.status === "failed"
                              ? "text-red-500 font-semibold"
                              : "text-slate-700"
                          }
                        />
                        {order.payment.transactionId && (
                          <DetailRow icon={<FileText size={12} />} label="Txn ID" value={order.payment.transactionId} mono />
                        )}
                        {order.payment.paidAt && (
                          <DetailRow icon={<Clock size={12} />} label="Paid at" value={formatDate(order.payment.paidAt)} />
                        )}
                      </Section>
                    </div>

                    {/* Delivery address — only for delivery orders */}
                    {order.orderType === "delivery" && order.delivery?.address && (
                      <Section title="Delivery Address" icon={<MapPin size={14} className="text-emerald-500" />}>
                        <p className="text-sm text-slate-700">
                          {[
                            order.delivery.address.line1,
                            order.delivery.address.city,
                            order.delivery.address.state,
                            order.delivery.address.pincode,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                        {order.delivery.address.landmark && (
                          <p className="text-xs text-slate-400 mt-1">
                            Landmark: {order.delivery.address.landmark}
                          </p>
                        )}
                      </Section>
                    )}

                    {/* Items table */}
                    <Section title="Ordered Items" icon={<Package size={14} className="text-emerald-500" />}>
                      <div className="rounded-2xl border border-slate-100 overflow-hidden">
                        {/* Table header */}
                        <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-slate-50 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                          <div className="col-span-4">Medicine</div>
                          <div className="col-span-2 text-right">Unit Price</div>
                          <div className="col-span-1 text-center">Qty</div>
                          <div className="col-span-2 text-center">Discount</div>
                          <div className="col-span-2 text-right">Subtotal</div>
                          <div className="col-span-1 text-center">Rx</div>
                        </div>

                        {/* Table rows */}
                        <div className="divide-y divide-slate-100">
                          {order.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="grid grid-cols-12 gap-2 items-center px-4 py-3 hover:bg-slate-50 transition"
                            >
                              <div className="col-span-4">
                                <p className="text-sm font-medium text-slate-800 truncate">
                                  {item.name}
                                </p>
                                {item.brand && (
                                  <p className="text-xs text-slate-400">{item.brand}</p>
                                )}
                              </div>
                              <div className="col-span-2 text-right text-sm text-slate-700">
                                ₹{item.unitPrice}
                              </div>
                              <div className="col-span-1 text-center text-sm font-semibold text-slate-800">
                                {item.quantity}
                              </div>
                              <div className="col-span-2 text-center text-sm text-slate-500">
                                {item.discount}%
                              </div>
                              <div className="col-span-2 text-right text-sm font-semibold text-emerald-600">
                                ₹{item.subtotal.toFixed(2)}
                              </div>
                              <div className="col-span-1 text-center">
                                {item.requiresPrescription ? (
                                  item.prescriptionVerified ? (
                                    <CheckCircle2 size={14} className="text-emerald-500 mx-auto" title="Rx verified" />
                                  ) : (
                                    <XCircle size={14} className="text-amber-500 mx-auto" title="Rx not verified" />
                                  )
                                ) : (
                                  <span className="text-[10px] text-slate-300">OTC</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Pricing footer */}
                        <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 space-y-1.5">
                          <PricingRow label="Items Total"   value={`₹${order.pricing.itemsTotal.toFixed(2)}`} />
                          {order.orderType === 'delivery' &&<PricingRow
                            label="Delivery Fee"
                            value={order.pricing.deliveryFee === 0 ? "Free" : `₹${order.pricing.deliveryFee}`}
                            valueClass={order.pricing.deliveryFee === 0 ? "text-emerald-600" : undefined}
                          />}
                          {order.pricing.packagingFee > 0 && (
                            <PricingRow label="Packaging Fee" value={`₹${order.pricing.packagingFee}`} />
                          )}
                          <div className="border-t border-slate-200 pt-1.5 flex justify-between items-center">
                            <span className="text-sm font-bold text-slate-800">Grand Total</span>
                            <span className="text-base font-bold text-emerald-600">
                              ₹{order.pricing.grandTotal.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Section>

                    {/* Prescription */}
                    {order.prescription.required && (
                      <Section title="Prescription" icon={<FileText size={14} className="text-emerald-500" />}>
                        <div className="flex items-center gap-2">
                          {order.prescription.verified ? (
                            <><CheckCircle2 size={15} className="text-emerald-500" />
                            <span className="text-sm text-emerald-600 font-medium">Verified</span></>
                          ) : (
                            <><XCircle size={15} className="text-amber-500" />
                            <span className="text-sm text-amber-600 font-medium">Not verified</span></>
                          )}
                          {order.prescription.verifiedAt && (
                            <span className="text-xs text-slate-400">
                              · {formatDate(order.prescription.verifiedAt)}
                            </span>
                          )}
                        </div>
                      </Section>
                    )}

                    {/* Notes */}
                    {(order.notes.fromUser || order.notes.fromShopkeeper) && (
                      <Section title="Notes" icon={<FileText size={14} className="text-emerald-500" />}>
                        {order.notes.fromUser && (
                          <p className="text-sm text-slate-600">
                            <span className="font-medium text-slate-700">Customer: </span>
                            {order.notes.fromUser}
                          </p>
                        )}
                        {order.notes.fromShopkeeper && (
                          <p className="text-sm text-slate-600 mt-1">
                            <span className="font-medium text-slate-700">Internal: </span>
                            {order.notes.fromShopkeeper}
                          </p>
                        )}
                      </Section>
                    )}

                    {/* Cancellation info */}
                    {order.cancellation.status !== "none" && (
                      <Section title="Cancellation" icon={<XCircle size={14} className="text-red-500" />}>
                        <DetailRow
                          icon={<AlertCircle size={12} />}
                          label="Status"
                          value={order.cancellation.status.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                          valueClass="text-red-600 font-medium"
                        />
                        {order.cancellation.cancelledBy && (
                          <DetailRow icon={<User size={12} />} label="Cancelled by" value={order.cancellation.cancelledBy} />
                        )}
                        {order.cancellation.cancelledAt && (
                          <DetailRow icon={<Clock size={12} />} label="Cancelled at" value={formatDate(order.cancellation.cancelledAt)} />
                        )}
                        {order.cancellation.userRequest.reason && (
                          <DetailRow
                            icon={<FileText size={12} />}
                            label="Reason"
                            value={order.cancellation.userRequest.reason.replace(/_/g, " ")}
                          />
                        )}
                      </Section>
                    )}

                    {/* Status timeline */}
                    <Section title="Status Timeline" icon={<Clock size={14} className="text-emerald-500" />}>
                      <div className="space-y-3">
                        {order.statusHistory.map((entry, idx) => {
                          const cfg = STATUS_CONFIG[entry.status as PharmacyOrder["currentStatus"]] ?? STATUS_CONFIG.pending;
                          return (
                            <div key={idx} className="flex items-start gap-3">
                              <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${cfg.dot}`} />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`text-xs font-semibold ${cfg.text}`}>
                                    {cfg.label}
                                  </span>
                                  <span className="text-xs text-slate-400">
                                    by {entry.updatedBy}
                                  </span>
                                  <span className="text-xs text-slate-400">
                                    · {formatDate(entry.timestamp)}
                                  </span>
                                </div>
                                {entry.note && (
                                  <p className="text-xs text-slate-500 mt-0.5">{entry.note}</p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </Section>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Small reusable components ──────────────────────────────────────────────

function SummaryCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{label}</p>
      <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
        {icon} {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function DetailRow({
  icon, label, value, valueClass, mono,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClass?: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-slate-300 shrink-0">{icon}</span>
      <span className="text-slate-500 shrink-0 w-20">{label}</span>
      <span className={`truncate ${mono ? "font-mono" : ""} ${valueClass ?? "text-slate-700"}`}>
        {value}
      </span>
    </div>
  );
}

function PricingRow({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-slate-500">{label}</span>
      <span className={valueClass ?? "text-slate-700 font-medium"}>{value}</span>
    </div>
  );
}