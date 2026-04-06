// majorProject/users/src/context/UserContext.tsx
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";

const API = import.meta.env.VITE_BACKEND_URL as string;

// ── Auth helper ───────────────────────────────────────────────────────────
export function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: { ...authHeaders(), ...(options.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ── User ──────────────────────────────────────────────────────────────────
export interface Address {
  _id: string;
  label: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
  location?: { type: string; coordinates: [number, number] };
}

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  number: string;
  age: string;
  gender: string;
  profileImage: string | null;
  addresses: Address[];
}

interface UserContextType {
  user: UserProfile | null;
  setUser: (u: Partial<UserProfile>) => void;
  refreshUser: () => Promise<void>;
  isLoggedIn: boolean;
  logout: () => void;
}

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  refreshUser: async () => {},
  isLoggedIn: false,
  logout: () => {},
});

export function useUser() { return useContext(UserContext); }

// ── Cart Types ────────────────────────────────────────────────────────────
export interface CartProvider {
  id: string; name: string; address: string; emoji: string;
  deliveryFee?: number; collectionFee?: number; deliveryTime?: string;
  distance?: number; // metres from backend $geoNear
}
export interface CartMedicineItem {
  id: string; name: string; brand: string; price: number; mrp: number;
  qty: string; requiresPrescription: boolean; quantity: number;
}
export interface CartTestItem {
  id: string; name: string; price: number; mrp: number;
  reportTime: string; homeCollection: boolean; quantity: number;
}

interface CartContextType {
  medicineProvider: CartProvider | null;
  medicineItems: CartMedicineItem[];
  addMedicine: (item: Omit<CartMedicineItem, "quantity">, provider: CartProvider) => "added" | "conflict";
  removeMedicine: (id: string) => void;
  updateMedicineQty: (id: string, qty: number) => void;
  clearMedicineCart: () => void;
  medicineTotal: number;
  medicineCount: number;
  testProvider: CartProvider | null;
  testItems: CartTestItem[];
  addTest: (item: Omit<CartTestItem, "quantity">, provider: CartProvider) => "added" | "conflict";
  removeTest: (id: string) => void;
  clearTestCart: () => void;
  testTotal: number;
  testCount: number;
  conflictInfo: { type: "medicine" | "test"; newProvider: CartProvider; pendingItem: any } | null;
  resolveConflict: (replace: boolean) => void;
}

const CartContext = createContext<CartContextType>({} as CartContextType);
export function useCart() { return useContext(CartContext); }

// ── Nearby helpers (used by MedicinesPage and TestsPage) ──────────────────
export interface NearbyPharmacy {
  _id: string; name: string; address: string; number: string;
  email: string; image?: string; delivery: boolean; pickup: boolean;
  distance: number; // metres
  location: { type: string; coordinates: [number, number] };
}
export interface NearbyLab {
  _id: string; name: string; address: string; number: string;
  email: string; image?: string; serviceType: string;
  distance: number;
  location: { type: string; coordinates: [number, number] };
}

export async function fetchNearbyPharmacies(
  lat: number, lng: number, radius = 10000
): Promise<NearbyPharmacy[]> {
  const data = await apiFetch(
    `/api/user/nearby/pharmacies?lat=${lat}&lng=${lng}&radius=${radius}`
  );
  return data.success ? data.pharmacies : [];
}

export async function fetchNearbyLabs(
  lat: number, lng: number, radius = 10000
): Promise<NearbyLab[]> {
  const data = await apiFetch(
    `/api/user/nearby/labs?lat=${lat}&lng=${lng}&radius=${radius}`
  );
  return data.success ? data.labs : [];
}

export async function fetchPharmacyProducts(pharmacyId: string) {
  const data = await apiFetch(`/api/pharmacy/products/public/${pharmacyId}`);
  return data.success ? data.products : [];
}

export async function fetchLabServices(labId: string) {
  const data = await apiFetch(`/api/lab/tests/public/${labId}`);
  return data.success ? data.tests : [];
}

// ── Provider ──────────────────────────────────────────────────────────────
export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<UserProfile | null>(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const setUser = (u: Partial<UserProfile>) => {
    setUserState(prev => {
      if (!prev) return prev;
      const next = { ...prev, ...u };
      localStorage.setItem("user", JSON.stringify(next));
      return next;
    });
  };

  const refreshUser = useCallback(async () => {
    try {
      const data = await apiFetch("/api/user/user");
      if (data.success) {
        setUserState(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
      }
    } catch {
      // token expired or network error — don't crash
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUserState(null);
  };

  // Refresh user on mount if token exists
  useEffect(() => {
    if (localStorage.getItem("token")) refreshUser();
  }, [refreshUser]);

  // ── Medicine cart ─────────────────────────────────────────────────────
  const [medicineProvider, setMedicineProvider] = useState<CartProvider | null>(null);
  const [medicineItems, setMedicineItems] = useState<CartMedicineItem[]>([]);

  // ── Test cart ─────────────────────────────────────────────────────────
  const [testProvider, setTestProvider] = useState<CartProvider | null>(null);
  const [testItems, setTestItems] = useState<CartTestItem[]>([]);

  // ── Conflict dialog ───────────────────────────────────────────────────
  const [conflictInfo, setConflictInfo] = useState<CartContextType["conflictInfo"]>(null);

  const addMedicine = (
    item: Omit<CartMedicineItem, "quantity">,
    provider: CartProvider
  ): "added" | "conflict" => {
    if (medicineProvider && medicineProvider.id !== provider.id && medicineItems.length > 0) {
      setConflictInfo({ type: "medicine", newProvider: provider, pendingItem: item });
      return "conflict";
    }
    setMedicineProvider(provider);
    setMedicineItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...item, quantity: 1 }];
    });
    return "added";
  };

  const removeMedicine = (id: string) => {
    setMedicineItems(prev => {
      const next = prev.filter(i => i.id !== id);
      if (next.length === 0) setMedicineProvider(null);
      return next;
    });
  };

  const updateMedicineQty = (id: string, qty: number) => {
    if (qty <= 0) { removeMedicine(id); return; }
    setMedicineItems(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
  };

  const clearMedicineCart = () => { setMedicineItems([]); setMedicineProvider(null); };

  const medicineTotal = medicineItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const medicineCount = medicineItems.reduce((s, i) => s + i.quantity, 0);

  const addTest = (
    item: Omit<CartTestItem, "quantity">,
    provider: CartProvider
  ): "added" | "conflict" => {
    if (testProvider && testProvider.id !== provider.id && testItems.length > 0) {
      setConflictInfo({ type: "test", newProvider: provider, pendingItem: item });
      return "conflict";
    }
    setTestProvider(provider);
    setTestItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) return prev; // one booking per test
      return [...prev, { ...item, quantity: 1 }];
    });
    return "added";
  };

  const removeTest = (id: string) => {
    setTestItems(prev => {
      const next = prev.filter(i => i.id !== id);
      if (next.length === 0) setTestProvider(null);
      return next;
    });
  };

  const clearTestCart = () => { setTestItems([]); setTestProvider(null); };

  const testTotal = testItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const testCount = testItems.reduce((s, i) => s + i.quantity, 0);

  const resolveConflict = (replace: boolean) => {
    if (!conflictInfo) return;
    if (replace) {
      if (conflictInfo.type === "medicine") {
        setMedicineProvider(conflictInfo.newProvider);
        setMedicineItems([{ ...conflictInfo.pendingItem, quantity: 1 }]);
      } else {
        setTestProvider(conflictInfo.newProvider);
        setTestItems([{ ...conflictInfo.pendingItem, quantity: 1 }]);
      }
    }
    setConflictInfo(null);
  };

  return (
    <UserContext.Provider value={{ user, setUser, refreshUser, isLoggedIn: !!user, logout }}>
      <CartContext.Provider value={{
        medicineProvider, medicineItems, addMedicine, removeMedicine,
        updateMedicineQty, clearMedicineCart, medicineTotal, medicineCount,
        testProvider, testItems, addTest, removeTest,
        clearTestCart, testTotal, testCount,
        conflictInfo, resolveConflict,
      }}>
        {children}
      </CartContext.Provider>
    </UserContext.Provider>
  );
}