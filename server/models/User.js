import mongoose from "mongoose";

const userSchema = mongoose.Schema({
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
  public_id: { type: String },
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
   // address: {
  //   line1: {type: String},
  //   line2: {type: String},
  //   landmark: {type: String},
  //   state: {type: String, required: true},
  //   city: {type: String, required: true},
  //   pincode: {type: Number, required: true},
  // },
  address: {type: String, required: true},
});

const user = mongoose.model("user", userSchema);

export default user;
