const { z } = require("zod");

// =====================
// Register Schema
// =====================
const registerSchema = z.object({
  name: z
    .string({ error: "Name is required" })
    .min(3, "Name must be at least 3 characters")
    .max(100),

  email: z
    .string({ error: "Email is required" })
    .email("Invalid email format")
    .max(100),

  password: z
    .string({ error: "Password is required" })
    .min(6, "Password must be at least 6 characters")
    .max(100),

  gender: z.enum(["male", "female", "others"], {
    error: "Gender is required",
  }),
});

// =====================
// Verify OTP Schema
// =====================
const verifyOtpSchema = z.object({
  email: z.string({ error: "Email is required" }).email("Invalid email format"),

  otp_code: z
    .string({ error: "OTP is required" })
    .min(1, "Invalid OTP")
    .max(10, "Invalid OTP")
    .regex(/^\d+$/, "Invalid OTP"),
});

// =====================
// Login Schema
// =====================
const loginSchema = z.object({
  email: z
    .string({ error: "Email is required" })
    .email("Invalid email format")
    .max(100),

  password: z
    .string({ error: "Password is required" })
    .min(6, "Password must be at least 6 characters")
    .max(100),
});

// =====================
// Token Schemas
// =====================
const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

const logoutSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

// =====================
// Forgot Password Schema
// =====================
const forgotPasswordSchema = z.object({
  email: z
    .string({ error: "Email is required" })
    .email("Invalid email format")
    .max(100),
});

// =====================
// Reset Password Schema
// =====================
const resetPasswordSchema = z.object({
  email: z
    .string({ error: "Email is required" })
    .email("Invalid email format")
    .max(100),

  otp_code: z
    .string({ error: "OTP is required" })
    .min(1, "Invalid OTP")
    .max(10, "Invalid OTP")
    .regex(/^\d+$/, "Invalid OTP"),

  newPassword: z
    .string({ error: "New password is required" })
    .min(6, "Password must be at least 6 characters")
    .max(100),
});

// =====================
// FINAL EXPORT
// =====================
module.exports = {
  registerSchema,
  verifyOtpSchema,
  loginSchema,
  refreshTokenSchema,
  logoutSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};
