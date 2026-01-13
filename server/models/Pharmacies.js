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
  password: { type: String, required: true },
  // address: {
  //   line1: {type: String},
  //   line2: {type: String},
  //   landmark: {type: String},
  //   state: {type: String, required: true},
  //   city: {type: String, required: true},
  //   pincode: {type: Number, required: true},
  // },
  address: {
    type: String,
    required: true,
  },
  isApproved: {
    type: Boolean,
    default: false,
    enum: [true, false],
    required: true,
  },
  gstNumber: {
    type: String,
  },
  licenseNumber: {
    type: String,
  },
  licenseFile: {
    type: String,
  },
  gstFile: {
    type: String,
  },
  nablFile: {
    type: String,
  },
  image: { type: String },
  delivery: {
    type: Boolean,
    default: true,
    enum: [true, false],
    required: true,
  },
  pickup: {
    type: Boolean,
    default: true,
    enum: [true, false],
    required: true,
  },
});

const pharmacy = mongoose.model("pharmacy", pharmacySchema);

export default pharmacy;
