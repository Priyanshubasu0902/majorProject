import { Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar";
import Sidebar from "./components/sidebar";
import Footer from "./components/Footer";

import Dashboard from "./pages/Dashboard";
import AddProduct from "./pages/AddProducts";
import ViewProducts from "./pages/ViewProducts";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";
import Join from "./pages/join";
import { PharmacyRoute } from "./routes/PharmacyRoute";
import { PharmacyProvider } from "./context/PharmacyContext";

const App = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      <PharmacyProvider>
        <Routes>
          {/* ✅ PUBLIC ROUTE */}
          <Route path="/pharmacy/login" element={<Join />} />

          {/* ✅ PROTECTED ROUTES */}
          <Route
            path="/*"
            element={
              <>
                <Navbar />
                <div className="flex">
                  <Sidebar />
                  <main className="flex-1 p-10 bg-slate-50">
                    <Routes>
                      <Route
                        path="/"
                        element={
                          <PharmacyRoute>
                            <Dashboard />
                          </PharmacyRoute>
                        }
                      />
                      <Route
                        path="/addproduct"
                        element={
                          <PharmacyRoute>
                            <AddProduct />
                          </PharmacyRoute>
                        }
                      />
                      <Route
                        path="/products"
                        element={
                          <PharmacyRoute>
                            <ViewProducts />
                          </PharmacyRoute>
                        }
                      />
                      <Route
                        path="/orders"
                        element={
                          <PharmacyRoute>
                            <Orders />
                          </PharmacyRoute>
                        }
                      />
                      <Route
                        path="/profile"
                        element={
                          <PharmacyRoute>
                            <Profile />
                          </PharmacyRoute>
                        }
                      />
                    </Routes>
                  </main>
                </div>
                <Footer />
              </>
            }
          />
        </Routes>
      </PharmacyProvider>
    </div>
  );
};

export default App;
