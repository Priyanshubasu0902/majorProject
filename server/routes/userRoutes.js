// server/routes/userRoutes.js
import express from "express";
import upload from "../config/multer.js";
import { isLoggedIn } from "../middlewares/isLoggedIn.js";
import {
  signUpUser,
  loginUser,
  getUser,
  editUser,
  deleteUser,
  setPassword,
  addAddress,
  updateAddress,
  removeAddress,
  getAddresses,
  addToPharmacyCart,
  removeFromPharmacyCart,
  updatePharmacyCartItem,
  clearPharmacyCart,
  getPharmacyCart,
  addToLabCart,
  removeFromLabCart,
  updateLabCartItem,
  clearLabCart,
  getLabCart,
  placePharmacyOrder,
  getUserPharmacyOrders,
  placeLabOrder,
  getUserLabOrders,
  getNearbyPharmacies,
  getNearbyLabs,
} from "../controllers/userController.js";

const router = express.Router();

// ── Auth ──────────────────────────────────────────────
router.post("/login",  loginUser);
router.post("/signUp", upload.single("profileImage"), signUpUser);

// ── Profile ───────────────────────────────────────────
router.get("/user",          isLoggedIn, getUser);
router.post("/editDetails",  isLoggedIn, upload.single("profileImage"), editUser);
router.get("/deleteUser",    isLoggedIn, deleteUser);
router.post("/setPassword",  isLoggedIn, setPassword);

// ── Addresses ─────────────────────────────────────────
router.get("/addresses",               isLoggedIn, getAddresses);
router.post("/address",                isLoggedIn, addAddress);
router.put("/address/:addressId",      isLoggedIn, updateAddress);
router.delete("/address/:addressId",   isLoggedIn, removeAddress);

// ── Pharmacy cart ─────────────────────────────────────
router.get("/pharmacy-cart",                         isLoggedIn, getPharmacyCart);
router.post("/pharmacy-cart/add",                    isLoggedIn, addToPharmacyCart);
router.delete("/pharmacy-cart/remove/:medicineId",   isLoggedIn, removeFromPharmacyCart);
router.put("/pharmacy-cart/update/:medicineId",      isLoggedIn, updatePharmacyCartItem);
router.delete("/pharmacy-cart/clear",                isLoggedIn, clearPharmacyCart);

// ── Lab cart ──────────────────────────────────────────
router.get("/lab-cart",                          isLoggedIn, getLabCart);
router.post("/lab-cart/add",                     isLoggedIn, addToLabCart);
router.delete("/lab-cart/remove/:serviceId",     isLoggedIn, removeFromLabCart);
router.put("/lab-cart/update/:serviceId",        isLoggedIn, updateLabCartItem);
router.delete("/lab-cart/clear",                 isLoggedIn, clearLabCart);

// ── Pharmacy orders ───────────────────────────────────
router.post("/pharmacy-order/place",  isLoggedIn, placePharmacyOrder);
router.get("/pharmacy-orders",        isLoggedIn, getUserPharmacyOrders);

// ── Lab orders ────────────────────────────────────────
router.post("/lab-order/place",  isLoggedIn, placeLabOrder);
router.get("/lab-orders",        isLoggedIn, getUserLabOrders);

// ── Nearby discovery ──────────────────────────────────
// GET /api/user/nearby/pharmacies?lat=22.5&lng=88.3&radius=5000
router.get("/nearby/pharmacies", isLoggedIn, getNearbyPharmacies);
// GET /api/user/nearby/labs?lat=22.5&lng=88.3&radius=5000
router.get("/nearby/labs",       isLoggedIn, getNearbyLabs);

export default router;