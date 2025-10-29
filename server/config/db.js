import mongoose from "mongoose";
import debug from 'debug'

const env = process.env.NODE_ENV || "development";
const dbgr = debug(`${env}:mongoose`);

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", ()=>dbgr("connected"));

    if (env == "development") {
      mongoose.connect("mongodb://127.0.0.1:27017/majorProject");
    } else if (env == "production") {
      mongoose.connect(`${process.env.MONGODB_URI}`);
    }
  } catch (error) {
    console.log(error.message);
  }
};

export default connectDB
