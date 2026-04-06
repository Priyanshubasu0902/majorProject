// server/routes/pharmacyRoutes.js
import express from "express";
import {
  addProduct, changeVisibility, createOrder, decrementQuantity, deletePharmacy,
  editPharmacy, getPharmacy, getProduct, getProducts, incrementQuantity,
  loginPharmacy, removeProduct, setPassword, signUpPharmacy, viewOrders,
  updateOrderStatus,
} from '../controllers/pharmacyController.js';
import { isPharmacyLoggedIn } from "../middlewares/isLoggedIn.js";
import upload from '../config/multer.js';
import pharmacyProductModel from "../models/PharmacyProduct.js";

const router = express.Router();

// ── Auth ──────────────────────────────────────────────
router.post("/login", loginPharmacy);
router.post("/signUp", upload.fields([
  { name: "gstFile", maxCount: 1 },
  { name: "licenseFile", maxCount: 1 },
  { name: "nablFile", maxCount: 1 },
]), signUpPharmacy);

// ── Owner-only routes ─────────────────────────────────
router.get("/myPharmacy",           isPharmacyLoggedIn, getPharmacy);
router.post("/editDetails",         isPharmacyLoggedIn, editPharmacy);
router.get("/deletePharmacy",       isPharmacyLoggedIn, deletePharmacy);
router.post("/setPassword",         isPharmacyLoggedIn, setPassword);
router.post("/addProduct",          isPharmacyLoggedIn, upload.single("image"), addProduct);
router.get("/products",             isPharmacyLoggedIn, getProducts);
router.get("/product/:id",          isPharmacyLoggedIn, getProduct);
router.get("/removeProduct/:id",    isPharmacyLoggedIn, removeProduct);
router.get("/changeProductVisibility/:id", isPharmacyLoggedIn, changeVisibility);
router.get("/incrementQuantity/:id", isPharmacyLoggedIn, incrementQuantity);
router.get("/decrementQuantity/:id", isPharmacyLoggedIn, decrementQuantity);
router.post("/createOrder",         isPharmacyLoggedIn, createOrder);
router.get("/orders",               isPharmacyLoggedIn, viewOrders);
router.post("/updateOrderStatus/:orderId", isPharmacyLoggedIn, updateOrderStatus);

// ── PUBLIC — used by the user app to browse products ─
// GET /api/pharmacy/products/public/:pharmacyId
router.get("/products/public/:pharmacyId", async (req, res) => {
  try {
    const products = await pharmacyProductModel.find({
      pharmacyId: req.params.pharmacyId,
      visibility: true,
    });
    res.json({ success: true, products });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

export default router;