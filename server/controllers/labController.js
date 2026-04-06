// server/controllers/labController.js
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import labModel from "../models/Labs.js";
import generateToken from "../utils/generateToken.js";
import labServiceModel from "../models/LabServices.js";
import labOrderModel from "../models/LabOrders.js";
import { geocodeAddress } from "../utils/geocode.js";
import { labOrderNo } from "../utils/generateOrderNumber.js";
import mongoose from "mongoose";
import nodemailer from "nodemailer";

export const signUpLab = async (req, res) => {
  const {
    name,
    email,
    number,
    password,
    address,
    gstNumber,
    licenseNumber,
    serviceType,
    ownerName,
  } = req.body;

  const gst = req.files.gstFile[0];
  const license = req.files.licenseFile[0];
  const nabl = req.files.nablFile[0];

  if (
    name === "" ||
    email === "" ||
    number === "" ||
    password === "" ||
    address === "" ||
    gstNumber === "" ||
    licenseNumber === "" ||
    serviceType === "" ||
    ownerName === "" ||
    !gst ||
    !license ||
    !nabl
  ) {
    return res.json({ success: false, message: "Missing Details" });
  }

  try {
    const labExists = await labModel.findOne({
      $or: [{ number }, { email }],
    });
    if (labExists) {
      return res.json({
        success: false,
        message: "Lab already exists",
      });
    }

    const gstFileUpload = await cloudinary.uploader.upload(gst.path);
    const licenseFileUpload = await cloudinary.uploader.upload(license.path);
    const nablFileUpload = await cloudinary.uploader.upload(nabl.path);

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const coords = await geocodeAddress(address);

    const lab = await labModel.create({
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
      serviceType,
      licenseFile: licenseFileUpload.secure_url,
      gstFile: gstFileUpload.secure_url,
      nablFile: nablFileUpload.secure_url,
    });

    res.json({
      success: true,
      // lab: {
      //   _id: lab._id,
      //   name: lab.name,
      //   email: lab.email,
      //   number: lab.number,
      //   address: lab.address,
      // },
      token: generateToken(lab._id),
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const loginLab = async (req, res) => {
  const { number, email, password } = req.body;
  if (password === "" || (number === "" && email === "")) {
    return res.json({ success: false, message: "Missing Details" });
  }
  try {
    const lab = await labModel.findOne({ email });
    if (!lab) {
      return res.json({ success: false, message: "Invalid credentials" });
    }
    if (await bcrypt.compare(password, lab.password)) {
      res.json({
        success: true,
        lab: {
          _id: lab._id,
          name: lab.name,
          email: lab.email,
          number: lab.number,
          address: lab.address,
        },
        token: generateToken(lab._id),
        role: "lab",
      });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getLab = async (req, res) => {
  try {
    const lab = req.lab;
    res.json({ success: true, lab });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteLab = async (req, res) => {};

export const editLab = async (req, res) => {};

export const setPassword = async (req, res) => {};

export const addService = async (req, res) => {
  try {
    const {
      name,
      description,
      outcome,
      type,
      serviceNo,
      requirement,
      price,
      discount,
      duration_of_test,
      duration_of_result,
      visitLab,
      caution,
      visibility,
    } = req.body;

    const image = req.file;
    const user = req.lab;

    if (
      name === "" ||
      description === "" ||
      outcome === "" ||
      type === "" ||
      serviceNo === "" ||
      requirement === "" ||
      price === "" ||
      discount === "" ||
      duration_of_test === "" ||
      duration_of_result === "" ||
      visitLab === "" ||
      caution === "" ||
      visibility === "" ||
      !image
    ) {
      return res.json({ success: false, message: "Missing Details" });
    }

    const fileUpload = await cloudinary.uploader.upload(image.path);

    const test = await labServiceModel.create({
      name,
      description,
      outcome,
      labId: user._id,
      type,
      serviceNo,
      requirement,
      price,
      discount,
      duration_of_test,
      duration_of_result,
      visitLab,
      caution,
      visibility,
      image: fileUpload.secure_url,
    });

    res.json({
      success: true,
      test,
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getServices = async (req, res) => {
  try {
    const lab = req.lab;
    const tests = await labServiceModel.find({
      labId: lab._id,
    });
    res.json({ success: true, tests });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

export const getService = async (req, res) => {
  try {
    const lab = req.lab;
    const test = await labServiceModel.findOne({
      _id: req.params.id,
      labId: lab._id,
    });
    res.json({ success: true, test });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

export const updateService = async (req, res) => {};

export const removeService = async (req, res) => {
  try {
    const user = req.lab;
    const test = await labServiceModel.findOneAndDelete({
      labId: user._id,
      _id: req.params.id,
    });
    res.json({
      success: true,
      message: "Service Deleted Successfully",
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const changeVisibility = async (req, res) => {
  try {
    const user = req.lab;

    // find test first
    const test = await labServiceModel.findOne({
      labId: user._id,
      _id: req.params.id,
    });

    if (!test) {
      return res.json({
        success: false,
        message: "Test not found",
      });
    }

    // toggle visibility
    test.visibility = !test.visibility;

    await test.save();

    res.json({
      success: true,
      message: "Service visibility toggled successfully",
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

export const createOrder = async (req, res) => {
  try {
    const lab = req.lab; // set by auth middleware

    const {
      patient, // { name, phone, email, age, gender }
      items, // [{ serviceId }]
      schedule, // { type: "now" | "later", scheduledAt? }
      payment, // { method, status, transactionId }
      notes, // { fromPatient, fromReceptionist }
    } = req.body;

    // ── 1. Basic validation ──────────────────────────────
    if (!patient?.name || !patient?.phone) {
      return res.status(400).json({
        success: false,
        message: "Patient name and phone are required.",
      });
    }
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one test must be selected.",
      });
    }
    if (!payment?.method) {
      return res.status(400).json({
        success: false,
        message: "payment.method is required.",
      });
    }

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

    // ── 2. Validate schedule ─────────────────────────────
    const now = new Date();
    let scheduledAt = now; // default: book for right now

    if (schedule?.type === "later") {
      if (!schedule.scheduledAt) {
        return res.status(400).json({
          success: false,
          message: "scheduledAt is required when schedule.type is 'later'.",
        });
      }
      const parsed = new Date(schedule.scheduledAt);
      if (isNaN(parsed.getTime())) {
        return res.status(400).json({
          success: false,
          message: "scheduledAt is not a valid date.",
        });
      }
      if (parsed <= now) {
        return res.status(400).json({
          success: false,
          message: "scheduledAt must be a future date and time.",
        });
      }
      scheduledAt = parsed;
    }

    // ── 3. Fetch and validate each service ───────────────
    let itemsTotal = 0;
    let forceLabVisit = false; // becomes true if any test requires lab visit

    const processedItems = await Promise.all(
      items.map(async (item, index) => {
        if (!item.serviceId) {
          throw new Error(`Item at index ${index} is missing serviceId.`);
        }

        const service = await labServiceModel.findOne({
          _id: item.serviceId,
          labId: lab._id,
        });

        if (!service) {
          throw new Error(
            `Service at index ${index} not found or does not belong to this lab.`,
          );
        }
        if (!service.visibility) {
          throw new Error(
            `Service "${service.name}" is currently unavailable.`,
          );
        }

        // ── Key business rule ──────────────────────────
        // If even one test requires a lab visit, the entire
        // order must be a lab visit — home collection blocked
        if (service.visitLab) {
          forceLabVisit = true;
        }

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

          // // ✅ Explicitly construct plain objects for nested subdocuments
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

          // ✅ Explicitly construct plain object for result subdocument
          result: {
            status: "pending",
            reportUrl: null,
            uploadedAt: null,
            // uploadedBy: null,
            notes: "",
            referenceRange: "",
            isAbnormal: false,
          },
        };
      }),
    );

    // ── 4. Determine collection type ─────────────────────
    // Inclinic orders are always visit_lab regardless.
    // If any service requires lab visit → also visit_lab.
    // (Home collection is only possible for online orders — not inclinic.)
    const collectionType = "visit_lab";

    // If the lab attempted a home collection booking inclinic
    // but a test requires lab visit, we surface a clear message
    // (not applicable here since inclinic = always visit_lab, but
    //  useful if you later extend this to support home bookings too)
    if (forceLabVisit) {
      // This flag is logged for audit; order proceeds as visit_lab
      notes &&
        (notes.fromReceptionist =
          `[Auto] Forced to visit_lab: one or more tests require lab visit. ` +
          (notes.fromReceptionist ?? ""));
    }

    // ── 5. Compute grand total ───────────────────────────
    const collectionFee = 0; // no collection fee for lab visit
    const grandTotal = itemsTotal + collectionFee;

    // ── 6. Generate order number ─────────────────────────
    const orderNumber = await labOrderNo(lab, "inclinic");

    // ── 7. Build the order document ──────────────────────
    const order = await labOrderModel.create({
      _id: new mongoose.Types.ObjectId(),
      orderNumber,
      createdAt: now,
      updatedAt: now,

      // Inclinic booking — channel is always "inclinic" here
      channel: "inclinic",
      collectionType,

      patient: {
        userId: null, // walk-in via reception — no app userId
        name: patient.name,
        phone: patient.phone,
        email: patient.email ?? "",
        age: patient.age ?? null,
        gender: patient.gender ?? null,
        isWalkIn: true,
      },

      lab: {
        labId: new mongoose.Types.ObjectId(lab._id),
        name: lab.name,
        address: lab.address,
        phone: lab.number ?? "",
        email: lab.email ?? "",
      },

      // Home collection not applicable for inclinic
      homeCollection: null,

      // Lab visit — use scheduledAt from request
      labVisit: {
        scheduledAt, // now (immediate) or future slot
        arrivedAt: schedule?.type === "now" ? now : null,
      },

      items: processedItems,

      pricing: {
        itemsTotal,
        collectionFee,
        packagingFee: 0,
        grandTotal,
      },

      payment: {
        status:
          payment.status ??
          (payment.method === "cod" ? "cash_on_delivery" : "paid"),
        method: payment.method,
        paidAt: payment.method !== "cod" ? now : null,
        transactionId: payment.transactionId ?? "",
        gatewayOrderId: null,
        refundId: null,
        refundedAt: null,
        refundAmount: null,
      },

      // Immediate booking → confirmed straight away
      // Scheduled for later → stays pending until slot arrives
      currentStatus: schedule?.type === "later" ? "pending" : "confirmed",

      statusHistory: [
        {
          status: schedule?.type === "later" ? "pending" : "confirmed",
          timestamp: now,
          updatedBy: "receptionist",
          actorId: null,
          note:
            schedule?.type === "later"
              ? `Scheduled for ${scheduledAt.toLocaleString("en-IN")}.`
              : "Walk-in order created and confirmed by reception.",
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
          reasonNote: "",
          refundEligible: false,
          refundAmount: null,
        },
        pharmacyResponse: {
          respondedAt: null,
          respondedBy: null,
          approved: null,
          rejectionReason: "",
        },
      },

      consolidatedReport: {
        reportUrl: null,
        generatedAt: null,
        deliveredVia: null,
        deliveredAt: null,
      },

      notes: {
        fromPatient: notes?.fromPatient ?? "",
        fromReceptionist: notes?.fromReceptionist ?? "",
        fromTechnician: "",
      },
    });

    return res.status(201).json({
      success: true,
      message: "Lab order created successfully.",
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        collectionType: order.collectionType,
        scheduledAt: order.labVisit.scheduledAt,
        grandTotal: order.pricing.grandTotal,
        status: order.currentStatus,
        testCount: order.items.length,
        // Surface the forced-visit-lab flag if relevant
        forceLabVisitApplied: forceLabVisit,
      },
    });
  } catch (error) {
    const isValidationError =
      error.name === "ValidationError" ||
      error.message?.startsWith("Service") ||
      error.message?.startsWith("Item") ||
      error.message?.includes("unavailable");

    return res.status(isValidationError ? 400 : 500).json({
      success: false,
      message: error.message || "Failed to create lab order.",
    });
  } finally {
  }
};

export const viewOrders = async (req, res) => {
  const user = req.lab;

  try {
    const orders = await labOrderModel.find({ "lab.labId": user._id });

    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message || "Failed to fetch orders",
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  const lab = req.lab;
  const { orderId } = req.params;
  const { status } = req.body;

  const VALID_STATUSES = [
    "pending",
    "confirmed",
    "sample_collected",
    "processing",
    "results_ready",
    "results_delivered",
    "completed",
    "cancelled",
    "refund_initiated",
    "refunded",
  ];

  if (!status || !VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
    });
  }

  try {
    // Make sure order belongs to this lab
    const order = await labOrderModel.findOne({
      _id: orderId,
      "lab.labId": lab._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found or does not belong to this lab.",
      });
    }

    // Prevent updating already terminal orders
    const TERMINAL = ["completed", "cancelled", "refunded"];
    if (TERMINAL.includes(order.currentStatus)) {
      return res.status(400).json({
        success: false,
        message: `Order is already ${order.currentStatus} and cannot be updated.`,
      });
    }

    const now = new Date();

    // Update status and append to history
    order.currentStatus = status;
    order.updatedAt = now;
    order.statusHistory.push({
      status,
      timestamp: now,
      updatedBy: "receptionist",
      actorId: null,
      note: `Status updated to "${status}" by lab.`,
      userAction: null,
    });

    // Auto-fill arrivedAt when patient checks in for lab visit
    if (status === "sample_collected" && order.collectionType === "visit_lab") {
      if (order.labVisit && !order.labVisit.arrivedAt) {
        order.labVisit.arrivedAt = now;
      }
    }

    // Auto-fill collectedAt for home collection
    if (
      status === "sample_collected" &&
      order.collectionType === "home_collection"
    ) {
      if (order.homeCollection && !order.homeCollection.collectedAt) {
        order.homeCollection.collectedAt = now;
      }
    }

    await order.save();

    res.json({
      success: true,
      message: `Order status updated to "${status}".`,
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        currentStatus: order.currentStatus,
      },
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ── uploadReport ──────────────────────────────────────────────────────────
// POST /api/lab/orders/:orderId/report
// Multer middleware must run before this: upload.single("report")
//
// Upload is ONLY allowed when currentStatus is:
//   - "results_ready"     → first upload
//   - "results_delivered" → re-upload / correction
//
// All earlier statuses (pending, confirmed, sample_collected, processing)
// are blocked — the order must be fully processed before uploading results.

export const uploadReport = async (req, res) => {
  const lab = req.lab;
  const { orderId } = req.params;
  const file = req.file;

  // ── 1. File presence check ─────────────────────────────────────────────
  if (!file) {
    return res.status(400).json({
      success: false,
      message:
        "No file received. Make sure you are sending the PDF as form-data " +
        "with field name 'report' and the body type is form-data (not raw/JSON).",
    });
  }

  // ── 2. File type check ─────────────────────────────────────────────────
  if (file.mimetype !== "application/pdf") {
    return res.status(400).json({
      success: false,
      message: `Only PDF files are accepted. Received: ${file.mimetype}`,
    });
  }

  try {
    // ── 3. Find the order ────────────────────────────────────────────────
    const order = await labOrderModel.findOne({
      _id: orderId,
      "lab.labId": lab._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found or does not belong to this lab.",
      });
    }

    // ── 4. Status gate — only allow upload after processing is complete ──
    // "results_ready"     → first upload is allowed here
    // "results_delivered" → re-upload / correction is allowed here
    // Everything else (pending, confirmed, sample_collected, processing,
    //                  completed, cancelled, refunded) → blocked
    const UPLOAD_ALLOWED_STATUSES = ["results_ready", "results_delivered"];

    if (!UPLOAD_ALLOWED_STATUSES.includes(order.currentStatus)) {
      const friendlyStatus = order.currentStatus.replace(/_/g, " ");

      // Give a specific helpful message depending on where in the flow they are
      let hint = "";
      if (["pending", "confirmed"].includes(order.currentStatus)) {
        hint = "The sample has not been collected yet. Advance the order through " +
          "'Confirmed → Sample Collected → Processing → Results Ready' before uploading.";
      } else if (order.currentStatus === "sample_collected") {
        hint = "The sample is collected but not yet processed. " +
          "Advance to 'Processing' and then 'Results Ready' before uploading.";
      } else if (order.currentStatus === "processing") {
        hint = "The order is still being processed. " +
          "Mark it as 'Results Ready' first, then upload the report.";
      } else if (order.currentStatus === "completed") {
        hint = "This order is already completed. Re-upload is not allowed.";
      } else if (order.currentStatus === "cancelled") {
        hint = "This order has been cancelled. Upload is not allowed.";
      } else if (order.currentStatus === "refunded") {
        hint = "This order has been refunded. Upload is not allowed.";
      }

      return res.status(400).json({
        success: false,
        message:
          `Report cannot be uploaded when order status is "${friendlyStatus}". ` +
          (hint || "Upload is only allowed at 'Results Ready' or 'Results Delivered' status."),
      });
    }

    // ── 5. Upload PDF to Cloudinary ──────────────────────────────────────
    // resource_type: "raw" is required for non-image files like PDFs
    const uploadResult = await cloudinary.uploader.upload(file.path, {
      resource_type: "raw",
      folder: "lab_reports",
      public_id: `report_${order.orderNumber}_${Date.now()}`,
      format: "pdf",
      use_filename: false,
      unique_filename: true,
    });

    const now = new Date();

    // Track whether this is first upload or a re-upload
    const isReUpload = !!order.consolidatedReport?.reportUrl;

    // ── 6. Save report URL — preserve existing delivery metadata ─────────
    // On re-upload, keep deliveredVia and deliveredAt so we don't lose
    // the delivery history, but reset deliveredAt to prompt re-sending
    order.consolidatedReport = {
      reportUrl:   uploadResult.secure_url,
      generatedAt: now,
      deliveredVia: isReUpload ? order.consolidatedReport.deliveredVia : null,
      deliveredAt:  isReUpload ? null : null, // reset on re-upload — needs re-sending
    };
    order.updatedAt = now;

    // ── 7. Append to status history ───────────────────────────────────────
    order.statusHistory.push({
      status:    order.currentStatus,
      timestamp: now,
      updatedBy: "receptionist",
      actorId:   null,
      note: isReUpload
        ? `Report re-uploaded by lab. Previous report replaced.`
        : `Report uploaded by lab. Ready to deliver to patient.`,
      userAction: null,
    });

    await order.save();

    return res.json({
      success: true,
      message: isReUpload
        ? "Report re-uploaded successfully."
        : "Report uploaded successfully.",
      data: {
        reportUrl:     uploadResult.secure_url,
        currentStatus: order.currentStatus,
        isReUpload,
      },
    });
  } catch (error) {
    // Surface Cloudinary-specific errors more clearly
    const isCloudinaryError =
      error.http_code != null || error.message?.toLowerCase().includes("cloudinary");

    return res.status(500).json({
      success: false,
      message: isCloudinaryError
        ? `Cloudinary upload failed: ${error.message}`
        : error.message || "Failed to upload report.",
    });
  }
};

export const sendReport = async (req, res) => {
  const lab = req.lab;
  const { orderId } = req.params;

  try {
    const order = await labOrderModel.findOne({
      _id: orderId,
      "lab.labId": lab._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found or does not belong to this lab.",
      });
    }

    if (!order.consolidatedReport?.reportUrl) {
      return res.status(400).json({
        success: false,
        message: "No report uploaded yet. Please upload the report first.",
      });
    }

    if (!order.patient.email) {
      return res.status(400).json({
        success: false,
        message: "Patient has no email address on file.",
      });
    }

    // ── Configure nodemailer transporter ──────────────────────────────────
    // Uses Gmail SMTP — add to your .env:
    //   EMAIL_ID=your_gmail@gmail.com
    //   EMAIL_PASSWORD=your_app_password   (Gmail App Password, not account password)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_ID,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Test names for the email body
    const testNames = order.items.map((i) => i.name).join(", ");

    // ── Compose email ─────────────────────────────────────────────────────
    const mailOptions = {
      from: `"${lab.name}" <${process.env.EMAIL_ID}>`,
      to: order.patient.email,
      subject: `Your Lab Report — Order ${order.orderNumber} | ${lab.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #059669; padding: 24px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 22px;">${lab.name}</h1>
            <p style="color: #d1fae5; margin: 4px 0 0 0; font-size: 14px;">Lab Test Report</p>
          </div>
 
          <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="color: #374151; font-size: 15px;">
              Dear <strong>${order.patient.name}</strong>,
            </p>
            <p style="color: #374151; font-size: 14px; line-height: 1.6;">
              Your lab test report is ready. Please find the details below:
            </p>
 
            <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">
              <tr style="background: #ecfdf5;">
                <td style="padding: 10px 14px; color: #6b7280; font-weight: 600; width: 40%;">Order Number</td>
                <td style="padding: 10px 14px; color: #111827; font-family: monospace;">${order.orderNumber}</td>
              </tr>
              <tr>
                <td style="padding: 10px 14px; color: #6b7280; font-weight: 600;">Tests Conducted</td>
                <td style="padding: 10px 14px; color: #111827;">${testNames}</td>
              </tr>
              <tr style="background: #ecfdf5;">
                <td style="padding: 10px 14px; color: #6b7280; font-weight: 600;">Lab</td>
                <td style="padding: 10px 14px; color: #111827;">${lab.name}</td>
              </tr>
              <tr>
                <td style="padding: 10px 14px; color: #6b7280; font-weight: 600;">Address</td>
                <td style="padding: 10px 14px; color: #111827;">${lab.address}</td>
              </tr>
            </table>
 
            <div style="text-align: center; margin: 24px 0;">
              <a href="${order.consolidatedReport.reportUrl}"
                style="background: #059669; color: white; padding: 12px 28px; border-radius: 8px;
                       text-decoration: none; font-size: 15px; font-weight: 600; display: inline-block;">
                📄 Download Report
              </a>
            </div>
 
            <p style="color: #6b7280; font-size: 12px; margin-top: 24px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
              If you have any questions about your report, please contact us at
              <a href="mailto:${lab.email}" style="color: #059669;">${lab.email}</a>
              or call us at ${lab.number}.
              <br/><br/>
              This is an automated email sent by ${lab.name} via MedLux.
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    // Update delivery metadata on the order
    const now = new Date();
    order.consolidatedReport.deliveredVia = "email";
    order.consolidatedReport.deliveredAt = now;
    order.updatedAt = now;

    // Auto-advance to results_delivered if still at results_ready
    if (order.currentStatus === "results_ready") {
      order.currentStatus = "results_delivered";
      order.statusHistory.push({
        status: "results_delivered",
        timestamp: now,
        updatedBy: "system",
        actorId: null,
        note: `Report emailed to patient at ${order.patient.email}.`,
        userAction: null,
      });
    }

    await order.save();

    res.json({
      success: true,
      message: `Report sent to ${order.patient.email} successfully.`,
      data: {
        sentTo: order.patient.email,
        currentStatus: order.currentStatus,
      },
    });
  } catch (error) {
    // Distinguish SMTP errors from other errors
    const isSmtpError =
      error.code === "EAUTH" ||
      error.code === "ECONNECTION" ||
      error.responseCode >= 500;

    res.json({
      success: false,
      message: isSmtpError
        ? "Failed to send email. Check SMTP credentials in .env."
        : error.message,
    });
  }
};
