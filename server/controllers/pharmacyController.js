//server/controllers/pharmacyController.js
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import pharmacyModel from "../models/Pharmacies.js";
import generateToken from "../utils/generateToken.js";
import pharmacyProductModel from "../models/PharmacyProduct.js";
import pharmacyOrderModel from "../models/PharmacyOrders.js";
import { geocodeAddress } from "../utils/geocode.js";
import { pharmacyOrderNo } from "../utils/generateOrderNumber.js";
import mongoose from "mongoose";

export const signUpPharmacy = async (req, res) => {
  const {
    name,
    email,
    number,
    ownerName,
    password,
    address,
    gstNumber,
    licenseNumber,
  } = req.body;

  const gst = req.files.gstFile[0];
  const license = req.files.licenseFile[0];
  const nabl = req.files.nablFile[0];

  if (
    name === "" ||
    email === "" ||
    number === "" ||
    ownerName === "" ||
    password === "" ||
    address === "" ||
    gstNumber === "" ||
    licenseNumber === "" ||
    !gst ||
    !license
  ) {
    return res.json({ success: false, message: "Missing Details" });
  }

  try {
    const pharmacyExists = await pharmacyModel.findOne({
      $or: [{ number }, { email }],
    });
    if (pharmacyExists) {
      return res.json({
        success: false,
        message: "Pharmacy already exists",
      });
    }

    const gstFileUpload = await cloudinary.uploader.upload(gst.path);
    const licenseFileUpload = await cloudinary.uploader.upload(license.path);
    const nablFileUpload = await cloudinary.uploader.upload(nabl.path);

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const coords = await geocodeAddress(address);

    const pharmacy = await pharmacyModel.create({
      name,
      number,
      ownerName,
      password: hashPassword,
      email,
      address,
      location: {
        type: "Point",
        coordinates: [coords.lng, coords.lat],
      },
      licenseNumber,
      isApproved: true,
      gstNumber,
      licenseFile: licenseFileUpload.secure_url,
      gstFile: gstFileUpload.secure_url,
      nablFile: nablFileUpload.secure_url,
    });

    res.json({
      success: true,
      pharmacy: {
        _id: pharmacy._id,
        name: pharmacy.name,
        email: pharmacy.email,
        number: pharmacy.number,
        address: pharmacy.address,
      },
      token: generateToken(pharmacy._id),
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const loginPharmacy = async (req, res) => {
  const { number, email, password } = req.body;
  if (password === "") {
    return res.json({ success: false, message: "Missing Details" });
  }
  try {
    if (number === "") {
      if (email === "") {
        return res.json({ success: false, message: "Missing Details" });
      }
      const pharmacy = await pharmacyModel.findOne({ email });
      if (!pharmacy) {
        return res.json({ success: false, message: "Invalid credentials" });
      }
      if (await bcrypt.compare(password, pharmacy.password)) {
        res.json({
          success: true,
          pharmacy: {
            _id: pharmacy._id,
            name: pharmacy.name,
            email: pharmacy.email,
            number: pharmacy.number,
            address: pharmacy.address,
          },
          role: "pharmacy",
          token: generateToken(pharmacy._id),
        });
      } else {
        res.json({ success: false, message: "Invalid credentials" });
      }
    } else if (email === "") {
      if (number === "") {
        return res.json({ success: false, message: "Missing Details" });
      }
      const pharmacy = await pharmacyModel.findOne({ number });
      if (!pharmacy) {
        return res.json({ success: false, message: "Invalid credentials" });
      }
      if (await bcrypt.compare(password, pharmacy.password)) {
        res.json({
          success: true,
          pharmacy: {
            _id: pharmacy._id,
            name: pharmacy.name,
            email: pharmacy.email,
            number: pharmacy.number,
            address: pharmacy.address,
          },
          role: "pharmacy",
          token: generateToken(pharmacy._id),
        });
      } else {
        res.json({ success: false, message: "Invalid credentials" });
      }
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getPharmacy = async (req, res) => {
  try {
    const pharmacy = req.pharmacy;
    res.json({ success: true, pharmacy });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

export const deletePharmacy = async (req, res) => {};

export const editPharmacy = async (req, res) => {};

export const setPassword = async (req, res) => {};

export const addProduct = async (req, res) => {
  try {
    const {
      name,
      type,
      productNo,
      no_of_Product,
      price,
      discount,
      companyName,
      visibility,
      prescription_required,
    } = req.body;

    const quantity = JSON.parse(req.body.quantity);
    const image = req.file;
    const user = req.pharmacy;

    if (
      name === "" ||
      type === "" ||
      companyName === "" ||
      visibility === "" ||
      prescription_required === "" ||
      price === "" ||
      discount === "" ||
      productNo === "" ||
      !quantity?.amount ||
      !quantity?.unit ||
      no_of_Product === "" ||
      !image
    ) {
      return res.json({ success: false, message: "Missing Details" });
    }

    const fileUpload = await cloudinary.uploader.upload(image.path);

    const product = await pharmacyProductModel.create({
      name,
      type,
      pharmacyId: user._id,
      productNo,
      quantity,
      no_of_Product,
      price,
      discount,
      companyName,
      visibility,
      prescription_required,
      image: fileUpload.secure_url,
    });

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getProducts = async (req, res) => {
  try {
    const user = req.pharmacy;
    const products = await pharmacyProductModel.find({
      pharmacyId: user._id,
    });
    res.json({ success: true, products });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

export const getProduct = async (req, res) => {
  try {
    const user = req.pharmacy;
    const product = await pharmacyProductModel.findOne({
      _id: req.params.id,
      pharmacyId: user._id,
    });
    res.json({ success: true, product });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

export const updateProduct = async (req, res) => {};

export const incrementQuantity = async (req, res) => {
  try {
    const user = req.pharmacy;
    const product = await pharmacyProductModel.findOneAndUpdate(
      { pharmacyId: user._id, _id: req.params.id },
      { $inc: { no_of_Product: 1 } },
      { new: true },
    );
    res.json({
      success: true,
      message: "Product incremented successfully",
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const decrementQuantity = async (req, res) => {
  try {
    const user = req.pharmacy;
    const product = await pharmacyProductModel.findOneAndUpdate(
      {
        pharmacyId: user._id,
        _id: req.params.id,
        no_of_Product: { $gte: 1 },
      },
      { $inc: { no_of_Product: -1 } },
      { new: true },
    );
    res.json({
      success: true,
      message: "Product incremented successfully",
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const removeProduct = async (req, res) => {
  try {
    const user = req.pharmacy;
    const product = await pharmacyProductModel.findOneAndDelete({
      pharmacyId: user._id,
      _id: req.params.id,
    });
    res.json({
      success: true,
      message: "Product Deleted Successfully",
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const changeVisibility = async (req, res) => {
  try {
    const user = req.pharmacy;
    const product = await pharmacyProductModel.findOne({
      pharmacyId: user._id,
      _id: req.params.id,
    });

    if (!product) {
      return res.json({
        success: false,
        message: "Product not found",
      });
    }

    product.visibility = !product.visibility;

    await product.save();

    res.json({
      success: true,
      message: "Product Visibility Changed Successfully",
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const createOrder = async (req, res) => {
  try {
    const user = req.pharmacy;
    const {
      customer, // {name, phone, email}
      items, // {medicineId, quantity, prescriptionVerified}
      prescription, // {verified}
      payment, // {method, status, transactionId}
      notes, // {fromUser, fromShopkeeper}
    } = req.body;

    // ── 1. Basic validation ──────────────────────────────
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order must have at least one item.",
      });
    }
    if (!payment?.method) {
      return res
        .status(400)
        .json({ success: false, message: "payment.method is required." });
    }

    // ── 2. Validate each item and compute pricing ────────
    const validPaymentMethods = [
      "upi",
      "card",
      "netbanking",
      "cash",
      "cod",
      "wallet",
    ];

    if (!validPaymentMethods.includes(payment.method)) {
      return res.status(400).json({
        success: false,
        message: `Invalid payment method: ${payment.method}`,
      });
    }

    let itemsTotal = 0;
    let prescriptionRequired = false;

    const processedItems = await Promise.all(
      items.map(async (item, index) => {
        if (!item.medicineId) {
          throw new Error(`Item at index ${index} is missing medicineId.`);
        }
        if (!item.quantity || item.quantity <= 0) {
          throw new Error(`Item at index ${index} has invalid quantity.`);
        }

        const product = await pharmacyProductModel.findOne({
          _id: item.medicineId,
        });

        if (!product) {
          throw new Error(`Product at index ${index} not found.`);
        }
        if (product.no_of_Product < item.quantity) {
          throw new Error(`Insufficient stock for "${product.name}".`);
        }

        // Prescription check — if item requires Rx but shopkeeper hasn't verified, warn
        if (product.prescription_required && !item.prescriptionVerified) {
          throw new Error(
            `Prescription not verified for "${product.name}". Cannot dispense.`,
          );
        }

        product.no_of_Product = product.no_of_Product - item.quantity;
        await product.save();

        const discount = (product.price * product.discount) / 100;
        const subtotal = (product.price - discount) * item.quantity;
        itemsTotal += subtotal;

        if (product.prescription_required) {
          prescriptionRequired = true;
        }

        return {
          medicineId: new mongoose.Types.ObjectId(item.medicineId),
          name: product.name,
          brand: product.companyName,
          // sku: item.sku ?? "",
          quantity: item.quantity,
          unitPrice: product.price,
          // mrp: item.mrp ?? item.unitPrice,
          discount: product.discount,
          subtotal,
          requiresPrescription: product.prescription_required,
          prescriptionVerified: item.prescriptionVerified ?? false,
          // batchNumber: product.batchNumber ?? "",
          // expiryDate: product.expiryDate ? new Date(item.expiryDate) : null,
        };
      }),
    );

    const deliveryFee = 0;
    const packagingFee = 0;
    const grandTotal = itemsTotal;

    const orderNumber = await pharmacyOrderNo(user, "instore");

    const now = new Date();

    const order = await pharmacyOrderModel.create({
      _id: new mongoose.Types.ObjectId(),
      orderNumber,
      createdAt: now,
      updatedAt: now,

      // Instore order placed by shopkeeper at counter
      // placedBy: {
      //   type: "shopkeeper",
      //   shopkeeperId: new mongoose.Types.ObjectId(shopkeeperId),
      // },
      channel: "instore",
      orderType: "inshop",

      customer: {
        userId: null,
        name: customer.name ?? "Walk-in Customer",
        phone: customer.phone ?? "",
        email: customer.email ?? "",
        isWalkIn: true,
      },

      pharmacy: {
        pharmacyId: new mongoose.Types.ObjectId(user._id),
        name: user.name,
        address: user.address,
        number: user.number ?? "",
        email: user.email ?? "",
      },

      // No delivery or pickup blocks needed for inshop
      delivery: null,
      pickup: null,

      items: processedItems,

      prescription: {
        required: prescriptionRequired,
        verified: prescription?.verified ?? false,
        verifiedAt: now,
        documents: null,
      },

      pricing: {
        itemsTotal,
        deliveryFee,
        packagingFee,
        grandTotal,
      },

      payment: {
        status: payment.status,
        method: payment.method,
        paidAt: now,
        transactionId: payment.transactionId ?? "",
        gatewayOrderId: null,
        refundId: null,
        refundedAt: null,
        refundAmount: null,
      },

      // Instore orders are immediately completed once shopkeeper creates them
      currentStatus: "completed",

      statusHistory: [
        {
          status: "completed",
          timestamp: now,
          updatedBy: "shopkeeper",
          note: "Instore order created and completed by shopkeeper.",
          userAction: null,
        },
      ],

      cancellation: {
        status: "none",
        cancelledAt: null,
        cancelledBy: null,
        userRequest: {
          requestedAt: null,
          reason: null,
          refundEligible: false,
        },
      },

      notes: {
        fromUser: notes?.fromUser ?? "",
        fromShopkeeper: notes?.fromShopkeeper ?? "",
      },
    });

    res.json({
      success: true,
      message: "Order Created",
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message || "Failed to create order",
    });
  }
};

export const viewOrders = async (req, res) => {
  const user = req.pharmacy;

  try {
    const orders = await pharmacyOrderModel.find({'pharmacy.pharmacyId': user._id});

    res.json({
      success: true,
      orders
    })

  } catch (error) {
    res.json({
      success: false,
      message: error.message || "Failed to fetch orders"
    })
  }
};

export const updateOrderStatus = async (req, res) => {};

