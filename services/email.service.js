const resend = require("../config/email.config");
const { EmailLog } = require("../models");
const AppError = require("../utils/app-error");

const FROM_ADDRESS = "noreply@notification.artfulmethod.org";

const sendOTPEmail = async (email, otp_code, user_id) => {
  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: email,
      subject: "Email Verification OTP",
      html: `
        <h2>Email Verification</h2>
        <p>Your OTP code is:</p>
        <h1 style="color: #4CAF50; letter-spacing: 5px;">${otp_code}</h1>
        <p>This OTP will expire in <b>5 minutes</b>.</p>
      `,
    });

    await EmailLog.create({
      user_id,
      email,
      email_type: "otp",
      subject: "Email Verification OTP",
      status: "sent",
      sent_at: new Date(),
    });
  } catch (error) {
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

const sendResetPasswordLinkEmail = async (email, resetLink, user_id) => {
  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: email,
      subject: "Forgotten password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; color: #111;">
          <h2 style="font-size: 22px; font-weight: 700; margin-bottom: 12px;">Password reset</h2>
          <p style="font-size: 14px; color: #444; margin-bottom: 24px;">
            Use the button below to set up a new password for your account. If you did not request to
            reset your password, ignore this email and the link will expire on its own within 1 hour.
          </p>
          <a href="${resetLink}"
             style="display: inline-block; background-color: #111; color: #fff; text-decoration: none;
                    font-size: 14px; font-weight: 700; letter-spacing: 1px; padding: 14px 32px;
                    border-radius: 4px; text-transform: uppercase;">
            RESET PASSWORD
          </a>
          <p style="font-size: 12px; color: #888; margin-top: 24px;">
            Link doesn't work? Copy and paste it into your browser:<br/>
            <span style="color: #444;">${resetLink}</span>
          </p>
          <p style="font-size: 11px; color: #aaa; margin-top: 32px;">© ${new Date().getFullYear()}</p>
        </div>
      `,
    });

    await EmailLog.create({
      user_id,
      email,
      email_type: "forgot-password",
      subject: "Forgotten password",
      status: "sent",
      sent_at: new Date(),
    });
  } catch (error) {
    await EmailLog.create({
      user_id,
      email,
      email_type: "forgot-password",
      subject: "Forgotten password",
      status: "failed",
      error_message: error.message,
      sent_at: new Date(),
    });

    throw new AppError("Failed to send reset password email", 500, "EMAIL_SEND_FAILED");
  }
};

module.exports = { sendOTPEmail, sendResetPasswordLinkEmail };
