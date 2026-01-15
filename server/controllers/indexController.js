import otpGenerator from "otp-generator";
import otpModel from "../models/Otp.js";
import { transporter } from "../config/nodeMailer.js";

export const generateOtp = async (req, res) => {
  const { email } = req.body;

  if (email==='') {
    return res.json({ success: false, message: "Error" });
  }

  try {
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    await otpModel.create({
      email,
      otp,
    });

    let mailOptions = {
      from: process.env.EMAIL_ID,
      to: email,
      subject: "Email from Medicare",
      text: "Hi Your OTP for verification is " + otp,
    };

    await transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    res.json({ success: true, message: "OTP sent to your email" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (email==='' || otp==='') {
    return res.json({ success: false, message: "Missing Details" });
  }

  try {
    const otpRecord = await otpModel.findOne({ email, otp });

    if (!otpRecord) {
      return res.json({ success: false, message: "Incorrect OTP" });
    }

    res.json({ success: true, message: "OTP verified successfully"});
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
