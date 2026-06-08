const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  // Reuse authenticated connections instead of re-doing the TCP+STARTTLS+AUTH
  // handshake on every send. Cuts per-email cost and avoids connection-rate
  // throttling from the SMTP provider under bursts.
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: true,
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
