import mongoose from "mongoose";

const pharmacySchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  number: {
    type: Number,
    required: true,
    unique: true,
    min: 1000000000,
    max: 9999999999,
  },
  image: { type: String },
  password: { type: String, required: true },
  address: {type: String, required: true},
  isApproved: {
    type: Boolean,
    default: false,
    enum: [true, false],
    required: true
  },
});

const pharmacy = mongoose.model("pharmacy", pharmacySchema);

export default pharmacy;
