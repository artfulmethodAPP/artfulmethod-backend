const transporter = require("../config/email.config");
const { EmailLog } = require("../models");
const AppError = require("../utils/app-error");

const sendOTPEmail = async (email, otp_code, user_id) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Email Verification OTP",
    html: `
      <h2>Email Verification</h2>
      <p>Your OTP code is:</p>
      <h1 style="color: #4CAF50; letter-spacing: 5px;">${otp_code}</h1>
      <p>This OTP will expire in <b>5 minutes</b>.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);

    // Success log
    await EmailLog.create({
      user_id,
      email,
      email_type: "otp",
      subject: "Email Verification OTP",
      status: "sent",
      sent_at: new Date(),
    });
  } catch (error) {
    // Failed log
    await EmailLog.create({
      user_id,
      email,
      email_type: "otp",
      subject: "Email Verification OTP",
      status: "failed",
      error_message: error.message,
      sent_at: new Date(),
    });

    throw new AppError("Failed to send OTP email", 500, "EMAIL_SEND_FAILED");
  }
};

const sendResetPasswordOTPEmail = async (email, otp_code, user_id) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Reset Password OTP",
    html: `
      <h2>Reset Password</h2>
      <p>Your OTP code for password reset is:</p>
      <h1 style="color: #FF5722; letter-spacing: 5px;">${otp_code}</h1>
      <p>This OTP will expire in <b>5 minutes</b>.</p>
      <p>If you didn't request a password reset, please ignore this email.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);

    // Success log
    await EmailLog.create({
      user_id,
      email,
      email_type: "forgot-password",
      subject: "Reset Password OTP",
      status: "sent",
      sent_at: new Date(),
    });
  } catch (error) {
    // Failed log
    await EmailLog.create({
      user_id,
      email,
      email_type: "forgot-password",
      subject: "Reset Password OTP",
      status: "failed",
      error_message: error.message,
      sent_at: new Date(),
    });

    throw new AppError("Failed to send OTP email", 500, "EMAIL_SEND_FAILED");
  }
};

module.exports = { sendOTPEmail, sendResetPasswordOTPEmail };
