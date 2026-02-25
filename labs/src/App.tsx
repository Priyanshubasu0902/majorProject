import { Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar";
import Sidebar from "./components/sidebar";
import Footer from "./components/Footer";

import Dashboard from "./pages/Dashboard";
import AddProduct from "./pages/AddTests";
import ViewProducts from "./pages/ViewTests";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";
import Join from "./pages/join";
import { LabRoute} from "./route/LabRoute";
import { LabProvider } from "./context/LabContext";

const App = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      <LabProvider>
        <Routes>
          {/* PUBLIC ROUTE */}
          <Route path="/lab/login" element={<Join />} />

          {/*PROTECTED ROUTES */}
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
                        path="/dashboard"
                        element={
                          <LabRoute>
                            <Dashboard />
                          </LabRoute>
                        }
                      />
                      <Route
                        path="/addproduct"
                        element={
                          <LabRoute>
                            <AddProduct />
                          </LabRoute>
                        }
                      />
                      <Route
                        path="/products"
                        element={
                          <LabRoute>
                            <ViewProducts />
                          </LabRoute>
                        }
                      />
                      <Route
                        path="/orders"
                        element={
                          // <PharmacyRoute>
                            <Orders />
                          // </PharmacyRoute>
                        }
                      />
                      <Route
                        path="/profile"
                        element={
                          // <LabRoute>
                            <Profile />
                          // </LabRoute>
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
      </LabProvider>
    </div>
  );
};

export default App;
