import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  label: { type: String, default: "Home" },
  line1: { type: String, required: true },
  line2: { type: String, default: "" },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  country: { type: String, default: "India" },
  isDefault: { type: Boolean, default: false },
  // Geocoded coordinates — populated automatically on save
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number] }, // [lng, lat]
  },
});

const pharmacyCartItemSchema = new mongoose.Schema({
  medicineId: { type: mongoose.Schema.Types.ObjectId, ref: "pharmacyProduct" },
  pharmacyId: { type: mongoose.Schema.Types.ObjectId, ref: "pharmacy" },
  quantity: { type: Number, default: 1 },
});

const labCartItemSchema = new mongoose.Schema({
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "labService" },
  labId: { type: mongoose.Schema.Types.ObjectId, ref: "lab" },
  scheduledDate: { type: Date, default: null },
  scheduledSlot: { type: String, default: "" },
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    number: { type: String, required: true, unique: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ["male", "female", "other"], required: true },
    password: { type: String, required: true },
    profileImage: { type: String, default: "" },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: undefined },
    },
    addresses: { type: [addressSchema], default: [] },
    pharmacyCart: { type: [pharmacyCartItemSchema], default: [] },
    labCart: { type: [labCartItemSchema], default: [] },
  },
  { timestamps: true }
);

userSchema.index({ location: "2dsphere" });

const user = mongoose.models.user || mongoose.model("user", userSchema);

export default user;