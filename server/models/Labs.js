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
  // address: {
  //   line1: {type: String},
  //   line2: {type: String},
  //   landmark: {type: String},
  //   state: {type: String, required: true},
  //   city: {type: String, required: true},
  //   pincode: {type: Number, required: true},
  // },
  address: {type: String, required: true},
  isApproved: {
    type: Boolean,
    default: false,
    enum: [true, false],
    required: true
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
  serviceType: {
    type: String,
    default: 'both',
    enum: ['atHome', 'atLab', 'both'],
    required: true,
  },
});

const lab = mongoose.model("lab", labSchema);

export default lab;
