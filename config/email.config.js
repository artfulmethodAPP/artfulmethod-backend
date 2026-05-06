const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false, 
  },
});

async function verifyTransporter() {
  try {
    await transporter.verify();
    console.log("SMTP connected successfully");
  } catch (error) {
    console.error("SMTP connection failed:", error.message);
  }
}

verifyTransporter();

module.exports = transporter;
