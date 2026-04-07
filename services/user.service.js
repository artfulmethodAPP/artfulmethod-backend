const { User, RefreshToken } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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
const register = async ({ name, email, password, gender }) => {
  const existingUser = await User.findOne({ where: { email } });

  if (existingUser) {
    if (existingUser.is_verified) {
      throw new Error("User already exists");
    }
    // await existingUser.destroy({ force: true });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const otp_code = generateOTP();
  const otp_expires_at = new Date(Date.now() + 5 * 60 * 1000);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    gender,
    otp_code,
    otp_expires_at,
  });

  await sendOTPEmail(email, otp_code, user.id);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    gender: user.gender,
    createdAt: user.createdAt,
  };
};

const verifyOTP = async ({ email, otp_code }) => {
  const user = await User.findOne({ where: { email } });

  if (!user) throw new Error("User not found");

  if (user.is_verified) {
    throw new Error("User already verified");
  }

  if (user.otp_code !== otp_code) {
    throw new Error("Invalid OTP");
  }

  if (new Date() > new Date(user.otp_expires_at)) {
    throw new Error("OTP expired");
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
    throw new Error("Invalid email or password");
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password);

  if (!isPasswordMatch) {
    throw new Error("Invalid email or password");
  }

  if (!user.is_verified) {
    const otp_code = generateOTP();
    const otp_expires_at = new Date(Date.now() + 5 * 60 * 1000);

    await user.update({
      otp_code,
      otp_expires_at,
    });

    await sendOTPEmail(email, otp_code,user.id);
    throw new Error("Please verify your email first. A new OTP has been sent to your email.");
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
    throw new Error("User not found");
  }

  if (!user.is_verified) {
    throw new Error("Please verify your email first");
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
    throw new Error("User not found");
  }

  if (user.otp_code !== otp_code) {
    throw new Error("Invalid OTP");
  }

  if (new Date() > new Date(user.otp_expires_at)) {
    throw new Error("OTP expired");
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
      throw new Error("Invalid or revoked refresh token");
    }

    const user = await User.findByPk(payload.id);

    if (!user) {
      throw new Error("User not found");
    }

    // revoke old token
    refreshTokenDoc.is_revoked = true;
    await refreshTokenDoc.save();

    return generateAuthTokens(user);
  } catch (error) {
    throw new Error("Invalid or revoked refresh token");
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
    throw new Error("Refresh token not found or already revoked");
  }

  refreshTokenDoc.is_revoked = true;
  await refreshTokenDoc.save();
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
};
