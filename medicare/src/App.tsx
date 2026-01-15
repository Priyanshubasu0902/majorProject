import { Routes, Route } from "react-router-dom";
import MedLuxHome from "./home";
import Pharmalog from "./lab/pharmalog";
import ScanReport from "./pages/ScanReport";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<MedLuxHome />} />
      <Route path="/partner/apply" element={<Pharmalog />} />
      <Route path="/scanreport" element={<ScanReport />} />
    </Routes>
  );
};

export default App;
