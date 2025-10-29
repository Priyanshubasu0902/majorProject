import jwt from 'jsonwebtoken'
import userModel from '../models/User.js';

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