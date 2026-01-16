import { Routes, Route } from "react-router-dom";
import MedLuxHome from "./home";
import BusinessType from "./lab/businessType";
import ScanReport from "./pages/ScanReport";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<MedLuxHome />} />
      <Route path="/partner/apply" element={<BusinessType />} />
      <Route path="/scanreport" element={<ScanReport />} />
    </Routes>
  );
};

export default App;
