import express from "express";
import { addProduct, changeVisibility, createOrder, decrementQuantity, deletePharmacy, editPharmacy, getPharmacy, getProduct, getProducts, incrementQuantity, loginPharmacy, removeProduct, setPassword, signUpPharmacy, viewOrders } from '../controllers/pharmacyController.js'
import { isPharmacyLoggedIn } from "../middlewares/isLoggedIn.js";
import upload from '../config/multer.js';

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
router.get('/changeProductVisibility/:id', isPharmacyLoggedIn, changeVisibility);

router.get('/incrementQuantity/:id', isPharmacyLoggedIn, incrementQuantity);

router.get('/decrementQuantity/:id', isPharmacyLoggedIn, decrementQuantity);

router.post('/createOrder', isPharmacyLoggedIn, createOrder);

router.get('/orders', isPharmacyLoggedIn, viewOrders )

export default router;
