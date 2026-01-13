import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import pharmacyModel from "../models/Pharmacies.js";
import generateToken from "../utils/generateToken.js";
import pharmacyProductModel from "../models/PharmacyProduct.js";

export const signUpPharmacy = async (req, res) => {
  const { name, email, number, password, address, gstNumber, licenseNumber } =
    req.body;

  const gst = req.files.gstFile[0];
  const license = req.files.licenseFile[0];
  const nabl = req.files.nablFile[0];

  if (
    name === "" ||
    email === "" ||
    number === "" ||
    password === "" ||
    address === "" ||
    gstNumber === "" ||
    licenseNumber === "" ||
    !gst ||
    !license ||
    !nabl
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

    const gstFileUpload = await cloudinary.uploader.upload(gst.path);
    const licenseFileUpload = await cloudinary.uploader.upload(license.path);
    const nablFileUpload = await cloudinary.uploader.upload(nabl.path);

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const pharmacy = await pharmacyModel.create({
      name,
      number,
      password: hashPassword,
      email,
      address,
      licenseNumber,
      gstNumber,
      licenseFile: licenseFileUpload.secure_url,
      gstFile: gstFileUpload.secure_url,
      nablFile: nablFileUpload.secure_url,
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

export const addProduct = async (req, res) => {
  try {
    const {
      name,
      type,
      productNo,
      quantity,
      no_of_Product,
      price,
      discount,
      companyName,
      visibility,
      prescription_required,
    } = req.body;

    const image = req.file;
    const user = req.pharmacy;

    if (
      name === "" ||
      type === "" ||
      companyName === "" ||
      visibility === "" ||
      prescription_required === ""||
      price === ""||
      discount === "" || 
      productNo === "" ||
      quantity === "" ||
      no_of_Product === ""||
      !image
    ) {
      return res.json({ success: false, message: "Missing Details" });
    }

    const fileUpload = await cloudinary.uploader.upload(image.path);

    const product = await pharmacyProductModel.create({
      name,
      type,
      pharmacyId: user._id,
      productNo,
      quantity,
      no_of_Product,
      price,
      discount,
      companyName,
      visibility,
      prescription_required,
      image: fileUpload.secure_url
    });

     res.json({
      success: true,
      product,
    });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const updateProduct = async (req, res) => {

};

export const incrementQuantity = async (req, res) => {
  try {
    const user = req.pharmacy;
  } catch (error) {
    
  }
};

export const decrementQuantity = async (req, res) => {

};

export const removeProduct = async (req, res) => {

};

export const changeVisibility = async (req, res) => {

};

export const viewOrders = async (req, res) => {

}

export const updateOrderStatus = async (req, res) => {

}

export const checkInventory = async(req, res) => {

}

export const placeOrder = async(req, res) => {
  
}



