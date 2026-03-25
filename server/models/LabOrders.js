import mongoose from "mongoose";

const labOrderSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,

  // ── Order Identity ──────────────────────────────────────
  orderNumber: String,           // "LB-2026-00142"
  createdAt: Date,
  updatedAt: Date,

  // ── Channel ─────────────────────────────────────────────
  channel: {
    type: String,
    enum: ["online", "inclinic"],
    // online    → user booked via app
    // inclinic  → receptionist booked at lab counter
  },

  // ── Collection Type ─────────────────────────────────────
  collectionType: {
    type: String,
    enum: ["home_collection", "visit_lab"],
    // home_collection → sample collected at patient's address
    // visit_lab       → patient visits the lab
  },

  // ── Customer / Patient ──────────────────────────────────
  patient: {
    userId: mongoose.Schema.Types.ObjectId,  // ref: users — null if walk-in
    name: String,
    phone: String,
    email: String,
    age: Number,
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    isWalkIn: Boolean,
  },

  // ── Lab ─────────────────────────────────────────────────
  lab: {
    labId: mongoose.Schema.Types.ObjectId,   // ref: labs
    name: String,
    address: String,
    phone: String,
    email: String,
  },

  // ── Home Collection Details ─────────────────────────────
  // Populated only if collectionType = "home_collection"
  homeCollection: {
    address: {
      line1: String,
      city: String,
      state: String,
      pincode: String,
      landmark: String,
    },
    scheduledAt: Date,          // date + time slot chosen by patient
    collectedAt: Date,          // actual time sample was collected
    collectionFee: Number,      // fee charged for home visit
    collectorName: String,      // phlebotomist name
    collectorPhone: String,
  },

  // ── Lab Visit Details ───────────────────────────────────
  // Populated only if collectionType = "visit_lab"
  labVisit: {
    scheduledAt: Date,          // appointment slot
    arrivedAt: Date,            // when patient checked in
   //  tokenNumber: String,     // "T-042" shown at reception
  },

  // ── Tests Booked ────────────────────────────────────────
  items: [
    {
      serviceId: mongoose.Schema.Types.ObjectId,  // ref: labServices
      name: String,
      type: String,                 // e.g. "Blood Test", "Urine Test"
      price: Number,
      discount: Number,             // in %
      subtotal: Number,             // price - (price * discount / 100)
      requiresLabVisit: Boolean,    // copied from labService.visitLab
      duration_of_test: {
        value: Number,
        unit: {
          type: String,
          enum: ["hours", "minutes", "seconds"],
        },
      },
      duration_of_result: {
        value: Number,
        unit: {
          type: String,
          enum: ["hours", "minutes", "seconds"],
        },
      },
      requirement: String,          // e.g. "Fasting required for 8 hours"
      caution: String,

      // ── Per-test Result ────────────────────────────────
      result: {
        status: {
          type: String,
          enum: [
            "pending",       // sample not yet collected
            "collected",     // sample collected, processing
            "processing",    // in lab
            "ready",         // result available
            "delivered",     // result sent to patient
          ],
        },
        reportUrl: String,           // cloudinary PDF URL
        uploadedAt: Date,
        uploadedBy: mongoose.Schema.Types.ObjectId,  // ref: lab staff
        notes: String,               // lab technician notes
        referenceRange: String,      // e.g. "Normal: 70–100 mg/dL"
        isAbnormal: Boolean,         // flag if result is outside normal range
      },
    },
  ],

  // ── Pricing ─────────────────────────────────────────────
  pricing: {
    itemsTotal: Number,
    collectionFee: Number,       // 0 if visit_lab
    packagingFee: Number,
    grandTotal: Number,
  },

  // ── Payment ─────────────────────────────────────────────
  payment: {
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded", "cash_on_delivery"],
    },
    method: {
      type: String,
      enum: ["upi", "card", "netbanking", "cash", "cod", "wallet"],
    },
    paidAt: Date,
    transactionId: String,
    gatewayOrderId: String,
    refundId: String,
    refundedAt: Date,
    refundAmount: Number,
  },

  // ── Order Status ────────────────────────────────────────
  currentStatus: {
    type: String,
    enum: [
      "pending",            // just booked, awaiting confirmation
      "confirmed",          // lab confirmed the booking
      "sample_collected",   // phlebotomist collected / patient gave sample at lab
      "processing",         // tests being run in lab
      "results_ready",      // all results uploaded
      "results_delivered",  // reports sent to patient
      "completed",          // patient acknowledged receipt
      "cancelled",
      "refund_initiated",
      "refunded",
    ],
  },

  // ── Status History ──────────────────────────────────────
  statusHistory: [
    {
      status: {
        type: String,
        enum: [
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
        ],
      },
      timestamp: Date,
      updatedBy: {
        type: String,
        enum: ["user", "receptionist", "system", "lab_technician"],
      },
      actorId: mongoose.Schema.Types.ObjectId,
      note: String,
      userAction: {
        type: String,
        enum: [
          "confirmed_receipt",          // patient confirmed getting reports
          "reported_not_received",      // patient says reports not received
          "requested_cancellation",
          "confirmed_cancellation_refund",
        ],
      },
    },
  ],

  // ── Cancellation ────────────────────────────────────────
  cancellation: {
    status: {
      type: String,
      enum: [
        "none",
        "requested_by_user",
        "approved",
        "rejected",
        "auto_cancelled",
      ],
    },
    cancelledAt: Date,
    cancelledBy: {
      type: String,
      enum: ["user", "receptionist", "system"],
    },
    userRequest: {
      requestedAt: Date,
      reason: {
        type: String,
        enum: [
          "booked_by_mistake",
          "found_cheaper_elsewhere",
          "slot_not_convenient",
          "changed_my_mind",
          "duplicate_booking",
          "other",
        ],
      },
      reasonNote: String,          // free text if reason = "other"
      refundEligible: Boolean,
      refundAmount: Number,        // may be partial if sample already collected
    },
    pharmacyResponse: {
      respondedAt: Date,
      respondedBy: mongoose.Schema.Types.ObjectId,
      approved: Boolean,
      rejectionReason: String,
    },
  },

  // ── Report Delivery ─────────────────────────────────────
  // Consolidated report across all tests in this order
  consolidatedReport: {
    reportUrl: String,             // single merged PDF of all test results
    generatedAt: Date,
    deliveredVia: {
      type: String,
      enum: ["app", "email", "whatsapp", "physical"],
    },
    deliveredAt: Date,
  },

  // ── Notes ───────────────────────────────────────────────
  notes: {
    fromPatient: String,           // e.g. "I have a latex allergy"
    fromReceptionist: String,      // internal note
    fromTechnician: String,        // lab technician observations
  },
});

const labOrder = mongoose.model("labOrder", labOrderSchema);

export default labOrder;
