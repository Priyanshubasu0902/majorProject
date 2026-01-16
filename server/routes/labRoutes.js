import express from "express";
import { deleteLab, editLab, getLab, getLabByUser, loginLab, setPassword, signUpLab } from "../controllers/labController.js";
import { isLoggedIn, isLabLoggedIn } from "../middlewares/isLoggedIn.js";
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

// Get lab data by lab
router.get("/:id", isLoggedIn , getLabByUser);

// Edit lab details
router.post("/editDetails", isLoggedIn, editLab);

// Delete lab
router.get("/deleteLab", isLoggedIn, deleteLab);

// Set Password
router.post('/setPassword', isLoggedIn, setPassword);

export default router;
