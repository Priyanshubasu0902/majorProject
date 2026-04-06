// server/controllers/userController.js
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import userModel from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import pharmacyProductModel from "../models/PharmacyProduct.js";
import pharmacyOrderModel from "../models/PharmacyOrders.js";
import pharmacyModel from "../models/Pharmacies.js";
import labModel from "../models/Labs.js";
import labServiceModel from "../models/LabServices.js";
import labOrderModel from "../models/LabOrders.js";
import { pharmacyOrderNo, labOrderNo } from "../utils/generateOrderNumber.js";
import { geocodeAddress } from "../utils/geocode.js";
import mongoose from "mongoose";

// ─────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────

export const signUpUser = async (req, res) => {
  const { name, email, number, age, gender, password } = req.body;

  if (!name || !email || !number || !age || !gender || !password) {
    return res.json({ success: false, message: "Missing Details" });
  }

  try {
    const userExists = await userModel.findOne({ $or: [{ number }, { email }] });
    if (userExists) {
      return res.json({ success: false, message: "User already exists" });
    }

    let profileImage = "";
    if (req.file) {
      const uploaded = await cloudinary.uploader.upload(req.file.path);
      profileImage = uploaded.secure_url;
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const user = await userModel.create({
      name,
      number,
      age,
      gender,
      password: hashPassword,
      email,
      profileImage,
      addresses: [],
      pharmacyCart: [],
      labCart: [],
    });

    res.json({
      success: true,
      user: _safeUser(user),
      token: generateToken(user._id),
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const loginUser = async (req, res) => {
  const { number, email, password } = req.body;

  if (!password) {
    return res.json({ success: false, message: "Missing Details" });
  }

  try {
    let user = null;
    if (number) {
      user = await userModel.findOne({ number });
    } else if (email) {
      user = await userModel.findOne({ email });
    } else {
      return res.json({ success: false, message: "Missing Details" });
    }

    if (!user) return res.json({ success: false, message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.json({ success: false, message: "Invalid credentials" });

    res.json({
      success: true,
      user: _safeUser(user),
      token: generateToken(user._id),
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getUser = async (req, res) => {
  try {
    res.json({ success: true, user: req.user });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const deleted = await userModel.findByIdAndDelete(req.user._id);
    if (!deleted) return res.json({ success: false, message: "User not found" });
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const editUser = async (req, res) => {
  const { name, email, age, gender } = req.body;

  try {
    if (email) {
      const conflict = await userModel.findOne({ _id: { $ne: req.user._id }, email });
      if (conflict) return res.json({ success: false, message: "Email already in use" });
    }

    let profileImageUpdate = {};
    if (req.file) {
      const uploaded = await cloudinary.uploader.upload(req.file.path);
      profileImageUpdate = { profileImage: uploaded.secure_url };
    }

    const updatedUser = await userModel.findByIdAndUpdate(
      req.user._id,
      {
        ...(name && { name }),
        ...(email && { email }),
        ...(age && { age }),
        ...(gender && { gender }),
        ...profileImageUpdate,
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) return res.json({ success: false, message: "User not found" });

    res.json({ success: true, message: "User updated successfully", user: _safeUser(updatedUser) });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const setPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.json({ success: false, message: "Missing Details" });
  }

  try {
    const user = await userModel.findById(req.user._id);
    if (!user) return res.json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.json({ success: false, message: "Old password is incorrect" });

    if (newPassword.length < 6) {
      return res.json({ success: false, message: "Password must be at least 6 characters" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// ADDRESSES — geocode each address on save
// ─────────────────────────────────────────────

export const addAddress = async (req, res) => {
  const { label, line1, line2, city, state, pincode, country, isDefault } = req.body;

  if (!line1 || !city || !state || !pincode) {
    return res.json({ success: false, message: "Missing required address fields" });
  }

  try {
    const user = await userModel.findById(req.user._id);
    if (!user) return res.json({ success: false, message: "User not found" });

    if (isDefault) {
      user.addresses.forEach((addr) => (addr.isDefault = false));
    }

    // ── Geocode the address to store coordinates ──────────
    let coordinates = undefined;
    try {
      const fullAddress = `${line1}, ${city}, ${state}, ${pincode}, ${country || "India"}`;
      const coords = await geocodeAddress(fullAddress);
      coordinates = [coords.lng, coords.lat];
    } catch {
      // Geocoding is best-effort — don't block address saving if it fails
    }

    user.addresses.push({
      label: label || "Home",
      line1,
      line2: line2 || "",
      city,
      state,
      pincode,
      country: country || "India",
      isDefault: isDefault ?? user.addresses.length === 0,
      ...(coordinates && {
        location: { type: "Point", coordinates },
      }),
    });

    await user.save();

    res.json({ success: true, message: "Address added successfully", addresses: user.addresses });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const updateAddress = async (req, res) => {
  const { addressId } = req.params;
  const { label, line1, line2, city, state, pincode, country, isDefault } = req.body;

  try {
    const user = await userModel.findById(req.user._id);
    if (!user) return res.json({ success: false, message: "User not found" });

    const addr = user.addresses.id(addressId);
    if (!addr) return res.json({ success: false, message: "Address not found" });

    if (isDefault) user.addresses.forEach((a) => (a.isDefault = false));

    if (label !== undefined) addr.label = label;
    if (line1 !== undefined) addr.line1 = line1;
    if (line2 !== undefined) addr.line2 = line2;
    if (city !== undefined) addr.city = city;
    if (state !== undefined) addr.state = state;
    if (pincode !== undefined) addr.pincode = pincode;
    if (country !== undefined) addr.country = country;
    if (isDefault !== undefined) addr.isDefault = isDefault;

    // Re-geocode if any address field changed
    const addressChanged = line1 || city || state || pincode;
    if (addressChanged) {
      try {
        const fullAddress = `${addr.line1}, ${addr.city}, ${addr.state}, ${addr.pincode}, ${addr.country}`;
        const coords = await geocodeAddress(fullAddress);
        addr.location = { type: "Point", coordinates: [coords.lng, coords.lat] };
      } catch {
        // best-effort
      }
    }

    await user.save();

    res.json({ success: true, message: "Address updated successfully", addresses: user.addresses });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const removeAddress = async (req, res) => {
  const { addressId } = req.params;

  try {
    const user = await userModel.findById(req.user._id);
    if (!user) return res.json({ success: false, message: "User not found" });

    const addrIndex = user.addresses.findIndex((a) => a._id.toString() === addressId);
    if (addrIndex === -1) return res.json({ success: false, message: "Address not found" });

    user.addresses.splice(addrIndex, 1);

    if (user.addresses.length > 0 && !user.addresses.some((a) => a.isDefault)) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    res.json({ success: true, message: "Address removed successfully", addresses: user.addresses });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getAddresses = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id).select("addresses");
    res.json({ success: true, addresses: user.addresses });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// NEARBY DISCOVERY
// ─────────────────────────────────────────────

/**
 * GET /user/nearby/pharmacies?lat=22.5&lng=88.3&radius=5000
 * Returns approved pharmacies sorted by distance.
 * radius is in metres, default 5 km.
 */
export const getNearbyPharmacies = async (req, res) => {
  const { lat, lng, radius = 5000 } = req.query;

  if (!lat || !lng) {
    return res.json({ success: false, message: "lat and lng query params are required" });
  }

  try {
    const pharmacies = await pharmacyModel.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
          distanceField: "distance",    // metres
          maxDistance: parseInt(radius),
          spherical: true,
          query: { isApproved: true },
        },
      },
      {
        $project: {
          password: 0,
          gstFile: 0,
          licenseFile: 0,
          nablFile: 0,
        },
      },
    ]);

    res.json({ success: true, pharmacies });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/**
 * GET /user/nearby/labs?lat=22.5&lng=88.3&radius=5000
 * Returns approved labs sorted by distance.
 */
export const getNearbyLabs = async (req, res) => {
  const { lat, lng, radius = 5000 } = req.query;

  if (!lat || !lng) {
    return res.json({ success: false, message: "lat and lng query params are required" });
  }

  try {
    const labs = await labModel.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
          distanceField: "distance",
          maxDistance: parseInt(radius),
          spherical: true,
          query: { isApproved: true },
        },
      },
      {
        $project: {
          password: 0,
          gstFile: 0,
          licenseFile: 0,
          nablFile: 0,
        },
      },
    ]);

    res.json({ success: true, labs });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// PHARMACY CART
// ─────────────────────────────────────────────

export const addToPharmacyCart = async (req, res) => {
  const { medicineId, quantity, pharmacyId } = req.body;

  if (!medicineId || !pharmacyId) {
    return res.json({ success: false, message: "Missing medicineId or pharmacyId" });
  }

  try {
    const user = await userModel.findById(req.user._id);
    if (!user) return res.json({ success: false, message: "User not found" });

    const hasDifferentPharmacy = user.pharmacyCart.some(
      (item) => item.pharmacyId.toString() !== pharmacyId
    );
    if (hasDifferentPharmacy) {
      return res.json({
        success: false,
        message: "Your cart already has items from another pharmacy. Please clear it before adding from a new one.",
      });
    }

    const existingItem = user.pharmacyCart.find(
      (item) => item.medicineId.toString() === medicineId
    );

    if (existingItem) {
      existingItem.quantity += quantity ?? 1;
    } else {
      user.pharmacyCart.push({ medicineId, pharmacyId, quantity: quantity ?? 1 });
    }

    await user.save();

    res.json({ success: true, message: "Item added to pharmacy cart", pharmacyCart: user.pharmacyCart });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const removeFromPharmacyCart = async (req, res) => {
  const { medicineId } = req.params;

  try {
    const user = await userModel.findById(req.user._id);
    if (!user) return res.json({ success: false, message: "User not found" });

    const index = user.pharmacyCart.findIndex((item) => item.medicineId.toString() === medicineId);
    if (index === -1) return res.json({ success: false, message: "Item not found in cart" });

    user.pharmacyCart.splice(index, 1);
    await user.save();

    res.json({ success: true, message: "Item removed from pharmacy cart", pharmacyCart: user.pharmacyCart });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const updatePharmacyCartItem = async (req, res) => {
  const { medicineId } = req.params;
  const { quantity } = req.body;

  if (quantity === undefined) {
    return res.json({ success: false, message: "quantity is required" });
  }

  try {
    const user = await userModel.findById(req.user._id);
    if (!user) return res.json({ success: false, message: "User not found" });

    const item = user.pharmacyCart.find((i) => i.medicineId.toString() === medicineId);
    if (!item) return res.json({ success: false, message: "Item not found in cart" });

    if (quantity <= 0) {
      user.pharmacyCart = user.pharmacyCart.filter((i) => i.medicineId.toString() !== medicineId);
    } else {
      item.quantity = quantity;
    }

    await user.save();

    res.json({ success: true, message: "Pharmacy cart updated", pharmacyCart: user.pharmacyCart });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const clearPharmacyCart = async (req, res) => {
  try {
    await userModel.findByIdAndUpdate(req.user._id, { pharmacyCart: [] });
    res.json({ success: true, message: "Pharmacy cart cleared" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getPharmacyCart = async (req, res) => {
  try {
    const user = await userModel
      .findById(req.user._id)
      .select("pharmacyCart")
      .populate("pharmacyCart.medicineId")
      .populate("pharmacyCart.pharmacyId", "name address number");

    res.json({ success: true, pharmacyCart: user.pharmacyCart });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// LAB CART
// ─────────────────────────────────────────────

export const addToLabCart = async (req, res) => {
  const { serviceId, labId, scheduledDate, scheduledSlot } = req.body;

  if (!serviceId || !labId) {
    return res.json({ success: false, message: "Missing serviceId or labId" });
  }

  try {
    const user = await userModel.findById(req.user._id);
    if (!user) return res.json({ success: false, message: "User not found" });

    const hasDifferentLab = user.labCart.some((item) => item.labId.toString() !== labId);
    if (hasDifferentLab) {
      return res.json({
        success: false,
        message: "Your cart already has tests from another lab. Please clear it before adding from a new one.",
      });
    }

    const alreadyAdded = user.labCart.find((item) => item.serviceId.toString() === serviceId);
    if (alreadyAdded) {
      return res.json({ success: false, message: "Service already in lab cart" });
    }

    user.labCart.push({
      serviceId,
      labId,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
      scheduledSlot: scheduledSlot || "",
    });

    await user.save();

    res.json({ success: true, message: "Service added to lab cart", labCart: user.labCart });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const removeFromLabCart = async (req, res) => {
  const { serviceId } = req.params;

  try {
    const user = await userModel.findById(req.user._id);
    if (!user) return res.json({ success: false, message: "User not found" });

    const index = user.labCart.findIndex((item) => item.serviceId.toString() === serviceId);
    if (index === -1) return res.json({ success: false, message: "Service not found in cart" });

    user.labCart.splice(index, 1);
    await user.save();

    res.json({ success: true, message: "Service removed from lab cart", labCart: user.labCart });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const updateLabCartItem = async (req, res) => {
  const { serviceId } = req.params;
  const { scheduledDate, scheduledSlot } = req.body;

  try {
    const user = await userModel.findById(req.user._id);
    if (!user) return res.json({ success: false, message: "User not found" });

    const item = user.labCart.find((i) => i.serviceId.toString() === serviceId);
    if (!item) return res.json({ success: false, message: "Service not found in cart" });

    if (scheduledDate !== undefined) item.scheduledDate = new Date(scheduledDate);
    if (scheduledSlot !== undefined) item.scheduledSlot = scheduledSlot;

    await user.save();

    res.json({ success: true, message: "Lab cart updated", labCart: user.labCart });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const clearLabCart = async (req, res) => {
  try {
    await userModel.findByIdAndUpdate(req.user._id, { labCart: [] });
    res.json({ success: true, message: "Lab cart cleared" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getLabCart = async (req, res) => {
  try {
    const user = await userModel
      .findById(req.user._id)
      .select("labCart")
      .populate("labCart.serviceId")
      .populate("labCart.labId", "name address number");

    res.json({ success: true, labCart: user.labCart });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// PHARMACY ORDERS
// ─────────────────────────────────────────────

export const placePharmacyOrder = async (req, res) => {
  const { pharmacyId, items, addressId, payment, prescription, notes } = req.body;

  if (!pharmacyId || !items?.length || !addressId || !payment?.method) {
    return res.json({ success: false, message: "Missing required order details" });
  }

  try {
    const user = await userModel.findById(req.user._id);
    if (!user) return res.json({ success: false, message: "User not found" });

    const deliveryAddress = user.addresses.id(addressId);
    if (!deliveryAddress) return res.json({ success: false, message: "Delivery address not found" });

    const pharmacy = await pharmacyModel.findById(pharmacyId);
    if (!pharmacy) return res.json({ success: false, message: "Pharmacy not found" });

    const validPaymentMethods = ["upi", "card", "netbanking", "cash", "cod", "wallet"];
    if (!validPaymentMethods.includes(payment.method)) {
      return res.json({ success: false, message: `Invalid payment method: ${payment.method}` });
    }

    let itemsTotal = 0;
    let prescriptionRequired = false;

    const processedItems = await Promise.all(
      items.map(async (item, index) => {
        if (!item.medicineId) throw new Error(`Item ${index} missing medicineId`);
        if (!item.quantity || item.quantity <= 0) throw new Error(`Item ${index} has invalid quantity`);

        const product = await pharmacyProductModel.findById(item.medicineId);
        if (!product) throw new Error(`Product at index ${index} not found`);
        if (product.no_of_Product < item.quantity) throw new Error(`Insufficient stock for "${product.name}"`);
        if (product.prescription_required && !item.prescriptionVerified) {
          throw new Error(`Prescription not verified for "${product.name}"`);
        }

        product.no_of_Product -= item.quantity;
        await product.save();

        const discount = (product.price * product.discount) / 100;
        const subtotal = (product.price - discount) * item.quantity;
        itemsTotal += subtotal;
        if (product.prescription_required) prescriptionRequired = true;

        return {
          medicineId: new mongoose.Types.ObjectId(item.medicineId),
          name: product.name,
          brand: product.companyName,
          quantity: item.quantity,
          unitPrice: product.price,
          discount: product.discount,
          subtotal,
          requiresPrescription: product.prescription_required,
          prescriptionVerified: item.prescriptionVerified ?? false,
        };
      })
    );

    const orderNumber = await pharmacyOrderNo(pharmacy, "online");
    const now = new Date();

    await pharmacyOrderModel.create({
      _id: new mongoose.Types.ObjectId(),
      orderNumber,
      createdAt: now,
      updatedAt: now,
      channel: "online",
      orderType: "delivery",
      customer: {
        userId: user._id,
        name: user.name,
        phone: user.number,
        email: user.email,
        isWalkIn: false,
      },
      pharmacy: {
        pharmacyId: pharmacy._id,
        name: pharmacy.name,
        address: pharmacy.address,
        number: pharmacy.number,
        email: pharmacy.email,
      },
      delivery: {
        address: {
          line1: deliveryAddress.line1,
          city: deliveryAddress.city,
          state: deliveryAddress.state,
          pincode: deliveryAddress.pincode,
          landmark: deliveryAddress.line2 || "",
        },
      },
      pickup: null,
      items: processedItems,
      prescription: {
        required: prescriptionRequired,
        verified: prescription?.verified ?? false,
        verifiedAt: now,
        documents: null,
      },
      pricing: { itemsTotal, deliveryFee: 0, packagingFee: 0, grandTotal: itemsTotal },
      payment: {
        status: payment.status ?? "pending",
        method: payment.method,
        paidAt: payment.status === "paid" ? now : null,
        transactionId: payment.transactionId ?? "",
        gatewayOrderId: null,
        refundId: null,
        refundedAt: null,
        refundAmount: null,
      },
      currentStatus: "pending",
      statusHistory: [{ status: "pending", timestamp: now, updatedBy: "user", note: "Order placed by user.", userAction: null }],
      cancellation: {
        status: "none",
        cancelledAt: null,
        cancelledBy: null,
        userRequest: { requestedAt: null, reason: null, refundEligible: false },
      },
      notes: { fromUser: notes?.fromUser ?? "", fromShopkeeper: "" },
    });

    user.pharmacyCart = [];
    await user.save();

    res.json({ success: true, message: "Pharmacy order placed successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getUserPharmacyOrders = async (req, res) => {
  try {
    const orders = await pharmacyOrderModel
      .find({ "customer.userId": req.user._id })
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// LAB ORDERS
// ─────────────────────────────────────────────

export const placeLabOrder = async (req, res) => {
  const { labId, items, addressId, collectionType, schedule, payment, notes } = req.body;

  if (!labId || !items?.length || !payment?.method) {
    return res.json({ success: false, message: "Missing required order details" });
  }
  if (collectionType === "home_collection" && !addressId) {
    return res.json({ success: false, message: "addressId is required for home_collection orders" });
  }

  try {
    const user = await userModel.findById(req.user._id);
    if (!user) return res.json({ success: false, message: "User not found" });

    const lab = await labModel.findById(labId);
    if (!lab) return res.json({ success: false, message: "Lab not found" });

    let homeCollectionAddress = null;
    if (collectionType === "home_collection") {
      const addr = user.addresses.id(addressId);
      if (!addr) return res.json({ success: false, message: "Delivery address not found" });
      homeCollectionAddress = addr;
    }

    const validPaymentMethods = ["upi", "card", "netbanking", "cash", "cod", "wallet"];
    if (!validPaymentMethods.includes(payment.method)) {
      return res.json({ success: false, message: `Invalid payment method: ${payment.method}` });
    }

    const now = new Date();
    let scheduledAt = now;

    if (schedule?.type === "later") {
      if (!schedule.scheduledAt) return res.json({ success: false, message: "scheduledAt is required when schedule.type is 'later'." });
      const parsed = new Date(schedule.scheduledAt);
      if (isNaN(parsed.getTime())) return res.json({ success: false, message: "scheduledAt is not a valid date." });
      if (parsed <= now) return res.json({ success: false, message: "scheduledAt must be a future date and time." });
      scheduledAt = parsed;
    }

    let itemsTotal = 0;
    let forceLabVisit = false;

    const processedItems = await Promise.all(
      items.map(async (item, index) => {
        if (!item.serviceId) throw new Error(`Item at index ${index} is missing serviceId.`);

        const service = await labServiceModel.findOne({ _id: item.serviceId, labId: lab._id });
        if (!service) throw new Error(`Service at index ${index} not found or does not belong to this lab.`);
        if (!service.visibility) throw new Error(`Service "${service.name}" is currently unavailable.`);

        if (service.visitLab) forceLabVisit = true;

        const discountAmount = (service.price * service.discount) / 100;
        const subtotal = service.price - discountAmount;
        itemsTotal += subtotal;

        return {
          serviceId: new mongoose.Types.ObjectId(item.serviceId),
          name: service.name,
          type: service.type,
          price: service.price,
          discount: service.discount,
          subtotal,
          requiresLabVisit: service.visitLab ?? false,
          duration_of_test: {
            value: Number(service.duration_of_test.value),
            unit: String(service.duration_of_test.unit),
          },
          duration_of_result: {
            value: Number(service.duration_of_result.value),
            unit: String(service.duration_of_result.unit),
          },
          requirement: String(service.requirement ?? ""),
          caution: String(service.caution ?? ""),
          result: { status: "pending", reportUrl: null, uploadedAt: null, notes: "", referenceRange: "", isAbnormal: false },
        };
      })
    );

    if (forceLabVisit && collectionType === "home_collection") {
      return res.json({
        success: false,
        message: "One or more selected services require a lab visit. Home collection is not available for this combination.",
      });
    }

    const resolvedCollectionType = forceLabVisit ? "visit_lab" : collectionType;
    const collectionFee = resolvedCollectionType === "home_collection" ? 50 : 0;
    const grandTotal = itemsTotal + collectionFee;
    const orderNumber = await labOrderNo(lab, "online");

    const order = await labOrderModel.create({
      _id: new mongoose.Types.ObjectId(),
      orderNumber,
      createdAt: now,
      updatedAt: now,
      channel: "online",
      collectionType: resolvedCollectionType,
      patient: {
        userId: user._id,
        name: user.name,
        phone: user.number,
        email: user.email,
        age: user.age ?? null,
        gender: user.gender ?? null,
        isWalkIn: false,
      },
      lab: {
        labId: new mongoose.Types.ObjectId(lab._id),
        name: lab.name,
        address: lab.address,
        phone: lab.number ?? "",
        email: lab.email ?? "",
      },
      homeCollection:
        resolvedCollectionType === "home_collection"
          ? {
              address: {
                line1: homeCollectionAddress.line1,
                city: homeCollectionAddress.city,
                state: homeCollectionAddress.state,
                pincode: homeCollectionAddress.pincode,
                landmark: homeCollectionAddress.line2 || "",
              },
              collectedAt: null,
            }
          : null,
      labVisit: resolvedCollectionType === "visit_lab" ? { scheduledAt, arrivedAt: null } : null,
      items: processedItems,
      pricing: { itemsTotal, collectionFee, packagingFee: 0, grandTotal },
      payment: {
        status: payment.status ?? (payment.method === "cod" ? "cash_on_delivery" : "pending"),
        method: payment.method,
        paidAt: payment.method !== "cod" && payment.status === "paid" ? now : null,
        transactionId: payment.transactionId ?? "",
        gatewayOrderId: null,
        refundId: null,
        refundedAt: null,
        refundAmount: null,
      },
      currentStatus: "pending",
      statusHistory: [
        {
          status: "pending",
          timestamp: now,
          updatedBy: "user",
          actorId: null,
          note: schedule?.type === "later"
            ? `Scheduled for ${scheduledAt.toLocaleString("en-IN")}.`
            : "Order placed online by user.",
          userAction: null,
        },
      ],
      cancellation: {
        status: "none",
        cancelledAt: null,
        cancelledBy: null,
        userRequest: { requestedAt: null, reason: null, reasonNote: "", refundEligible: false, refundAmount: null },
        pharmacyResponse: { respondedAt: null, respondedBy: null, approved: null, rejectionReason: "" },
      },
      consolidatedReport: { reportUrl: null, generatedAt: null, deliveredVia: null, deliveredAt: null },
      notes: { fromPatient: notes?.fromPatient ?? "", fromReceptionist: "", fromTechnician: "" },
    });

    user.labCart = [];
    await user.save();

    res.json({
      success: true,
      message: "Lab order placed successfully",
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        collectionType: order.collectionType,
        scheduledAt: resolvedCollectionType === "visit_lab" ? order.labVisit.scheduledAt : null,
        grandTotal: order.pricing.grandTotal,
        status: order.currentStatus,
        serviceCount: order.items.length,
      },
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getUserLabOrders = async (req, res) => {
  try {
    const orders = await labOrderModel
      .find({ "patient.userId": req.user._id })
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// PRIVATE HELPER
// ─────────────────────────────────────────────

const _safeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  number: user.number,
  gender: user.gender,
  age: user.age,
  profileImage: user.profileImage,
  addresses: user.addresses,
});