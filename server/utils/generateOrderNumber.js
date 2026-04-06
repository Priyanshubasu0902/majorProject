// server/utils/generateOrderNumber.js
import pharmacyOrderModel from "../models/PharmacyOrders.js";
import labOrderModel from "../models/LabOrders.js";
import mongoose from "mongoose";

export const pharmacyOrderNo = async (pharmacy, channel) => {
  const pharmacyInitials = pharmacy.name
    .split(" ")
    .map((word) => word[0].toUpperCase())
    .join("")
    .slice(0, 3);

  const channelTag = channel === "instore" ? "IS" : "ON";

  const now = new Date();
  const dateTag = now.toISOString().slice(0, 10).replace(/-/g, "");
  const timeTag = now.toTimeString().slice(0, 5).replace(":", "");

  const countToday = await pharmacyOrderModel.countDocuments({
    "pharmacy.pharmacyId": new mongoose.Types.ObjectId(pharmacy._id),
    createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
  });

  const sequence = String(countToday + 1).padStart(4, "0");
  return `${pharmacyInitials}-${channelTag}-${dateTag}-${timeTag}-${sequence}`;
};

export const labOrderNo = async (lab, channel) => {
  // Lab initials — first letter of each word, max 3 chars
  // e.g. "City Diagnostic Centre" → "CDC", "Thyrocare" → "THY"
  const labInitials = lab.name
    .split(" ")
    .map((word) => word[0].toUpperCase())
    .join("")
    .slice(0, 3);

  // Channel tag
  const channelTag = channel === "inclinic" ? "IC" : "ON";

  // Date + time stamp: YYYYMMDD-HHMM
  const now = new Date();
  const dateTag = now.toISOString().slice(0, 10).replace(/-/g, ""); // "20260310"
  const timeTag = now.toTimeString().slice(0, 5).replace(":", "");   // "1423"

  // Sequential count for THIS lab today
  const countToday = await labOrderModel.countDocuments({
    "lab.labId": new mongoose.Types.ObjectId(lab._id),
    createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
  });

  const sequence = String(countToday + 1).padStart(4, "0");

  // Final format: CDC-IC-20260310-1423-0001
  return `${labInitials}-${channelTag}-${dateTag}-${timeTag}-${sequence}`;
};