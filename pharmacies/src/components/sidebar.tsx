import { NavLink } from "react-router-dom";

const Sidebar = () => {
  return (
    <aside className="w-64 min-h-screen bg-white border-r border-slate-200 px-6 py-8">
      <h2 className="text-lg font-semibold text-emerald-600 mb-8">
        Menu
      </h2>

      <nav className="space-y-2 text-sm">
        <NavItem to="/dashboard">Dashboard</NavItem>
        <NavItem to="/addproduct">Add Product</NavItem>
        <NavItem to="/products">View Products</NavItem>
        <NavItem to="/orders">Orders</NavItem>
        <NavItem to="/profile">Profile</NavItem>
      </nav>
    </aside>
  );
};

const NavItem = ({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `block rounded-xl px-4 py-2 transition ${
        isActive
          ? "bg-emerald-100 text-emerald-700 font-medium"
          : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
      }`
    }
  >
    {children}
  </NavLink>
);

export default Sidebar;
