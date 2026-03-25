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
  deleteTest: (id: string) => Promise<void>;
  changeVisibility: (id: string) => Promise<void>;
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
  const [loading, setLoading] = useState(true);

  const backendURL = import.meta.env.VITE_BACKEND_URL;

  // Logout helper
  const logout = () => {
    localStorage.removeItem("labToken");
    localStorage.removeItem("partnerRole");
    setLabToken(null);
    setRole(null);
    setLabData(null);
    navigate("/lab/login", { replace: true });
  };

  // Initial token check
  useEffect(() => {
    const token = localStorage.getItem("labToken");
    const partnerRole = localStorage.getItem("partnerRole");

    if (!token || !partnerRole) {
      setLoading(false); // ✅ set false before navigate
      navigate("/lab/login", { replace: true });
      return;
    }

    setLabToken(token);
    setRole(partnerRole);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (labToken && role === "lab") {
      fetchLabData();
      fetchTests();
    }
  }, [labToken, role]);

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

  const fetchLabData = async () => {
    if (!labToken || role !== "lab") return;

    try {
      const { data } = await axios.get(`${backendURL}/api/lab/myLab`, {
        headers: {
          Authorization: `Bearer ${labToken}`,
        },
      });
      setLabData(data.lab);
    } catch (error) {
      console.error(error);
    }
  };

  const deleteTest = async (id: string) => {
    if (!labToken || role !== "lab") return;
    try {
      const { data } = await axios.get(
        `${backendURL}/api/lab/removeTest/${id}`,
        {
          headers: {
            Authorization: `Bearer ${labToken}`,
          },
        },
      );
      fetchTests();
    } catch (error) {
      console.error(error);
    }
  };

  const changeVisibility = async (id: string) => {
    if (!labToken || role !== "lab") return;
    try {
      const { data } = await axios.get(
        `${backendURL}/api/lab/changeTestVisibility/${id}`,
        {
          headers: {
            Authorization: `Bearer ${labToken}`,
          },
        },
      );
      fetchTests();
    } catch (error) {
      console.error(error);
    }
  };

  const value = {
    tests,
    fetchTests,
    deleteTest,
    changeVisibility,
    labData,
    labToken,
    setLabToken,
    role,
    setRole,
    loading,
    logout,
  };

  return <LabContext.Provider value={value}>{children}</LabContext.Provider>;
};

export const useLab = () => {
  const context = useContext(LabContext);
  if (!context) {
    throw new Error("useLab must be used inside LabProvider");
  }
  return context;
};
