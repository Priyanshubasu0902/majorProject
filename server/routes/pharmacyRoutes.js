import express from "express";
import { deletePharmacy, editPharmacy, getPharmacy, getPharmacyByUser, loginPharmacy, setPassword, signUpPharmacy } from '../controllers/pharmacyController.js'
import { isLoggedIn, isPharmacyLoggedIn } from "../middlewares/isLoggedIn.js";

const router = express.Router();

// Login pharmacy
router.post("/login",loginPharmacy);

// Sign up pharmacy
router.post("/signUp", signUpPharmacy);

// Get pharmacy data by owner
router.get("/myPharmacy" , isPharmacyLoggedIn, getPharmacy);

// Get pharmacy data by user
router.get("/:id", isLoggedIn , getPharmacyByUser);

// Edit pharmacy details
router.post("/editDetails", isLoggedIn, editPharmacy);

// Delete Pharmacy
router.get("/deletePharmacy", isLoggedIn, deletePharmacy);

// Set Password
router.post('/setPassword', isLoggedIn, setPassword);

export default router;
