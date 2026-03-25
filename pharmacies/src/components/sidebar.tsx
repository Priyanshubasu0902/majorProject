// src/components/sidebar.tsx
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  PackagePlus,
  Package,
  ClipboardList,
  User,
  ShoppingCart,
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/dashboard",    label: "Dashboard",     icon: LayoutDashboard },
  { to: "/addproduct",   label: "Add Product",   icon: PackagePlus     },
  { to: "/products",     label: "View Products", icon: Package         },
  { to: "/orders",       label: "Orders",        icon: ClipboardList   },
  { to: "/create-order", label: "Create Order",  icon: ShoppingCart    },
  { to: "/profile",      label: "Profile",       icon: User            },
];

const Sidebar = () => {
  return (
    <aside className="w-64 min-h-screen bg-white border-r border-slate-200 px-4 py-8 flex flex-col">
      <h2 className="text-lg font-semibold text-emerald-600 mb-8 px-2">Menu</h2>

      <nav className="space-y-1 text-sm flex-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-2.5 transition font-medium ${
                isActive
                  ? "bg-emerald-100 text-emerald-700"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={16}
                  className={isActive ? "text-emerald-600" : "text-slate-400"}
                />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;