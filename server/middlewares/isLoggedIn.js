import jwt from 'jsonwebtoken'
import userModel from '../models/User.js';
import pharmacyModel from '../models/Pharmacies.js';
import labModel from '../models/Labs.js'
import doctorModel from '../models/Doctors.js'

export const isLoggedIn = async (req, res, next) => {
   const token = req.headers.token;
   if(!token) {
      return res.json({success: false, message: "Not authorized, Login Again"})
   }

   try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      req.user = await userModel.findById(decoded.id).select("-password");
      next()
      
   } catch (error) {
      res.json({success: false, message: error.message})
   }
}

export const isPharmacyLoggedIn = async (req, res, next) => {
   const token = req.headers.token;
   if(!token) {
      return res.json({success: false, message: "Not authorized, Login Again"})
   }

   try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      req.pharmacy = await pharmacyModel.findById(decoded.id).select("-password");
      next()
      
   } catch (error) {
      res.json({success: false, message: error.message})
   }
}
export const isLabLoggedIn = async (req, res, next) => {
   const token = req.headers.token;
   if(!token) {
      return res.json({success: false, message: "Not authorized, Login Again"})
   }

   try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      req.lab = await labModel.findById(decoded.id).select("-password");
      next()
      
   } catch (error) {
      res.json({success: false, message: error.message})
   }
}

export const isDoctorLoggedIn = async (req, res, next) => {
   const token = req.headers.token;
   if(!token) {
      return res.json({success: false, message: "Not authorized, Login Again"})
   }

   try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      req.doctor = await doctorModel.findById(decoded.id).select("-password");
      next()
      
   } catch (error) {
      res.json({success: false, message: error.message})
   }
}