import mongoose from "mongoose";

const doctorSchema = mongoose.Schema({
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
  age: {
    type: Number,
    min: 0,
    max: 100,
    required: true,
  },
  gender: {
    type: String,
    required: true,
    enum: ["Male", "Female", "Others"],
  },
  password: { type: String, required: true },
  experience: {
    type: Number,
    required: true,
    min: 0,
    max: 80,
  },
  description: {type: String},
  registration_No: { type: Number, required: true },
  isApproved: {
    type: Boolean,
    default: false,
    enum: [true, false],
    required: true
  }
});

const doctor = mongoose.model("doctor", doctorSchema);

export default doctor;
