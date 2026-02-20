import mongoose from "mongoose";

const labServiceSchema = mongoose.Schema({
  name: { type: String, required: true },
  description: {
    type: String,
    required: true
  },
  outcome:{
    type: String,
    required: true
  },
  labId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "lab",
    required: true,
  },
  type: { type: String, required: true },
  serviceNo: { type: String },
  requirement: {
    type: String, 
    required: true
  },
  price: { type: Number, default: 0, required: true },
  discount: { type: Number, default: 0, required: true },
  duration_of_test: {
    value:{
      type: Number,
      required: true
    },
    unit:{
      type: String,
      enum:['hours', 'minutes', 'seconds'],
      required: true
    } 
  },
  duration_of_result: {
    value:{
      type: Number,
      required: true
    },
    unit:{
      type: String,
      enum:['hours', 'minutes', 'seconds'],
      required: true
    } 
  },
  visitLab: {
    type: Boolean,
    required: true,
    default: false
  },
  caution: {
    type: String
  },
  visibility: {
    type: Boolean,
    enum: [true, false],
    default: false,
    required: true,
  },
  image: { type: String },
});

const labService = mongoose.model(
  "labService",
  labServiceSchema
);

export default labService;
