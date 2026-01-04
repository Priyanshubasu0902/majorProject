import mongoose from "mongoose";

const doctorSchema = mongoose.Schema({
});

const doctor = mongoose.model("doctor", doctorSchema);

export default doctor;
