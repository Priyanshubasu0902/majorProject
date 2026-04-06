// src/context/LabContext.tsx
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// ── Order types ────────────────────────────────────────────────────────────
export interface LabOrderItem {
  serviceId: string;
  name: string;
  type: string;
  price: number;
  discount: number;
  subtotal: number;
  requiresLabVisit: boolean;
  duration_of_test: { value: number; unit: string };
  duration_of_result: { value: number; unit: string };
  requirement: string;
  caution: string;
  result: {
    status: "pending" | "collected" | "processing" | "ready" | "delivered";
    reportUrl: string | null;
    uploadedAt: string | null;
    notes: string;
    referenceRange: string;
    isAbnormal: boolean;
  };
}

export interface LabOrder {
  _id: string;
  orderNumber: string;
  createdAt: string;
  updatedAt: string;
  channel: "online" | "inclinic";
  collectionType: "home_collection" | "visit_lab";
  patient: {
    userId: string | null;
    name: string;
    phone: string;
    email: string;
    age: number | null;
    gender: string | null;
    isWalkIn: boolean;
  };
  lab: { labId: string; name: string; address: string; phone: string; email: string };
  homeCollection?: {
    address: { line1: string; city: string; state: string; pincode: string; landmark: string };
    scheduledAt: string | null;
    collectedAt: string | null;
    collectionFee: number;
  } | null;
  labVisit?: { scheduledAt: string | null; arrivedAt: string | null } | null;
  items: LabOrderItem[];
  pricing: { itemsTotal: number; collectionFee: number; packagingFee: number; grandTotal: number };
  payment: {
    status: string;
    method: string;
    paidAt: string | null;
    transactionId: string;
  };
  currentStatus:
    | "pending" | "confirmed" | "sample_collected" | "processing"
    | "results_ready" | "results_delivered" | "completed"
    | "cancelled" | "refund_initiated" | "refunded";
  statusHistory: {
    status: string;
    timestamp: string;
    updatedBy: string;
    note: string;
    userAction: string | null;
  }[];
  cancellation: {
    status: string;
    cancelledAt: string | null;
    cancelledBy: string | null;
    userRequest: { requestedAt: string | null; reason: string | null; refundEligible: boolean };
  };
  consolidatedReport: {
    reportUrl: string | null;
    generatedAt: string | null;
    deliveredVia: string | null;
    deliveredAt: string | null;
  };
  notes: { fromPatient: string; fromReceptionist: string; fromTechnician: string };
}

// ── Context type ───────────────────────────────────────────────────────────
interface LabContextType {
  tests: any[];
  labData: any;
  labToken: string | null;
  setLabToken: React.Dispatch<React.SetStateAction<string | null>>;
  role: string | null;
  setRole: React.Dispatch<React.SetStateAction<string | null>>;
  loading: boolean;
  orders: LabOrder[];
  ordersLoading: boolean;
  fetchTests: () => Promise<void>;
  fetchOrders: () => Promise<void>;
  deleteTest: (id: string) => Promise<void>;
  changeVisibility: (id: string) => Promise<void>;
  logout: () => void;
}

export const LabContext = createContext<LabContextType | null>(null);

export const LabProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();

  const [tests, setTests]         = useState<any[]>([]);
  const [labData, setLabData]     = useState<any>(null);
  const [labToken, setLabToken]   = useState<string | null>(null);
  const [role, setRole]           = useState<string | null>(null);
  const [loading, setLoading]     = useState(true);
  const [orders, setOrders]       = useState<LabOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const backendURL = import.meta.env.VITE_BACKEND_URL;

  const logout = () => {
    localStorage.removeItem("labToken");
    localStorage.removeItem("partnerRole");
    setLabToken(null); setRole(null); setLabData(null); setOrders([]);
    toast.success("Logged out successfully.");
    navigate("/lab/login", { replace: true });
  };

  // Initial token check
  useEffect(() => {
    const token      = localStorage.getItem("labToken");
    const partnerRole = localStorage.getItem("partnerRole");
    if (!token || !partnerRole) { setLoading(false); navigate("/lab/login", { replace: true }); return; }
    setLabToken(token);
    setRole(partnerRole);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (labToken && role === "lab") { fetchLabData(); fetchTests(); fetchOrders(); }
  }, [labToken, role]);

  // Refetch when tab becomes visible again
  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === "visible" && labToken && role === "lab") {
        fetchLabData(); fetchTests(); fetchOrders();
      }
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [labToken, role]);

  const fetchTests = async () => {
    if (!labToken || role !== "lab") return;
    try {
      const { data } = await axios.get(`${backendURL}/api/lab/tests`, {
        headers: { Authorization: `Bearer ${labToken}` },
      });
      setTests(data.tests);
    } catch (error) { console.error(error); }
  };

  const fetchLabData = async () => {
    if (!labToken || role !== "lab") return;
    try {
      const { data } = await axios.get(`${backendURL}/api/lab/myLab`, {
        headers: { Authorization: `Bearer ${labToken}` },
      });
      setLabData(data.lab);
    } catch (error) { console.error(error); }
  };

  const fetchOrders = async () => {
    if (!labToken || role !== "lab") return;
    setOrdersLoading(true);
    try {
      const { data } = await axios.get(`${backendURL}/api/lab/orders`, {
        headers: { Authorization: `Bearer ${labToken}` },
      });
      setOrders(data.orders ?? []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch orders.");
    } finally { setOrdersLoading(false); }
  };

  const deleteTest = async (id: string) => {
    if (!labToken || role !== "lab") return;
    try {
      await axios.get(`${backendURL}/api/lab/removeTest/${id}`, {
        headers: { Authorization: `Bearer ${labToken}` },
      });
      toast.success("Test deleted.");
      fetchTests();
    } catch { toast.error("Failed to delete test."); }
  };

  const changeVisibility = async (id: string) => {
    if (!labToken || role !== "lab") return;
    try {
      await axios.get(`${backendURL}/api/lab/changeTestVisibility/${id}`, {
        headers: { Authorization: `Bearer ${labToken}` },
      });
      toast.success("Visibility updated.");
      fetchTests();
    } catch { toast.error("Failed to update visibility."); }
  };

  return (
    <LabContext.Provider value={{
      tests, fetchTests, deleteTest, changeVisibility,
      labData, labToken, setLabToken, role, setRole, loading,
      orders, ordersLoading, fetchOrders, logout,
    }}>
      {children}
    </LabContext.Provider>
  );
};

export const useLab = () => {
  const context = useContext(LabContext);
  if (!context) throw new Error("useLab must be used inside LabProvider");
  return context;
};