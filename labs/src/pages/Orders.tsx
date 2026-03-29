// src/pages/Orders.tsx
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useLab, type LabOrder } from "@/context/LabContext";
import {
  RefreshCw, FlaskConical, User, Phone, Mail, Clock,
  CreditCard, FileText, ChevronDown, ChevronUp,
  CheckCircle2, XCircle, Loader2, Upload, Send,
  AlertCircle, Calendar,
} from "lucide-react";

// ── Status config ──────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  LabOrder["currentStatus"],
  { label: string; bg: string; text: string; dot: string }
> = {
  pending:           { label: "Pending",           bg: "bg-slate-100",  text: "text-slate-600",   dot: "bg-slate-400"   },
  confirmed:         { label: "Confirmed",          bg: "bg-blue-50",    text: "text-blue-700",    dot: "bg-blue-500"    },
  sample_collected:  { label: "Sample Collected",   bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-500"   },
  processing:        { label: "Processing",         bg: "bg-purple-50",  text: "text-purple-700",  dot: "bg-purple-500"  },
  results_ready:     { label: "Results Ready",      bg: "bg-teal-50",    text: "text-teal-700",    dot: "bg-teal-500"    },
  results_delivered: { label: "Results Delivered",  bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  completed:         { label: "Completed",          bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  cancelled:         { label: "Cancelled",          bg: "bg-red-50",     text: "text-red-700",     dot: "bg-red-500"     },
  refund_initiated:  { label: "Refund Initiated",   bg: "bg-orange-50",  text: "text-orange-700",  dot: "bg-orange-500"  },
  refunded:          { label: "Refunded",           bg: "bg-orange-50",  text: "text-orange-700",  dot: "bg-orange-500"  },
};

// Status flow for advancing orders one step at a time
const STATUS_FLOW: LabOrder["currentStatus"][] = [
  "pending",
  "confirmed",
  "sample_collected",
  "processing",
  "results_ready",
  "results_delivered",
  "completed",
];

// Statuses that allow report upload
// Only after processing is done (results_ready or results_delivered for re-upload)
const UPLOAD_ALLOWED_STATUSES = ["results_ready", "results_delivered"];

const PAYMENT_LABELS: Record<string, string> = {
  cash: "Cash", upi: "UPI", card: "Card",
  netbanking: "Net Banking", cod: "Cash on Delivery", wallet: "Wallet",
};

const formatDate = (d: string | null) => {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

// ── Main Component ─────────────────────────────────────────────────────────
export default function Orders() {
  const { orders, ordersLoading, fetchOrders, labToken } = useLab();
  const backendURL = import.meta.env.VITE_BACKEND_URL;

  const [expandedId,    setExpandedId]    = useState<string | null>(null);
  const [statusFilter,  setStatusFilter]  = useState("all");
  const [channelFilter, setChannelFilter] = useState("all");

  // Per-order loading state keyed by orderId
  const [updatingStatus,  setUpdatingStatus]  = useState<string | null>(null);
  const [uploadingReport, setUploadingReport] = useState<string | null>(null);
  const [sendingEmail,    setSendingEmail]    = useState<string | null>(null);

  const toggleExpand = (id: string) =>
    setExpandedId(p => (p === id ? null : id));

  // Filtered orders
  const filteredOrders = orders.filter(o => {
    const ms = statusFilter  === "all" || o.currentStatus === statusFilter;
    const mc = channelFilter === "all" || o.channel        === channelFilter;
    return ms && mc;
  });

  // Summary counts
  const counts = {
    total:     orders.length,
    completed: orders.filter(o => ["completed", "results_delivered"].includes(o.currentStatus)).length,
    pending:   orders.filter(o => ["pending", "confirmed", "sample_collected", "processing", "results_ready"].includes(o.currentStatus)).length,
    cancelled: orders.filter(o => o.currentStatus === "cancelled").length,
  };

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleStatusUpdate = async (
    orderId: string,
    newStatus: LabOrder["currentStatus"],
  ) => {
    setUpdatingStatus(orderId);
    try {
      const res = await axios.post(
        `${backendURL}/api/lab/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${labToken}` } },
      );
      if (res.data.success) {
        toast.success(`Status updated to "${STATUS_CONFIG[newStatus].label}"`);
        fetchOrders();
      } else {
        toast.error(res.data.message || "Failed to update status.");
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Network error.");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleReportUpload = async (orderId: string, file: File) => {
    setUploadingReport(orderId);
    try {
      const formData = new FormData();
      formData.append("report", file);
      const res = await axios.post(
        `${backendURL}/api/lab/orders/${orderId}/report`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${labToken}`,
            // Do NOT set Content-Type manually — browser sets it with boundary
          },
        },
      );
      if (res.data.success) {
        toast.success("Report uploaded successfully!");
        fetchOrders();
      } else {
        toast.error(res.data.message || "Upload failed.");
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Upload failed.");
    } finally {
      setUploadingReport(null);
    }
  };

  const handleSendEmail = async (orderId: string) => {
    setSendingEmail(orderId);
    try {
      const res = await axios.post(
        `${backendURL}/api/lab/orders/${orderId}/send-report`,
        {},
        { headers: { Authorization: `Bearer ${labToken}` } },
      );
      if (res.data.success) {
        toast.success("Report sent to patient's email!");
        fetchOrders();
      } else {
        toast.error(res.data.message || "Failed to send email.");
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to send email.");
    } finally {
      setSendingEmail(null);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-4xl font-light text-slate-900">
            Lab <span className="font-semibold text-emerald-600">Orders</span>
          </h1>
          <p className="mt-2 text-slate-500 text-sm">
            Manage test bookings, update status and upload results
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

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Orders" value={counts.total}     color="text-slate-800" />
        <StatCard label="Completed"    value={counts.completed}  color="text-emerald-600" />
        <StatCard label="In Progress"  value={counts.pending}    color="text-amber-600" />
        <StatCard label="Cancelled"    value={counts.cancelled}  color="text-red-500" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
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

        <select
          value={channelFilter}
          onChange={e => setChannelFilter(e.target.value)}
          className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-200"
        >
          <option value="all">All Channels</option>
          <option value="inclinic">Inclinic</option>
          <option value="online">Online</option>
        </select>
      </div>

      {/* Loading */}
      {ordersLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-emerald-500" />
        </div>
      )}

      {/* Empty state */}
      {!ordersLoading && filteredOrders.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mb-4">
            <FlaskConical size={28} className="text-slate-300" />
          </div>
          <p className="text-slate-500 font-medium">No orders found</p>
          <p className="text-slate-400 text-sm mt-1">
            {statusFilter !== "all" || channelFilter !== "all"
              ? "Try adjusting your filters"
              : "Orders will appear here once patients book tests"}
          </p>
        </div>
      )}

      {/* Order cards */}
      {!ordersLoading && (
        <div className="space-y-4">
          {filteredOrders.map(order => {
            const cfg        = STATUS_CONFIG[order.currentStatus] ?? STATUS_CONFIG.pending;
            const isExpanded = expandedId === order._id;
            const currentIdx = STATUS_FLOW.indexOf(order.currentStatus);
            const nextStatus = currentIdx >= 0 && currentIdx < STATUS_FLOW.length - 1
              ? STATUS_FLOW[currentIdx + 1]
              : null;

            const hasReport      = !!order.consolidatedReport?.reportUrl;
            const canUpload      = UPLOAD_ALLOWED_STATUSES.includes(order.currentStatus);
            const canSendEmail   = hasReport && !!order.patient.email;
            const isTerminal     = ["cancelled", "completed", "refunded"].includes(order.currentStatus);

            return (
              <div
                key={order._id}
                className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
              >
                {/* ── Collapsed header ── */}
                <div
                  className="px-6 py-5 flex items-center gap-4 cursor-pointer hover:bg-slate-50 transition"
                  onClick={() => toggleExpand(order._id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-slate-900 font-mono">
                        {order.orderNumber}
                      </p>
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-lg font-medium capitalize">
                        {order.channel}
                      </span>
                      <span className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-lg font-medium">
                        {order.collectionType === "visit_lab" ? "Lab Visit" : "Home Collection"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {order.patient.name}
                      {order.patient.phone ? ` · ${order.patient.phone}` : ""}
                      {" · "}
                      {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-base font-bold text-emerald-600">
                      ₹{order.pricing.grandTotal.toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-400">
                      {order.items.length} test{order.items.length !== 1 ? "s" : ""}
                    </p>
                  </div>

                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 ${cfg.bg} ${cfg.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                  </div>

                  <div className="text-slate-400 shrink-0">
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>

                {/* ── Expanded detail ── */}
                {isExpanded && (
                  <div className="border-t border-slate-100 px-6 py-6 space-y-6">

                    {/* Patient + Payment */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <Section title="Patient" icon={<User size={14} className="text-emerald-500" />}>
                        <DetailRow icon={<User size={12} />}  label="Name"  value={order.patient.name} />
                        <DetailRow icon={<Phone size={12} />} label="Phone" value={order.patient.phone || "—"} />
                        <DetailRow icon={<Mail size={12} />}  label="Email" value={order.patient.email || "—"} />
                        {order.patient.age != null && (
                          <DetailRow
                            icon={<User size={12} />}
                            label="Age"
                            value={`${order.patient.age} yrs · ${order.patient.gender ?? "—"}`}
                          />
                        )}
                      </Section>

                      <Section title="Payment" icon={<CreditCard size={14} className="text-emerald-500" />}>
                        <DetailRow
                          icon={<CreditCard size={12} />}
                          label="Method"
                          value={PAYMENT_LABELS[order.payment.method] ?? order.payment.method}
                        />
                        <DetailRow
                          icon={<CheckCircle2 size={12} />}
                          label="Status"
                          value={order.payment.status.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                          valueClass={order.payment.status === "paid" ? "text-emerald-600 font-semibold" : "text-slate-700"}
                        />
                        {order.payment.paidAt && (
                          <DetailRow
                            icon={<Clock size={12} />}
                            label="Paid at"
                            value={formatDate(order.payment.paidAt)}
                          />
                        )}
                      </Section>
                    </div>

                    {/* Schedule */}
                    {(order.labVisit?.scheduledAt || order.homeCollection?.scheduledAt) && (
                      <Section title="Schedule" icon={<Calendar size={14} className="text-emerald-500" />}>
                        <DetailRow
                          icon={<Clock size={12} />}
                          label="Scheduled"
                          value={formatDate(
                            order.labVisit?.scheduledAt ?? order.homeCollection?.scheduledAt ?? null
                          )}
                        />
                        {order.labVisit?.arrivedAt && (
                          <DetailRow
                            icon={<CheckCircle2 size={12} />}
                            label="Arrived"
                            value={formatDate(order.labVisit.arrivedAt)}
                          />
                        )}
                      </Section>
                    )}

                    {/* Tests booked */}
                    <Section title="Tests Booked" icon={<FlaskConical size={14} className="text-emerald-500" />}>
                      <div className="rounded-2xl border border-slate-100 overflow-hidden">
                        {/* Table header */}
                        <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-slate-50 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                          <div className="col-span-4">Test</div>
                          <div className="col-span-2 text-right">Price</div>
                          <div className="col-span-2 text-center">Discount</div>
                          <div className="col-span-2 text-right">Subtotal</div>
                          <div className="col-span-2 text-center">Result</div>
                        </div>

                        {/* Table rows */}
                        <div className="divide-y divide-slate-100">
                          {order.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="grid grid-cols-12 gap-2 items-center px-4 py-3 hover:bg-slate-50 transition"
                            >
                              <div className="col-span-4">
                                <p className="text-sm font-medium text-slate-800 truncate">{item.name}</p>
                                <p className="text-xs text-slate-400">{item.type}</p>
                              </div>
                              <div className="col-span-2 text-right text-sm text-slate-700">
                                ₹{item.price}
                              </div>
                              <div className="col-span-2 text-center text-sm text-slate-500">
                                {item.discount}%
                              </div>
                              <div className="col-span-2 text-right text-sm font-semibold text-emerald-600">
                                ₹{item.subtotal.toFixed(2)}
                              </div>
                              <div className="col-span-2 text-center">
                                {item.result?.reportUrl ? (
                                  <a
                                    href={item.result.reportUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs text-blue-600 hover:underline font-medium"
                                  >
                                    View
                                  </a>
                                ) : (
                                  <span className={`text-[10px] px-2 py-0.5 rounded-lg font-medium ${
                                    item.result?.status === "pending"    ? "bg-slate-100 text-slate-500"  :
                                    item.result?.status === "ready"      ? "bg-teal-50 text-teal-600"     :
                                    item.result?.status === "processing" ? "bg-purple-50 text-purple-600" :
                                    "bg-amber-50 text-amber-600"
                                  }`}>
                                    {item.result?.status ?? "pending"}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Pricing footer */}
                        <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 space-y-1.5">
                          <PricingRow label="Items Total" value={`₹${order.pricing.itemsTotal.toFixed(2)}`} />
                          {order.pricing.collectionFee > 0 && (
                            <PricingRow label="Collection Fee" value={`₹${order.pricing.collectionFee}`} />
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

                    {/* ── Report section ── */}
                    <Section title="Report" icon={<FileText size={14} className="text-emerald-500" />}>

                      {/* Upload not yet available */}
                      {!canUpload && !hasReport && (
                        <div className="flex items-start gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3">
                          <AlertCircle size={14} className="text-slate-400 mt-0.5 shrink-0" />
                          <p className="text-xs text-slate-500">
                            Report upload is available once the order reaches{" "}
                            <span className="font-semibold text-slate-700">"Processing"</span>{" "}
                            status and is marked complete. Current status:{" "}
                            <span className="font-semibold text-slate-700 capitalize">
                              {order.currentStatus.replace(/_/g, " ")}
                            </span>
                          </p>
                        </div>
                      )}

                      {/* Upload available */}
                      {(canUpload || hasReport) && (
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center gap-3">

                            {/* View existing report */}
                            {hasReport && (
                              <a
                                href={order.consolidatedReport.reportUrl!}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-medium hover:bg-emerald-100 transition"
                              >
                                <FileText size={14} /> View Report
                              </a>
                            )}

                            {/* Send to email */}
                            {canSendEmail && (
                              <button
                                onClick={() => handleSendEmail(order._id)}
                                disabled={sendingEmail === order._id}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl text-sm font-medium hover:bg-blue-100 transition disabled:opacity-50"
                              >
                                {sendingEmail === order._id ? (
                                  <><Loader2 size={13} className="animate-spin" /> Sending…</>
                                ) : (
                                  <><Send size={13} /> Send to Email</>
                                )}
                              </button>
                            )}

                            {/* No email on file warning */}
                            {hasReport && !order.patient.email && (
                              <p className="text-xs text-slate-400 flex items-center gap-1">
                                <AlertCircle size={11} /> No email on file — cannot send report
                              </p>
                            )}

                            {/* Upload / Re-upload button */}
                            {canUpload && (
                              <label className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition cursor-pointer ${
                                uploadingReport === order._id
                                  ? "bg-slate-100 text-slate-400 cursor-not-allowed pointer-events-none"
                                  : hasReport
                                  ? "bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100"
                                  : "bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                              }`}>
                                {uploadingReport === order._id ? (
                                  <><Loader2 size={13} className="animate-spin" /> Uploading…</>
                                ) : hasReport ? (
                                  <><Upload size={13} /> Re-upload PDF</>
                                ) : (
                                  <><Upload size={13} /> Upload Report PDF</>
                                )}
                                <input
                                  type="file"
                                  accept="application/pdf"
                                  className="hidden"
                                  disabled={uploadingReport === order._id}
                                  onChange={e => {
                                    const f = e.target.files?.[0];
                                    if (f) handleReportUpload(order._id, f);
                                    // Reset input so same file can be re-selected
                                    e.target.value = "";
                                  }}
                                />
                              </label>
                            )}
                          </div>

                          {/* Delivery confirmation */}
                          {order.consolidatedReport?.deliveredAt && (
                            <p className="text-xs text-slate-400 flex items-center gap-1.5">
                              <CheckCircle2 size={11} className="text-emerald-500" />
                              Delivered {formatDate(order.consolidatedReport.deliveredAt)} via{" "}
                              {order.consolidatedReport.deliveredVia}
                            </p>
                          )}
                        </div>
                      )}
                    </Section>

                    {/* ── Status update controls ── */}
                    {!isTerminal && (
                      <Section title="Update Status" icon={<CheckCircle2 size={14} className="text-emerald-500" />}>
                        <div className="flex flex-wrap gap-2">
                          {nextStatus && (
                            <button
                              onClick={() => handleStatusUpdate(order._id, nextStatus)}
                              disabled={updatingStatus === order._id}
                              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition disabled:opacity-50"
                            >
                              {updatingStatus === order._id ? (
                                <><Loader2 size={13} className="animate-spin" /> Updating…</>
                              ) : (
                                <>Mark as {STATUS_CONFIG[nextStatus].label} →</>
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => handleStatusUpdate(order._id, "cancelled")}
                            disabled={updatingStatus === order._id}
                            className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 transition disabled:opacity-50"
                          >
                            <XCircle size={13} /> Cancel Order
                          </button>
                        </div>
                      </Section>
                    )}

                    {/* Notes */}
                    {(order.notes.fromPatient || order.notes.fromReceptionist || order.notes.fromTechnician) && (
                      <Section title="Notes" icon={<FileText size={14} className="text-emerald-500" />}>
                        {order.notes.fromPatient && (
                          <p className="text-sm text-slate-600">
                            <span className="font-medium text-slate-700">Patient: </span>
                            {order.notes.fromPatient}
                          </p>
                        )}
                        {order.notes.fromReceptionist && (
                          <p className="text-sm text-slate-600 mt-1">
                            <span className="font-medium text-slate-700">Reception: </span>
                            {order.notes.fromReceptionist}
                          </p>
                        )}
                        {order.notes.fromTechnician && (
                          <p className="text-sm text-slate-600 mt-1">
                            <span className="font-medium text-slate-700">Technician: </span>
                            {order.notes.fromTechnician}
                          </p>
                        )}
                      </Section>
                    )}

                    {/* Status timeline */}
                    <Section title="Timeline" icon={<Clock size={14} className="text-emerald-500" />}>
                      <div className="space-y-3">
                        {order.statusHistory.map((entry, idx) => {
                          const c = STATUS_CONFIG[entry.status as LabOrder["currentStatus"]] ?? STATUS_CONFIG.pending;
                          return (
                            <div key={idx} className="flex items-start gap-3">
                              <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${c.dot}`} />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`text-xs font-semibold ${c.text}`}>{c.label}</span>
                                  <span className="text-xs text-slate-400">by {entry.updatedBy}</span>
                                  <span className="text-xs text-slate-400">· {formatDate(entry.timestamp)}</span>
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

// ── Reusable sub-components ────────────────────────────────────────────────
function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{label}</p>
      <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
    </div>
  );
}

function Section({
  title, icon, children,
}: {
  title: string; icon: React.ReactNode; children: React.ReactNode;
}) {
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
  icon, label, value, valueClass,
}: {
  icon: React.ReactNode; label: string; value: string; valueClass?: string;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-slate-300 shrink-0">{icon}</span>
      <span className="text-slate-500 shrink-0 w-20">{label}</span>
      <span className={`truncate ${valueClass ?? "text-slate-700"}`}>{value}</span>
    </div>
  );
}

function PricingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-700 font-medium">{value}</span>
    </div>
  );
}