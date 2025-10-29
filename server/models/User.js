import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  number: { type: Number, required: true, unique: true },
  image: { type: String},
  public_id: { type: String},
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  password: { type: String, required: true },
});

const user = mongoose.model("user", userSchema);

export default user;
