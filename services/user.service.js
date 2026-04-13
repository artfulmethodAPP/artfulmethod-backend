const { User, RefreshToken } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/app-error");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const { sendOTPEmail, sendResetPasswordOTPEmail } = require("./email.service");

// =====================
// Helper Functions
// =====================
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// =====================
// Auth Functions
// =====================
const register = async ({ email, password, name, dob, gender, goal, art_frequency, source }) => {
  const existingUser = await User.findOne({ where: { email } });

  if (existingUser) {
    if (existingUser.is_verified) {
      throw new AppError("User already exists", 409, "CONFLICT");
    }
    // await existingUser.destroy({ force: true });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const otp_code = generateOTP();
  const otp_expires_at = new Date(Date.now() + 5 * 60 * 1000);

  const user = await User.create({
    email,
    password: hashedPassword,
    name: name || null,
    dob: dob || null,
    gender: gender || null,
    goal: goal || null,
    art_frequency: art_frequency || null,
    source: source || null,
    otp_code,
    otp_expires_at,
  });

  await sendOTPEmail(email, otp_code, user.id);

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    created_at: user.created_at,
  };
};

const verifyOTP = async ({ email, otp_code }) => {
  const user = await User.findOne({ where: { email } });

  if (!user) throw new AppError("User not found", 404, "NOT_FOUND");

  if (user.is_verified) {
    throw new AppError("User already verified", 409, "CONFLICT");
  }

  if (user.otp_code !== otp_code) {
    throw new AppError("Invalid OTP", 400, "VALIDATION_ERROR");
  }

  if (new Date() > new Date(user.otp_expires_at)) {
    throw new AppError("OTP expired", 400, "VALIDATION_ERROR");
  }

  await user.update({
    is_verified: true,
    otp_code: null,
    otp_expires_at: null,
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ where: { email } });

  if (!user) {
    throw new AppError("Invalid email or password", 401, "UNAUTHORIZED");
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password);

  if (!isPasswordMatch) {
    throw new AppError("Invalid email or password", 401, "UNAUTHORIZED");
  }

  if (!user.is_verified) {
    const otp_code = generateOTP();
    const otp_expires_at = new Date(Date.now() + 5 * 60 * 1000);

    await user.update({
      otp_code,
      otp_expires_at,
    });

    await sendOTPEmail(email, otp_code,user.id);
    throw new AppError(
      "Please verify your email first. A new OTP has been sent to your email.",
      403,
      "FORBIDDEN",
    );
  }

  const tokens = await generateAuthTokens(user);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      gender: user.gender,
    },
    tokens,
  };
};

const forgotPassword = async (email) => {
  const user = await User.findOne({ where: { email } });

  if (!user) {
    throw new AppError("User not found", 404, "NOT_FOUND");
  }

  if (!user.is_verified) {
    throw new AppError("Please verify your email first", 403, "FORBIDDEN");
  }

  const otp_code = generateOTP();
  const otp_expires_at = new Date(Date.now() + 5 * 60 * 1000);

  await user.update({
    otp_code,
    otp_expires_at,
  });

  await sendResetPasswordOTPEmail(email, otp_code,user.id);

  return { message: "OTP sent to your email" };
};

const resetPassword = async ({ email, otp_code, newPassword }) => {
  const user = await User.findOne({ where: { email } });

  if (!user) {
    throw new AppError("User not found", 404, "NOT_FOUND");
  }

  if (user.otp_code !== otp_code) {
    throw new AppError("Invalid OTP", 400, "VALIDATION_ERROR");
  }

  if (new Date() > new Date(user.otp_expires_at)) {
    throw new AppError("OTP expired", 400, "VALIDATION_ERROR");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await user.update({
    password: hashedPassword,
    otp_code: null,
    otp_expires_at: null,
  });

  return { message: "Password reset successful" };
};

const generateAuthTokens = async (user) => {
  const accessToken = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: "1h",
  });

  const refreshToken = jwt.sign({ id: user.id }, JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await RefreshToken.create({
    user_id: user.id,
    token: refreshToken,
    token_type: "refresh",
    expires_at: expiresAt,
  });

  return {
    access: accessToken,
    refresh: refreshToken,
  };
};

const refreshAuth = async (refreshToken) => {
  try {
    const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET);

    const refreshTokenDoc = await RefreshToken.findOne({
      where: {
        token: refreshToken,
        user_id: payload.id,
        is_revoked: false,
        token_type: "refresh",
      },
    });

    if (!refreshTokenDoc) {
      throw new AppError(
        "Invalid or revoked refresh token",
        401,
        "UNAUTHORIZED",
      );
    }

    const user = await User.findByPk(payload.id);

    if (!user) {
      throw new AppError("User not found", 404, "NOT_FOUND");
    }

    // revoke old token
    refreshTokenDoc.is_revoked = true;
    await refreshTokenDoc.save();

    return generateAuthTokens(user);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Invalid or revoked refresh token", 401, "UNAUTHORIZED");
  }
};

const logout = async (refreshToken) => {
  const refreshTokenDoc = await RefreshToken.findOne({
    where: {
      token: refreshToken,
      token_type: "refresh",
      is_revoked: false,
    },
  });

  if (!refreshTokenDoc) {
    throw new AppError(
      "Refresh token not found or already revoked",
      404,
      "NOT_FOUND",
    );
  }

  refreshTokenDoc.is_revoked = true;
  await refreshTokenDoc.save();
};

const updateProfile = async (userId, { name, dob, gender, goal, art_frequency, source }) => {
  const user = await User.findByPk(userId);

  if (!user) {
    throw new AppError("User not found", 404, "NOT_FOUND");
  }

  const updates = {};
  if (name !== undefined) updates.name = name;
  if (dob !== undefined) updates.dob = dob;
  if (gender !== undefined) updates.gender = gender;
  if (goal !== undefined) updates.goal = goal;
  if (art_frequency !== undefined) updates.art_frequency = art_frequency;
  if (source !== undefined) updates.source = source;

  await user.update(updates);

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    dob: user.dob,
    gender: user.gender,
    goal: user.goal,
    art_frequency: user.art_frequency,
    source: user.source,
  };
};

// =====================
// Export (FINAL FIX)
// =====================
module.exports = {
  register,
  verifyOTP,
  login,
  forgotPassword,
  resetPassword,
  refreshAuth,
  logout,
  updateProfile,
};
