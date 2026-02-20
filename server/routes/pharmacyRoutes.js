import express from "express";
import upload from '../config/multer.js';
import { addProduct, changeVisibility, deletePharmacy, editPharmacy, getPharmacy, getProduct, getProducts, loginPharmacy, removeProduct, setPassword, signUpPharmacy } from '../controllers/pharmacyController.js'
import { isPharmacyLoggedIn } from "../middlewares/isLoggedIn.js";

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

// Edit pharmacy details
router.post("/editDetails", isPharmacyLoggedIn, editPharmacy);

// Delete Pharmacy
router.get("/deletePharmacy", isPharmacyLoggedIn, deletePharmacy);

// Set Password
router.post('/setPassword', isPharmacyLoggedIn, setPassword);

// Add Product
router.post('/addProduct', isPharmacyLoggedIn, upload.single('image'), addProduct);

// Get products
router.get("/products" , isPharmacyLoggedIn, getProducts);

// Get a particular product
router.get('/product/:id', isPharmacyLoggedIn, getProduct);

// Delete a particular product
router.get('/removeProduct/:id', isPharmacyLoggedIn, removeProduct);

// Change Visibility of a particular product
router.post('/changeProductVisibility/:id', isPharmacyLoggedIn, changeVisibility);

export default router;
