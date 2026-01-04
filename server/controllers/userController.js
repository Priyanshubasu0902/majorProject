import bcrypt from "bcrypt";
import userModel from "../models/User.js";
import generateToken from "../utils/generateToken.js";

export const signUpUser = async (req, res) => {
  const { name, email, number, age, gender, password } = req.body;

  if (
    name === "" ||
    email === "" ||
    number === "" ||
    age === "" ||
    gender === "" ||
    password === ""
  ) {
    return res.json({ success: false, message: "Missing Details" });
  }

  try {
    const userExists = await userModel.findOne({ email });
    if (userExists) {
      return res.json({
        success: false,
        message: "User already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const user = await userModel.create({
      name,
      number,
      age,
      gender,
      password: hashPassword,
      email,
    });


    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        number: user.number,
        gender: user.gender,
        age: user.age,
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const loginUser = async (req, res) => {
  const { number, email, password } = req.body;
  if (password === "") {
    return res.json({ success: false, message: "Missing Details" });
  }
  try {
    if (number === "") {
      if (email === "") {
        return res.json({ success: false, message: "Missing Details" });
      }
      const user = await userModel.findOne({ email });
      if (!user) {
        return res.json({ success: false, message: "Invalid credentials" });
      }
      if (await bcrypt.compare(password, user.password)) {
        res.json({
          success: true,
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            number: user.number,
            gender: user.gender,
            age: user.age,
          },
          token: generateToken(user._id),
        });
      } else {
        res.json({ success: false, message: "Invalid credentials" });
      }
    } else if (email === "") {
      if (number === "") {
        return res.json({ success: false, message: "Missing Details" });
      }
      const user = await userModel.findOne({ number });
      if (!user) {
        return res.json({ success: false, message: "Invalid credentials" });
      }
      if (await bcrypt.compare(password, user.password)) {
        res.json({
          success: true,
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            number: user.number,
            gender: user.gender,
            age: user.age,
          },
          token: generateToken(user._id),
        });
      } else {
        res.json({ success: false, message: "Invalid credentials" });
      }
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getUser = async (req, res) => {
  try {
    const user = req.user;
    res.json({ success: true, user });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteUser = async (req, res) => {
  
};

export const editUser = async (req, res) => {
 
};

export const setPassword = async (req, res) => {
  
};
