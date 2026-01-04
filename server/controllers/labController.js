import bcrypt from "bcrypt";
import labModel from "../models/Labs.js";
import generateToken from "../utils/generateToken.js";

export const signUpLab = async (req, res) => {
  const { name, email, number, password, address } = req.body;

  if (
    name === "" ||
    email === "" ||
    number === "" ||
    password === "" ||
    address === ""
  ) {
    return res.json({ success: false, message: "Missing Details" });
  }

  try {
    const labExists = await labModel.findOne({
      $or: [{ number }, { email }],
    });
    if (labExists) {
      return res.json({
        success: false,
        message: "Lab already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const lab = await labModel.create({
      name,
      number,
      password: hashPassword,
      email,
      address,
    });

    res.json({
      success: true,
      lab: {
        _id: lab._id,
        name: lab.name,
        email: lab.email,
        number: lab.number,
        address: lab.address,
      },
      token: generateToken(lab._id),
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const loginLab = async (req, res) => {
  const { number, email, password } = req.body;
  if (password === "" || (number===""&&email==="")) {
    return res.json({ success: false, message: "Missing Details" });
  }
  try {
      const lab = await labModel.findOne({ $or: [{number},{email}] });
      if (!lab) {
        return res.json({ success: false, message: "Invalid credentials" });
      }
      if (await bcrypt.compare(password, lab.password)) {
        res.json({
          success: true,
          lab: {
            _id: lab._id,
            name: lab.name,
            email: lab.email,
            number: lab.number,
            address: lab.address,
          },
          token: generateToken(lab._id),
        });
      } else {
        res.json({ success: false, message: "Invalid credentials" });
      }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getLab = async (req, res) => {
  try {
    const lab = req.lab;
    res.json({ success: true, lab });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

export const getLabByUser = async (req, res) => {
  try {
    const lab = await labModel.findOne({ _id: req.params.id });
    res,
      jsob({
        success: true,
        lab,
      });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteLab = async (req, res) => {};

export const editLab = async (req, res) => {};

export const setPassword = async (req, res) => {};
