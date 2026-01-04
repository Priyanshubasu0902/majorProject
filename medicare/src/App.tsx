import { Routes, Route } from "react-router-dom";
import Home from "./home";
import Pharmalog from "./lab/pharmalog";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/partner/apply" element={<Pharmalog />} />
    </Routes>
  );
};

export default App;
