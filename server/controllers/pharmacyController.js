import bcrypt from "bcrypt";
import pharmacyModel from "../models/Pharmacies.js";
import generateToken from "../utils/generateToken.js";

export const signUpPharmacy = async (req, res) => {
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
    const pharmacyExists = await pharmacyModel.findOne({
      $or: [{ number }, { email }],
    });
    if (pharmacyExists) {
      return res.json({
        success: false,
        message: "Pharmacy already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const pharmacy = await pharmacyModel.create({
      name,
      number,
      password: hashPassword,
      email,
      address,
    });

    res.json({
      success: true,
      pharmacy: {
        _id: pharmacy._id,
        name: pharmacy.name,
        email: pharmacy.email,
        number: pharmacy.number,
        address: pharmacy.address,
      },
      token: generateToken(pharmacy._id),
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const loginPharmacy = async (req, res) => {
  const { number, email, password } = req.body;
  if (password === "") {
    return res.json({ success: false, message: "Missing Details" });
  }
  try {
    if (number === "") {
      if (email === "") {
        return res.json({ success: false, message: "Missing Details" });
      }
      const pharmacy = await pharmacyModel.findOne({ email });
      if (!pharmacy) {
        return res.json({ success: false, message: "Invalid credentials" });
      }
      if (await bcrypt.compare(password, pharmacy.password)) {
        res.json({
          success: true,
          pharmacy: {
            _id: pharmacy._id,
            name: pharmacy.name,
            email: pharmacy.email,
            number: pharmacy.number,
            address: pharmacy.address,
          },
          token: generateToken(pharmacy._id),
        });
      } else {
        res.json({ success: false, message: "Invalid credentials" });
      }
    } else if (email === "") {
      if (number === "") {
        return res.json({ success: false, message: "Missing Details" });
      }
      const pharmacy = await pharmacyModel.findOne({ number });
      if (!pharmacy) {
        return res.json({ success: false, message: "Invalid credentials" });
      }
      if (await bcrypt.compare(password, pharmacy.password)) {
        res.json({
          success: true,
          pharmacy: {
            _id: pharmacy._id,
            name: pharmacy.name,
            email: pharmacy.email,
            number: pharmacy.number,
            address: pharmacy.address,
          },
          token: generateToken(pharmacy._id),
        });
      } else {
        res.json({ success: false, message: "Invalid credentials" });
      }
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getPharmacy = async (req, res) => {
  try {
    const pharmacy = req.pharmacy;
    res.json({ success: true, pharmacy });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

export const getPharmacyByUser = async (req, res) => {
  try {
    const pharmacy = await pharmacyModel.findOne({ _id: req.params.id });
    res,
      jsob({
        success: true,
        pharmacy,
      });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

export const deletePharmacy = async (req, res) => {};

export const editPharmacy = async (req, res) => {};

export const setPassword = async (req, res) => {};
