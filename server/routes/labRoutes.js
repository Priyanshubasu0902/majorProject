import express from "express";
import { addService, changeVisibility, createOrder, deleteLab, editLab, getLab, getService, getServices, loginLab, removeService, setPassword, signUpLab, viewOrders } from "../controllers/labController.js";
import { isLabLoggedIn } from "../middlewares/isLoggedIn.js";
import upload from "../config/multer.js";

const router = express.Router();

// Login lab
router.post("/login",loginLab);

// Sign up lab
router.post("/signUp", upload.fields([
    { name: "gstFile", maxCount: 1 },
    { name: "licenseFile", maxCount: 1 },
    { name: "nablFile", maxCount: 1 }
  ]), signUpLab);

// Get lab data by owner
router.get("/myLab", isLabLoggedIn , getLab);

// Edit lab details
router.post("/editDetails", isLabLoggedIn, editLab);

// Delete lab
router.get("/deleteLab", isLabLoggedIn, deleteLab);

// Set Password
router.post('/setPassword', isLabLoggedIn, setPassword);

// Add Services
router.post('/addTest', isLabLoggedIn, upload.single('image'), addService);

// Get Services
router.get("/tests" , isLabLoggedIn, getServices);

// Get a particular particular service
router.get('/test/:id', isLabLoggedIn, getService);

// Delete a particular service
router.get('/removeTest/:id', isLabLoggedIn, removeService);

// Change Visibility of a particular service
router.get('/changeTestVisibility/:id', isLabLoggedIn, changeVisibility);

router.post('/createOrder', isLabLoggedIn, createOrder);

router.get('/orders', isLabLoggedIn, viewOrders);

export default router;
