import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

// ── User ──────────────────────────────────────────────────────────────────
export interface UserProfile {
  fullName: string; email: string; mobile: string; age: string;
  gender: string; conditions: string[]; avatar: string | null;
  defaultAddress: string; addresses: string[];
}

interface UserContextType { user: UserProfile; setUser: (u: Partial<UserProfile>) => void; }

const defaultUser: UserProfile = {
  fullName: "Aarav Sharma", email: "aarav@example.com", mobile: "+91 98765 43210",
  age: "28", gender: "Male", conditions: ["None"], avatar: null,
  defaultAddress: "123, Park Street, Kolkata - 700016",
  addresses: ["123, Park Street, Kolkata - 700016", "45, Salt Lake Sector V, Kolkata - 700091"],
};

const UserContext = createContext<UserContextType>({ user: defaultUser, setUser: () => {} });
export function useUser() { return useContext(UserContext); }

// ── Cart Types ────────────────────────────────────────────────────────────
export interface CartProvider {
  id: string; name: string; address: string; emoji: string;
  deliveryFee?: number; collectionFee?: number; deliveryTime?: string;
}
export interface CartMedicineItem {
  id: string; name: string; brand: string; price: number; mrp: number; qty: string;
  requiresPrescription: boolean; quantity: number;
}
export interface CartTestItem {
  id: string; name: string; price: number; mrp: number;
  reportTime: string; homeCollection: boolean; quantity: number;
}

interface CartContextType {
  // Medicine cart
  medicineProvider: CartProvider | null;
  medicineItems: CartMedicineItem[];
  addMedicine: (item: Omit<CartMedicineItem, "quantity">, provider: CartProvider) => "added" | "switched" | "conflict";
  removeMedicine: (id: string) => void;
  updateMedicineQty: (id: string, qty: number) => void;
  clearMedicineCart: () => void;
  medicineTotal: number;
  medicineCount: number;
  // Test cart
  testProvider: CartProvider | null;
  testItems: CartTestItem[];
  addTest: (item: Omit<CartTestItem, "quantity">, provider: CartProvider) => "added" | "switched" | "conflict";
  removeTest: (id: string) => void;
  updateTestQty: (id: string, qty: number) => void;
  clearTestCart: () => void;
  testTotal: number;
  testCount: number;
  // Conflict dialog state
  conflictInfo: { type: "medicine" | "test"; newProvider: CartProvider; pendingItem: any } | null;
  resolveConflict: (replace: boolean) => void;
}

const CartContext = createContext<CartContextType>({} as CartContextType);
export function useCart() { return useContext(CartContext); }

// ── Provider ──────────────────────────────────────────────────────────────
export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<UserProfile>(defaultUser);
  const setUser = (u: Partial<UserProfile>) => setUserState(p => ({ ...p, ...u }));

  // Medicine cart
  const [medicineProvider, setMedicineProvider] = useState<CartProvider | null>(null);
  const [medicineItems, setMedicineItems] = useState<CartMedicineItem[]>([]);

  // Test cart
  const [testProvider, setTestProvider] = useState<CartProvider | null>(null);
  const [testItems, setTestItems] = useState<CartTestItem[]>([]);

  // Conflict dialog
  const [conflictInfo, setConflictInfo] = useState<CartContextType["conflictInfo"]>(null);

  // Medicine helpers
  const addMedicine = (item: Omit<CartMedicineItem, "quantity">, provider: CartProvider): "added" | "switched" | "conflict" => {
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

  // Test helpers
  const addTest = (item: Omit<CartTestItem, "quantity">, provider: CartProvider): "added" | "switched" | "conflict" => {
    if (testProvider && testProvider.id !== provider.id && testItems.length > 0) {
      setConflictInfo({ type: "test", newProvider: provider, pendingItem: item });
      return "conflict";
    }
    setTestProvider(provider);
    setTestItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) return prev;  // tests: one booking per test
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

  const updateTestQty = (id: string, qty: number) => {
    if (qty <= 0) { removeTest(id); return; }
    setTestItems(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
  };

  const clearTestCart = () => { setTestItems([]); setTestProvider(null); };

  const testTotal = testItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const testCount = testItems.reduce((s, i) => s + i.quantity, 0);

  // Resolve conflict
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
    <UserContext.Provider value={{ user, setUser }}>
      <CartContext.Provider value={{
        medicineProvider, medicineItems, addMedicine, removeMedicine,
        updateMedicineQty, clearMedicineCart, medicineTotal, medicineCount,
        testProvider, testItems, addTest, removeTest,
        updateTestQty, clearTestCart, testTotal, testCount,
        conflictInfo, resolveConflict,
      }}>
        {children}
      </CartContext.Provider>
    </UserContext.Provider>
  );
}