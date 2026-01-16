import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
// import { PharmacyProvider } from "./context/PharmacyContext";
import App from "./App";
import "./index.css";


ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
    {/* <PharmacyProvider> */}
        <App />
    {/* </PharmacyProvider> */}
    </BrowserRouter>
  </React.StrictMode>
);
