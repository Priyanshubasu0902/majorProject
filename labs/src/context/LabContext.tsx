import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface LabContextType {
  tests: any[];
  labData: any;
  labToken: string | null;
  setLabToken: React.Dispatch<React.SetStateAction<string | null>>;
  role: string | null;
   setRole: React.Dispatch<React.SetStateAction<string | null>>;
  loading: boolean;
  fetchTests: () => Promise<void>;
  logout: () => void;
}

export const LabContext = createContext<LabContextType | null>(null);

interface Props {
  children: ReactNode;
}

export const LabProvider = ({ children }: Props) => {
  const navigate = useNavigate();

  const [tests, setTests] = useState<any[]>([]);
  const [labData, setLabData] = useState<any>(null);
  const [labToken, setLabToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const backendURL = import.meta.env.VITE_BACKEND_URL;

  // Logout helper
  const logout = () => {
    localStorage.removeItem("labToken");
    localStorage.removeItem("partnerRole");
    setLabToken(null);
    setRole(null);
    navigate("/lab/login", { replace: true });
  };

  // Initial token check
  useEffect(() => {
    const token = localStorage.getItem("labToken");
    const role = localStorage.getItem("partnerRole");

    if (!token) {
      logout();
      return;
    }
    setLabToken(token);
    setRole(role);
  }, []);

  
  // 📦 Fetch tests (only if role is valid)
  const fetchTests = async () => {
    if (!labToken || role !== "lab") return;

    try {
      const { data } = await axios.get(`${backendURL}/api/lab/tests`, {
        headers: {
          Authorization: `Bearer ${labToken}`,
        },
      });
      setTests(data.tests);
    } catch (error) {
      console.error(error);
    }
  };

  const value = {
    tests,
    fetchTests,
    labData,
    labToken,
    setLabToken,
    role,
    setRole,
    loading,
    logout,
  };

  return (
    <LabContext.Provider value={value}>
      {children}
    </LabContext.Provider>
  );
};

export const useLab = () => {
  const context = useContext(LabContext);
  if (!context) {
    throw new Error("useLab must be used inside LabProvider");
  }
  return context;
};
