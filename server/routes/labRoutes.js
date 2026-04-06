// server/routes/labRoutes.js
import express from "express";
import {
  addService, changeVisibility, createOrder, deleteLab, editLab, getLab,
  getService, getServices, loginLab, removeService, sendReport, setPassword,
  signUpLab, updateOrderStatus, uploadReport, viewOrders,
} from "../controllers/labController.js";
import { isLabLoggedIn } from "../middlewares/isLoggedIn.js";
import upload from "../config/multer.js";
import labServiceModel from "../models/LabServices.js";

const router = express.Router();

// ── Auth ──────────────────────────────────────────────
router.post("/login", loginLab);
router.post("/signUp", upload.fields([
  { name: "gstFile", maxCount: 1 },
  { name: "licenseFile", maxCount: 1 },
  { name: "nablFile", maxCount: 1 },
]), signUpLab);

// ── Owner-only routes ─────────────────────────────────
router.get("/myLab",               isLabLoggedIn, getLab);
router.post("/editDetails",        isLabLoggedIn, editLab);
router.get("/deleteLab",           isLabLoggedIn, deleteLab);
router.post("/setPassword",        isLabLoggedIn, setPassword);
router.post("/addTest",            isLabLoggedIn, upload.single("image"), addService);
router.get("/tests",               isLabLoggedIn, getServices);
router.get("/test/:id",            isLabLoggedIn, getService);
router.get("/removeTest/:id",      isLabLoggedIn, removeService);
router.get("/changeTestVisibility/:id", isLabLoggedIn, changeVisibility);
router.post("/createOrder",        isLabLoggedIn, createOrder);
router.get("/orders",              isLabLoggedIn, viewOrders);
router.post("/orders/:orderId/status",      isLabLoggedIn, updateOrderStatus);
router.post("/orders/:orderId/report",      isLabLoggedIn, upload.single("report"), uploadReport);
router.post("/orders/:orderId/send-report", isLabLoggedIn, sendReport);

// ── PUBLIC — used by the user app to browse services ─
// GET /api/lab/tests/public/:labId
router.get("/tests/public/:labId", async (req, res) => {
  try {
    const tests = await labServiceModel.find({
      labId: req.params.labId,
      visibility: true,
    });
    res.json({ success: true, tests });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

export default router;