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
    .min(6, "Password must be at least 6 characters")
    .max(100),

  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(100)
    .optional(),

  dob: z.string().optional(),

  gender: z.enum(["male", "female", "other"]).optional(),

  goal: z.string().max(255).optional(),

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
// Update Profile Schema
// =====================
const updateProfileSchema = z
  .object({
    name: z.string().min(3, "Name must be at least 3 characters").max(100).optional(),
    dob: z.string().optional(),
    gender: z.enum(["male", "female", "other"]).optional(),
    goal: z.string().max(255).optional(),
    source: z.string().max(255).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required to update",
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
  updateProfileSchema,
};
