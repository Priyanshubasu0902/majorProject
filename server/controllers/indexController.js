import otpGenerator from "otp-generator";
import otpModel from "../models/Otp.js";
import { transporter } from "../config/nodeMailer.js";

export const generateOtp = async (req, res) => {
  const { email } = req.body;

  if (email === "") {
    return res.json({ success: false, message: "Error" });
  }

  try {
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    await otpModel.create({ email, otp });

    const mailOptions = {
      from: `"MedLux" <${process.env.EMAIL_ID}>`,
      to: email,
      subject: "Your MedLux Verification Code",
      // Plain text fallback for email clients that don't support HTML
      text: `Your MedLux OTP is: ${otp}\n\nThis code expires in 10 minutes. Do not share it with anyone.`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        </head>
        <body style="margin:0; padding:0; background-color:#f1f5f9; font-family: Arial, sans-serif;">

          <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 16px;">
            <tr>
              <td align="center">
                <table width="100%" style="max-width:520px; background:#ffffff; border-radius:20px; overflow:hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">

                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 36px 40px; text-align:center;">
                      <h1 style="margin:0; color:#ffffff; font-size:26px; font-weight:700; letter-spacing:-0.5px;">
                        Med<span style="color:#a7f3d0;">Lux</span>
                      </h1>
                      <p style="margin:6px 0 0 0; color:#d1fae5; font-size:13px; letter-spacing:0.5px;">
                        VERIFICATION CODE
                      </p>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding: 40px 40px 32px 40px;">
                      <p style="margin:0 0 8px 0; color:#0f172a; font-size:18px; font-weight:600;">
                        Verify your email
                      </p>
                      <p style="margin:0 0 32px 0; color:#64748b; font-size:14px; line-height:1.6;">
                        Use the code below to complete your verification. 
                        This code is valid for <strong style="color:#0f172a;">10 minutes</strong>.
                      </p>

                      <!-- OTP box -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                        <tr>
                          <td align="center">
                            <div style="
                              display: inline-block;
                              background: #f0fdf4;
                              border: 2px dashed #059669;
                              border-radius: 16px;
                              padding: 20px 48px;
                            ">
                              <p style="
                                margin: 0;
                                font-size: 40px;
                                font-weight: 800;
                                letter-spacing: 12px;
                                color: #059669;
                                font-family: 'Courier New', Courier, monospace;
                              ">${otp}</p>
                            </div>
                          </td>
                        </tr>
                      </table>

                      <!-- Warning box -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                        <tr>
                          <td style="
                            background: #fefce8;
                            border-left: 4px solid #eab308;
                            border-radius: 0 12px 12px 0;
                            padding: 14px 16px;
                          ">
                            <p style="margin:0; color:#854d0e; font-size:13px; line-height:1.5;">
                              <strong>⚠ Security notice:</strong> MedLux will never ask for 
                              your OTP over a call or message. Do not share this code with anyone.
                            </p>
                          </td>
                        </tr>
                      </table>

                      <p style="margin:0; color:#94a3b8; font-size:13px; line-height:1.6;">
                        If you didn't request this code, you can safely ignore this email. 
                        Someone may have entered your email by mistake.
                      </p>
                    </td>
                  </tr>

                  <!-- Divider -->
                  <tr>
                    <td style="padding: 0 40px;">
                      <hr style="border:none; border-top:1px solid #e2e8f0; margin:0;" />
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 24px 40px; text-align:center;">
                      <p style="margin:0 0 4px 0; color:#94a3b8; font-size:12px;">
                        © ${new Date().getFullYear()} MedLux. All rights reserved.
                      </p>
                      <p style="margin:0; color:#cbd5e1; font-size:11px;">
                        This is an automated message — please do not reply to this email.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>

        </body>
        </html>
      `,
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
    console.log(error.message);
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
