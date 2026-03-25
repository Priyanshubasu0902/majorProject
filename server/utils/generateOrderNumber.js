import pharmacyOrderModel from "../models/PharmacyOrders.js";
import mongoose from "mongoose";

export const pharmacyOrderNo = async (pharmacy, channel) => {
  const pharmacyInitials = pharmacy.name
    .split(" ")
    .map((word) => word[0].toUpperCase())
    .join("")
    .slice(0, 3);

  // Channel tag
  const channelTag = channel === "instore" ? "IS" : "ON";

  // Date + time stamp: YYYYMMDD-HHMM
  const now = new Date();
  const dateTag = now.toISOString().slice(0, 10).replace(/-/g, ""); // "20260310"
  const timeTag = now.toTimeString().slice(0, 5).replace(":", ""); // "1423"

  // Sequential count for THIS pharmacy today (zero-padded to 4 digits)
  const countToday = await pharmacyOrderModel
    .countDocuments({
      "pharmacy.pharmacyId": new mongoose.Types.ObjectId(pharmacy._id),
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    })

  const sequence = String(countToday + 1).padStart(4, "0");

  // Final format: MP-IS-20260310-1423-0001
  const orderNumber = `${pharmacyInitials}-${channelTag}-${dateTag}-${timeTag}-${sequence}`;

  return orderNumber;
};
