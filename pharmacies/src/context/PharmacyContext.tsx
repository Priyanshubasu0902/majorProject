import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface PharmacyContextType {
  products: any[];
  pharmacyData: any;
  pharmacyToken: string | null;
  role: string | null;
  loading: boolean;
  fetchProducts: () => Promise<void>;
  logout: () => void;
}

const PharmacyContext = createContext<PharmacyContextType | null>(null);

interface Props {
  children: ReactNode;
}

export const PharmacyProvider = ({ children }: Props) => {
  const navigate = useNavigate();

  const [products, setProducts] = useState<any[]>([]);
  const [pharmacyData, setPharmacyData] = useState<any>(null);
  const [pharmacyToken, setPharmacyToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const backendURL = import.meta.env.VITE_BACKEND_URL;

  // 🚪 Logout helper
  const logout = () => {
    localStorage.removeItem("pharmacytoken");
    setPharmacyToken(null);
    setRole(null);
    navigate("/pharmacy/login", { replace: true });
  };

  // 🔐 Initial token check
  useEffect(() => {
    const token = localStorage.getItem("pharmacytoken");

    if (!token) {
      logout();
      return;
    }

    setPharmacyToken(token);
  }, []);

  // 🔍 Validate token + role via backend
  useEffect(() => {
    if (!pharmacyToken) return;

    const validateAccess = async () => {
      try {
        const { data } = await axios.get(
          `${backendURL}/api/pharmacy/myPharmacy`,
          {
            headers: {
              Authorization: `Bearer ${pharmacyToken}`,
            },
          }
        );

        // ❌ Block non-pharmacy users
        if (data.role !== "pharmacy") {
          logout();
          return;
        }

        setRole(data.role);
        setPharmacyData(data.pharmacy);
      } catch (error) {
        // ❌ Invalid / expired token
        logout();
      } finally {
        setLoading(false);
      }
    };

    validateAccess();
  }, [pharmacyToken]);

  // 📦 Fetch products (only if role is valid)
  const fetchProducts = async () => {
    if (!pharmacyToken || role !== "pharmacy") return;

    try {
      const { data } = await axios.get(
        `${backendURL}/api/pharmacy/products`,
        {
          headers: {
            Authorization: `Bearer ${pharmacyToken}`,
          },
        }
      );
      setProducts(data.products);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <PharmacyContext.Provider
      value={{
        products,
        pharmacyData,
        pharmacyToken,
        role,
        loading,
        fetchProducts,
        logout,
      }}
    >
      {!loading && children}
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
