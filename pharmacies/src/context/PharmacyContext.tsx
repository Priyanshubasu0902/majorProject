// src/context/PharmacyContext.tsx
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// ── Order types (matching pharmacyOrderSchema) ─────────────────────────────
export interface OrderItem {
  medicineId: string;
  name: string;
  brand: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  subtotal: number;
  requiresPrescription: boolean;
  prescriptionVerified: boolean;
}

export interface PharmacyOrder {
  _id: string;
  orderNumber: string;
  createdAt: string;
  updatedAt: string;
  channel: "online" | "instore";
  orderType: "delivery" | "pickup" | "inshop";
  customer: {
    userId: string | null;
    name: string;
    phone: string;
    email: string;
    isWalkIn: boolean;
  };
  pharmacy: {
    pharmacyId: string;
    name: string;
    address: string;
    phone: string;
    email: string;
  };
  delivery?: {
    address: {
      line1: string;
      city: string;
      state: string;
      pincode: string;
      landmark: string;
    };
    scheduledAt: string | null;
    deliveredAt: string | null;
  };
  pickup?: {
    scheduledAt: string | null;
    pickedUpAt: string | null;
  };
  items: OrderItem[];
  prescription: {
    required: boolean;
    verified: boolean;
    verifiedAt: string | null;
    documents: { url: string; uploadedAt: string }[];
  };
  pricing: {
    itemsTotal: number;
    deliveryFee: number;
    packagingFee: number;
    grandTotal: number;
  };
  payment: {
    status: "pending" | "paid" | "failed" | "refunded" | "cash_on_delivery";
    method: "upi" | "card" | "netbanking" | "cash" | "cod" | "wallet";
    paidAt: string | null;
    transactionId: string;
    refundId: string | null;
    refundedAt: string | null;
    refundAmount: number | null;
  };
  currentStatus:
    | "pending"
    | "confirmed"
    | "preparing"
    | "ready_for_pickup"
    | "out_for_delivery"
    | "delivered"
    | "picked_up"
    | "completed"
    | "cancelled"
    | "refund_initiated"
    | "refunded";
  statusHistory: {
    status: string;
    timestamp: string;
    updatedBy: string;
    note: string;
    userAction: string | null;
  }[];
  cancellation: {
    status: "none" | "requested_by_user" | "approved" | "rejected" | "auto_cancelled";
    cancelledAt: string | null;
    cancelledBy: string | null;
    userRequest: {
      requestedAt: string | null;
      reason: string | null;
      refundEligible: boolean;
    };
  };
  notes: {
    fromUser: string;
    fromShopkeeper: string;
  };
}

// ── Context type ───────────────────────────────────────────────────────────
interface PharmacyContextType {
  products: any[];
  pharmacyData: any;
  pharmacyToken: string | null;
  setPharmacyToken: React.Dispatch<React.SetStateAction<string | null>>;
  role: string | null;
  setRole: React.Dispatch<React.SetStateAction<string | null>>;
  loading: boolean;
  orders: PharmacyOrder[];
  ordersLoading: boolean;
  fetchProducts: () => Promise<void>;
  fetchOrders: () => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  changeVisibility: (id: string) => Promise<void>;
  incrementStock: (id: string) => Promise<void>;
  decrementStock: (id: string) => Promise<void>;
  logout: () => void;
}

export const PharmacyContext = createContext<PharmacyContextType | null>(null);

interface Props {
  children: ReactNode;
}

export const PharmacyProvider = ({ children }: Props) => {
  const navigate = useNavigate();

  const [products, setProducts]         = useState<any[]>([]);
  const [pharmacyData, setPharmacyData] = useState<any>(null);
  const [pharmacyToken, setPharmacyToken] = useState<string | null>(null);
  const [role, setRole]                 = useState<string | null>(null);
  const [loading, setLoading]           = useState(true);
  const [orders, setOrders]             = useState<PharmacyOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const backendURL = import.meta.env.VITE_BACKEND_URL;

  // ── Logout ─────────────────────────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem("pharmacyToken");
    localStorage.removeItem("partnerRole");
    setPharmacyToken(null);
    setRole(null);
    setPharmacyData(null);
    setOrders([]);
    toast.success("Logged out successfully.");
    navigate("/pharmacy/login", { replace: true });
  };

  // ── Initial token check ────────────────────────────────────────────────
  // PharmacyContext.tsx — init effect
useEffect(() => {
  const token       = localStorage.getItem("pharmacyToken");
  const partnerRole = localStorage.getItem("partnerRole");

  if (!token || !partnerRole) {
    setLoading(false);                               // ✅ set false before navigate
    navigate("/pharmacy/login", { replace: true });
    return;
  }

  setPharmacyToken(token);
  setRole(partnerRole);
  setLoading(false);                                 // ✅ set false after state is ready
}, []);                                              // ✅ empty deps — runs once on mount

  // ── Fetch on auth ──────────────────────────────────────────────────────
  useEffect(() => {
    if (pharmacyToken && role === "pharmacy") {
      fetchPharmacyData();
      fetchProducts();
      fetchOrders();
    }
  }, [pharmacyToken, role]);

  // ── Fetch products ─────────────────────────────────────────────────────
  const fetchProducts = async () => {
    if (!pharmacyToken || role !== "pharmacy") return;
    try {
      const { data } = await axios.get(`${backendURL}/api/pharmacy/products`, {
        headers: { Authorization: `Bearer ${pharmacyToken}` },
      });
      setProducts(data.products);
    } catch (error) {
      console.error(error);
    }
  };

  // ── Fetch pharmacy data ────────────────────────────────────────────────
  const fetchPharmacyData = async () => {
    if (!pharmacyToken || role !== "pharmacy") return;
    try {
      const { data } = await axios.get(`${backendURL}/api/pharmacy/myPharmacy`, {
        headers: { Authorization: `Bearer ${pharmacyToken}` },
      });
      setPharmacyData(data.pharmacy);
    } catch (error) {
      console.error(error);
    }
  };

  // ── Fetch orders ───────────────────────────────────────────────────────
  const fetchOrders = async () => {
    if (!pharmacyToken || role !== "pharmacy") return;
    setOrdersLoading(true);
    try {
      const { data } = await axios.get(`${backendURL}/api/pharmacy/orders`, {
        headers: { Authorization: `Bearer ${pharmacyToken}` },
      });
      setOrders(data.orders ?? []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch orders.");
    } finally {
      setOrdersLoading(false);
    }
  };

  // ── Product actions ────────────────────────────────────────────────────
  const deleteProduct = async (id: string) => {
    if (!pharmacyToken || role !== "pharmacy") return;
    try {
      await axios.get(`${backendURL}/api/pharmacy/removeProduct/${id}`, {
        headers: { Authorization: `Bearer ${pharmacyToken}` },
      });
      toast.success("Product deleted successfully.");
      fetchProducts();
    } catch {
      toast.error("Failed to delete product.");
    }
  };

  const changeVisibility = async (id: string) => {
    if (!pharmacyToken || role !== "pharmacy") return;
    try {
      await axios.get(`${backendURL}/api/pharmacy/changeProductVisibility/${id}`, {
        headers: { Authorization: `Bearer ${pharmacyToken}` },
      });
      toast.success("Visibility updated.");
      fetchProducts();
    } catch {
      toast.error("Failed to update visibility.");
    }
  };

  const incrementStock = async (id: string) => {
    if (!pharmacyToken || role !== "pharmacy") return;
    try {
      await axios.get(`${backendURL}/api/pharmacy/incrementQuantity/${id}`, {
        headers: { Authorization: `Bearer ${pharmacyToken}` },
      });
      toast.success("Stock incremented.");
      fetchProducts();
    } catch {
      toast.error("Failed to increment stock.");
    }
  };

  const decrementStock = async (id: string) => {
    if (!pharmacyToken || role !== "pharmacy") return;
    try {
      await axios.get(`${backendURL}/api/pharmacy/decrementQuantity/${id}`, {
        headers: { Authorization: `Bearer ${pharmacyToken}` },
      });
      toast.success("Stock decremented.");
      fetchProducts();
    } catch {
      toast.error("Failed to decrement stock.");
    }
  };

  const value: PharmacyContextType = {
    products,
    fetchProducts,
    pharmacyData,
    pharmacyToken,
    setPharmacyToken,
    role,
    setRole,
    loading,
    orders,
    ordersLoading,
    fetchOrders,
    deleteProduct,
    changeVisibility,
    incrementStock,
    decrementStock,
    logout,
  };

  return (
    <PharmacyContext.Provider value={value}>
      {children}
    </PharmacyContext.Provider>
  );
};

export const usePharmacy = () => {
  const context = useContext(PharmacyContext);
  if (!context) {
    throw new Error("usePharmacy must be used inside PharmacyProvider");
  }
  return context;
};