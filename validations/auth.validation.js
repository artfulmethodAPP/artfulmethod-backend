const { z } = require("zod");

// =====================
// Register Schema
// =====================
const registerSchema = z.object({
  email: z
    .string({ error: "Email is required" })
    .email("Invalid email format")
    .max(100),

  password: z
    .string({ error: "Password is required" })
    .min(8, "Password must be at least 8 characters")
    .max(100),

  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(100)
    .optional(),

  dob: z.string().optional(),

  gender: z.enum(["male", "female", "other"]).optional(),

  goal: z.string().max(255).optional(),

  art_frequency: z.string().max(255).optional(),

  source: z.string().max(255).optional(),

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
    .min(8, "Password must be at least 8 characters")
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
  token: z.string({ error: "Reset token is required" }).min(1, "Reset token is required"),

  newPassword: z
    .string({ error: "New password is required" })
    .min(8, "Password must be at least 8 characters")
    .max(100),
});

// =====================
// Check Email Schema
// =====================
const checkEmailSchema = z.object({
  email: z
    .string({ error: "Email is required" })
    .email("Invalid email format")
    .max(100),
});

// =====================
// Personal Info Schema
// =====================
const updatePersonalInfoSchema = z.object({
  name: z.string().min(1, "Name cannot be empty").max(100).optional(),
  dob: z.string().optional(),
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
  updatePersonalInfoSchema,
  checkEmailSchema,
};
