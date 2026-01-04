import express from "express";
import { deleteDoctor, editDoctor, getDoctor, getDoctorByUser, loginDoctor, setPassword, signUpDoctor } from "../controllers/doctorController.js";
import { isDoctorLoggedIn, isLoggedIn } from "../middlewares/isLoggedIn.js";

const router = express.Router();

// Login user
router.post("/login",loginDoctor);

// Sign up user
router.post("/signUp", signUpDoctor);

// Get user data
router.get("/user", isDoctorLoggedIn , getDoctor);

// Get user data
router.get("/:id", isLoggedIn , getDoctorByUser);

// Edit user details
router.post("/editDetails", isLoggedIn, editDoctor);

// Delete User
router.get("/deleteDoctor", isLoggedIn, deleteDoctor);

// Set Password
router.post('/setPassword', isLoggedIn, setPassword);

export default router;