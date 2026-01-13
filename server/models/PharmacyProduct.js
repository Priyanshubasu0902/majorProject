import mongoose from "mongoose";

const pharmacyProductSchema = mongoose.Schema({
  name: { type: String, required: true },
  pharmacyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "pharmacy",
    required: true,
  },
  type: { type: String, required: true },
  productNo: { type: String },
  quantity: {
    amount: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      enum: ["tablet", "ml", "items"],
      required: true,
    },
  },
  no_of_Product: { type: Number, default: 0, requried: true },
  price: { type: Number, default: 0, required: true },
  discount: { type: Number, default: 0, required: true },
  companyName: { type: String, required: true },
  image: { type: String },
  visibility: {
    type: Boolean,
    enum: [true, false],
    default: false,
    required: true,
  },
  prescription_required: {
    type: Boolean,
    enum: [true, false],
    default: false,
    required: true,
  },
});

const pharmacyProduct = mongoose.model(
  "pharmacyProduct",
  pharmacyProductSchema
);

export default pharmacyProduct;
