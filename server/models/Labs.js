import mongoose from "mongoose";

const labSchema = mongoose.Schema({
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

const lab = mongoose.model("lab", labSchema);

export default lab;
