import mongoose from "mongoose";

const pharmacyOrderSchema = mongoose.Schema(
  // pharmacy_orders collection
  {
    _id: mongoose.Schema.Types.ObjectId,

    // ── Order Identity ──────────────────────────────────────
    orderNumber: String, // "RX-2026-00142" (human readable)
    createdAt: Date,
    updatedAt: Date,

    // ── Order Channel ───────────────────────────────────────
    channel: {
      type: String,
      enum: ["online", "instore"], // online = user via app, instore = shopkeeper at counter
    },

    // ── Order Type ──────────────────────────────────────────
    orderType: {
      type: String,
      enum: ["delivery", "pickup", "inshop"],
      // delivery  → deliver to user's address
      // pickup    → user orders online, picks up from store
      // inshop    → shopkeeper creates order for walk-in customer
    },

    // ── Customer ────────────────────────────────────────────
    customer: {
      userId: mongoose.Schema.Types.ObjectId, // ref: users — null if walk-in
      name: String,
      phone: String,
      email: String,
      isWalkIn: Boolean, // true if shopkeeper created for anonymous customer
    },

    // ── Pharmacy ────────────────────────────────────────────
    pharmacy: {
      pharmacyId: mongoose.Schema.Types.ObjectId, // ref: pharmacies
      name: String,
      address: String,
      phone: String,
      email: String,
    },

    // ── Delivery Details (only if orderType = "delivery") ───
    delivery: {
      address: {
        line1: String,
        city: String,
        state: String,
        pincode: String,
        landmark: String,
      },
      scheduledAt: Date, // null = ASAP
      deliveredAt: Date,
      //  deliveryAgentId: ObjectId,      // ref: delivery_agents
      //  deliveryAgentName: String,
      //  trackingUrl: String,
      //  estimatedMinutes: Number
    },

    // ── Pickup Details (only if orderType = "pickup") ────────
    pickup: {
      scheduledAt: Date, // when customer said they'll pick up
      pickedUpAt: Date,
      //  pickedUpBy: String,             // name of person who picked up (may differ from customer)
      //  tokenNumber: String             // "P-042" shown at counter
    },

    // ── Items ───────────────────────────────────────────────
    items: [
      {
        medicineId: mongoose.Schema.Types.ObjectId, // ref: medicines
        name: String,
        brand: String,
        // sku: String,
        quantity: Number,
        unitPrice: Number,
        // mrp: Number,
        discount: Number, // per unit in %
        subtotal: Number, // (unitPrice - discount) * quantity
        requiresPrescription: Boolean,
        prescriptionVerified: Boolean, // shopkeeper verified Rx before dispensing
        // batchNumber: String,
        // expiryDate: Date
      },
    ],

    // ── Prescription ────────────────────────────────────────
    prescription: {
      required: Boolean,
      verified: Boolean,
      //  verifiedBy: ObjectId,           // ref: staff (shopkeeper who verified)
      verifiedAt: Date,
      documents: [
        {
          url: String,
          uploadedAt: Date,
          //   uploadedBy: {
          
          //     type: String,
          //     enum: ["user", "shopkeeper"]
          //   }
        },
      ],
    },

    // ── Pricing ─────────────────────────────────────────────
    pricing: {
      itemsTotal: Number, // sum of all item subtotals
      deliveryFee: Number, // 0 for pickup/inshop
      packagingFee: Number,
      //  taxAmount: Number,
      //  taxPercent: Number,             // e.g. 12 for 12% GST
      //  couponCode: String,
      //  couponDiscount: Number,
      grandTotal: Number, // final amount paid/payable
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
        "pending", // just placed, awaiting confirmation
        "confirmed", // pharmacy accepted
        "preparing", // being packed
        "ready_for_pickup", // (pickup orders) ready at counter
        "out_for_delivery", // (delivery orders) with agent
        "delivered", // delivery completed
        "picked_up", // pickup completed
        "completed", // inshop order done / payment received
        "cancelled",
        "refund_initiated",
        "refunded",
      ],
    },

    // ── Status Timeline ─────────────────────────────────────
    statusHistory: [
      {
        status: {
          type: String,
          enum: [
            "pending", // just placed, awaiting confirmation
            "confirmed", // pharmacy accepted
            "preparing", // being packed
            "ready_for_pickup", // (pickup orders) ready at counter
            "out_for_delivery", // (delivery orders) with agent
            "delivered", // delivery completed
            "picked_up", // pickup completed
            "completed", // inshop order done / payment received
            "cancelled",
            "refund_initiated",
            "refunded",
          ],
        },
        timestamp: Date,
        updatedBy: {
          type: String,
          enum: ["user", "shopkeeper", "system", "delivery_agent"],
        },
        note: String, // e.g. "Out of stock: Crocin 500mg"
        // Metadata for user-triggered updates
        userAction: {
          type: String,
          enum: [
            "confirmed_receipt", // user tapped "I received my order"
            "confirmed_pickup", // user tapped "I picked up my order"
            "reported_not_received", // user says order marked delivered but not received
            "requested_cancellation",
            "confirmed_cancellation_refund", // user acknowledged refund amount
          ],
        },
      },
    ],

    // ── Cancellation ────────────────────────────────────────
    cancellation: {
      // Current cancellation state
      status: {
        type: String,
        enum: [
          "none", // no cancellation activity
          "requested_by_user", // user raised cancel request
          "approved", // pharmacy approved the cancel request
          "rejected", // pharmacy rejected (order already dispatched)
          "auto_cancelled", // system cancelled (payment timeout, etc.)
        ],
      },
      cancelledAt: Date,
      cancelledBy: {
        type: String,
        enum: ["user", "shopkeeper", "system"],
      },
      // User's cancellation request
      userRequest: {
        requestedAt: Date,
        reason: {
          type: String,
          enum: [
            "ordered_by_mistake",
            "found_cheaper_elsewhere",
            "delivery_too_slow",
            "changed_my_mind",
            "duplicate_order",
            "other",
          ],
        },
        reason: String,
        refundEligible: Boolean,
      },
    },

    // ── Notes ───────────────────────────────────────────────
    notes: {
      fromUser: String, // special instructions from customer
      fromShopkeeper: String, // internal note by staff
    },
  },
);

const pharmacyOrder = mongoose.model("pharmacyOrder", pharmacyOrderSchema);

export default pharmacyOrder;
