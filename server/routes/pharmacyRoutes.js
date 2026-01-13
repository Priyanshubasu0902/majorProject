import express from "express";
import upload from '../config/multer.js';
import { addProduct, deletePharmacy, editPharmacy, getPharmacy, getPharmacyByUser, loginPharmacy, setPassword, signUpPharmacy } from '../controllers/pharmacyController.js'
import { isLoggedIn, isPharmacyLoggedIn } from "../middlewares/isLoggedIn.js";

const router = express.Router();

// Login pharmacy
router.post("/login",loginPharmacy);

// Sign up pharmacy
router.post("/signUp", upload.fields([
    { name: "gstFile", maxCount: 1 },
    { name: "licenseFile", maxCount: 1 },
    { name: "nablFile", maxCount: 1 }
  ]), signUpPharmacy);

// Get pharmacy data by owner
router.get("/myPharmacy" , isPharmacyLoggedIn, getPharmacy);

// Get pharmacy data by user
router.get("/:id", isLoggedIn, getPharmacyByUser);

// Edit pharmacy details
router.post("/editDetails", isPharmacyLoggedIn, editPharmacy);

// Delete Pharmacy
router.get("/deletePharmacy", isLoggedIn, deletePharmacy);

// Set Password
router.post('/setPassword', isPharmacyLoggedIn, setPassword);

// Add Product
router.post('/addProduct', isPharmacyLoggedIn, upload.single('image'), addProduct);

export default router;
