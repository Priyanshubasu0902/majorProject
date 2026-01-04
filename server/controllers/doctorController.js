import bcrypt from "bcrypt";
import doctorModel from "../models/Doctors.js";
import generateToken from "../utils/generateToken.js";

export const signUpDoctor = async (req, res) => {
  const {
    name,
    email,
    number,
    password,
    age,
    gender,
    registration_No,
    experience,
  } = req.body;

  if (
    name === "" ||
    email === "" ||
    number === "" ||
    password === "" ||
    age === "" ||
    gender === "" ||
    registration_No === "" ||
    experience === ""
  ) {
    return res.json({ success: false, message: "Missing Details" });
  }

  try {
    const doctorExists = await doctorModel.findOne({
      $or: [{ number }, { email }, { registration_No }],
    });
    if (doctorExists) {
      return res.json({
        success: false,
        message: "Doctor already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const doctor = await doctorModel.create({
      name,
      number,
      password: hashPassword,
      email,
      age,
      gender,
      registration_No,
      experience,
    });

    res.json({
      success: true,
      doctor: {
        _id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        number: doctor.number,
        age: doctor.age,
        gender: doctor.gender,
        experience: doctor.experience,
      },
      token: generateToken(doctor._id),
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const loginDoctor = async (req, res) => {
  const { number, email, password } = req.body;
  if (password === "" || (number === "" && email === "")) {
    return res.json({ success: false, message: "Missing Details" });
  }
  try {
    const doctor = await doctorModel.findOne({
      $or: [{ number }, { email }],
    });
    if (!doctor) {
      return res.json({ success: false, message: "Invalid credentials" });
    }
    if (await bcrypt.compare(password, doctor.password)) {
      res.json({
        success: true,
        doctor: {
          _id: doctor._id,
          name: doctor.name,
          email: doctor.email,
          number: doctor.number,
          age: doctor.age,
          gender: doctor.gender,
          experience: doctor.experience,
        },
        token: generateToken(doctor._id),
      });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getDoctor = async (req, res) => {
  try {
    const doctor = req.doctor;
    res.json({ success: true, doctor });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

export const getDoctorByUser = async (req, res) => {
  try {
    const doctor = await doctorModel.findOne(
      { _id: req.params.id },
      { name, email, number, experience, gender, age }
    );
    res,
      jsob({
        success: true,
        doctor,
      });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteDoctor = async (req, res) => {
  
};

export const editDoctor = async (req, res) => {};

export const setPassword = async (req, res) => {};
