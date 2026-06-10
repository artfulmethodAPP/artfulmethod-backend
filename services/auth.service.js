const { User, UserToken } = require("../models");
const { Op } = require("sequelize");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/app-error");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_RESET_SECRET = process.env.JWT_RESET_SECRET || JWT_SECRET;
const { sendOTPEmail, sendResetPasswordLinkEmail } = require("./email.service");
const { localDateString } = require("../utils/timezone");
const e = require("cors");

// =====================
// Helper Functions
// =====================
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// =====================
// Streak Helper
// =====================
const computeStreak = async (user) => {
  // "Today" and "yesterday" are computed in the user's own timezone so streak
  // day boundaries match their local calendar day, not the server's UTC day.
  // Timestamps themselves stay UTC; only the day label is localized. Falls back to UTC.
  const today = localDateString(new Date(), user.timezone);
  const last = user.last_activity_date; // DATEONLY string or null

  let newStreak;

  if (!last) {
    // First ever activity
    newStreak = 1;
  } else if (last === today) {
    // Already counted today — no change
    return {
      streakCount: user.streak_count,
      longestStreak: user.longest_streak,
      lastActivityDate: last,
    };
  } else {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = localDateString(yesterday, user.timezone);

    if (last === yesterdayStr) {
      // Consecutive day
      newStreak = user.streak_count + 1;
    } else {
      // Gap — reset
      newStreak = 1;
    }
  }

  const newLongest = Math.max(newStreak, user.longest_streak || 0);
  await user.update({
    streak_count: newStreak,
    longest_streak: newLongest,
    last_activity_date: today,
  });
  return {
    streakCount: newStreak,
    longestStreak: newLongest,
    lastActivityDate: today,
  };
};

// =====================
// Auth Functions
// =====================
const register = async ({
  email,
  password,
  name,
  dob,
  gender,
  goal,
  art_frequency,
  source,
  timezone,
}) => {
  // Age validation — must be at least 16 years old
  if (dob) {
    const birthDate = new Date(dob);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const hasHadBirthdayThisYear =
      today.getMonth() > birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() &&
        today.getDate() >= birthDate.getDate());
    const exactAge = hasHadBirthdayThisYear ? age : age - 1;

    if (exactAge < 16) {
      throw new AppError(
        "You must be at least 16 years old to create an account.",
        422,
        "UNDERAGE",
      );
    }
  }

  // Check for any existing record with this email (including soft-deleted ones)
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    if (!existingUser.deleted_at) {
      // Active account — block re-registration
      throw new AppError("User already exists", 409, "CONFLICT");
    }
    // Soft-deleted account — revive the same row instead of creating a duplicate.
    // Reset all fields, clear deleted_at, and issue a fresh OTP.
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp_code = generateOTP();
    const otp_expires_at = new Date(Date.now() + 5 * 60 * 1000);

    await UserToken.destroy({ where: { user_id: existingUser.id } });

    await existingUser.update({
      password: hashedPassword,
      name: name || null,
      dob: dob || null,
      gender: gender || null,
      goal: goal || null,
      art_frequency: art_frequency || null,
      source: source || null,
      ...(timezone ? { timezone } : {}),
      otp_code,
      otp_expires_at,
      is_verified: false,
      streak_count: 0,
      last_activity_date: null,
      deleted_at: null,
    });

    // Fire-and-forget: don't block the response on SMTP. The .catch() is
    // required — without it a failed send becomes an unhandled rejection that
    // can crash the process. The failure is already recorded in EmailLog.
    sendOTPEmail(email, otp_code, existingUser.id).catch((err) =>
      console.error("[register] background OTP email failed:", err.message),
    );

    return {
      id: existingUser.id,
      email: existingUser.email,
      name: existingUser.name,
      dob: existingUser.dob,
      created_at: existingUser.created_at,
      email_reports_enabled: existingUser.email_reports_enabled,
    };
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
    ...(timezone ? { timezone } : {}),
    otp_code: otp_code,
    otp_expires_at,
  });

  // Fire-and-forget (see revive path above) — response returns as soon as the
  // user row is created; email delivery happens in the background.
  sendOTPEmail(email, otp_code, user.id).catch((err) =>
    console.error("[register] background OTP email failed:", err.message),
  );

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    dob: user.dob,
    created_at: user.created_at,
    email_reports_enabled: user.email_reports_enabled,
  };
};

const resendOTP = async ({ email }) => {
  const user = await User.findOne({ where: { email, deleted_at: null } });

  // Generic response for unknown emails — don't leak which emails are registered.
  if (!user) {
    return {
      message: "If an account exists for this email, a new OTP has been sent.",
    };
  }

  // Already verified — nothing to resend.
  if (user.is_verified) {
    throw new AppError("This account is already verified.", 409, "CONFLICT");
  }

  const otp_code = generateOTP();
  const otp_expires_at = new Date(Date.now() + 5 * 60 * 1000);

  await user.update({ otp_code, otp_expires_at });

  // Fire-and-forget (see register) — response returns immediately; the .catch()
  // prevents a failed send from becoming an unhandled rejection.
  sendOTPEmail(email, otp_code, user.id).catch((err) =>
    console.error("[resendOTP] background OTP email failed:", err.message),
  );

  return {
    message: "A new OTP has been sent to your email.",
  };
};

const verifyOTP = async ({ email, otp_code }) => {
  const user = await User.findOne({ where: { email, deleted_at: null } });

  if (!user) throw new AppError("User not found", 404, "NOT_FOUND");

  if (user.is_verified) {
    throw new AppError("User already verified", 409, "CONFLICT");
  }

  if (user.otp_code !== otp_code) {
    throw new AppError("Invalid OTP", 422, "INVALID_OTP");
  }

  if (new Date() > new Date(user.otp_expires_at)) {
    throw new AppError("OTP expired", 422, "OTP_EXPIRED");
  }

  await user.update({
    is_verified: true,
    otp_code: null,
    otp_expires_at: null,
  });

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

const login = async ({ email, password = "", timezone }) => {
  const user = await User.findOne({ where: { email } });
  if (!user || user.deleted_at) {
    throw new AppError(
      "We couldn’t find an account with this email",
      401,
      "UNAUTHORIZED",
    );
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password);

  if (!isPasswordMatch) {
    throw new AppError("Incorrect password", 401, "UNAUTHORIZED");
  }

  // Keep the user's timezone current so UTC->local conversions stay correct
  // if they sign in from a new location/device.
  if (timezone && timezone !== user.timezone) {
    await user.update({ timezone });
  }

  if (!user.is_verified) {
    const otp_code = generateOTP();
    const otp_expires_at = new Date(Date.now() + 5 * 60 * 1000);

    await user.update({
      otp_code,
      otp_expires_at,
    });

    await sendOTPEmail(email, otp_code, user.id);
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
      dob: user.dob,
      email_reports_enabled: user.email_reports_enabled,
    },
    tokens,
  };
};

const forgotPassword = async (email) => {
  const user = await User.findOne({ where: { email, deleted_at: null } });

  // Email not registered — return generic response to avoid leaking info
  if (!user) {
    return {
      message:
        "If an account exists for this email, a password reset link has been sent.",
    };
  }

  // Account exists but not verified — resend OTP so they can complete verification
  if (!user.is_verified) {
    const otp_code = generateOTP();
    const otp_expires_at = new Date(Date.now() + 5 * 60 * 1000);
    await user.update({ otp_code, otp_expires_at });
    await sendOTPEmail(email, otp_code, user.id);
    throw new AppError(
      "Your account is not verified yet. A new OTP has been sent to your email.",
      403,
      "FORBIDDEN",
    );
  }

  // Delete any existing reset tokens for this user
  await UserToken.destroy({
    where: {
      user_id: user.id,
      token_type: "reset_password",
    },
  });

  const resetToken = jwt.sign({ id: user.id }, JWT_RESET_SECRET, {
    expiresIn: "1h",
  });

  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await UserToken.create({
    user_id: user.id,
    token: resetToken,
    token_type: "reset_password",
    expires_at: expiresAt,
  });

  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  await sendResetPasswordLinkEmail(email, resetLink, user.id);

  return {
    message:
      "If an account exists for this email, a password reset link has been sent.",
  };
};

const resetPassword = async ({ token, newPassword }) => {
  let payload;
  try {
    payload = jwt.verify(token, JWT_RESET_SECRET);
  } catch {
    throw new AppError("Invalid or expired reset link", 401, "UNAUTHORIZED");
  }

  const tokenDoc = await UserToken.findOne({
    where: {
      token,
      user_id: payload.id,
      token_type: "reset_password",
    },
  });

  if (!tokenDoc) {
    throw new AppError("Invalid or expired reset link", 401, "UNAUTHORIZED");
  }

  if (new Date() > new Date(tokenDoc.expires_at)) {
    throw new AppError("Reset link has expired", 401, "UNAUTHORIZED");
  }

  const user = await User.findByPk(payload.id);

  if (!user) {
    throw new AppError("User not found", 404, "NOT_FOUND");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await user.update({ password: hashedPassword });

  // Delete the used token
  await tokenDoc.destroy();

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

  // Delete all existing refresh tokens for this user before creating a new one
  await UserToken.destroy({
    where: {
      user_id: user.id,
      token_type: "refresh",
    },
  });

  await UserToken.create({
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

    const refreshTokenDoc = await UserToken.findOne({
      where: {
        token: refreshToken,
        user_id: payload.id,
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

    // Delete old token
    await refreshTokenDoc.destroy();

    return generateAuthTokens(user);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Invalid or revoked refresh token", 401, "UNAUTHORIZED");
  }
};

const logout = async (refreshToken) => {
  const refreshTokenDoc = await UserToken.findOne({
    where: {
      token: refreshToken,
      token_type: "refresh",
    },
  });

  if (!refreshTokenDoc) {
    throw new AppError(
      "Refresh token not found or already logged out",
      400,
      "BAD_REQUEST",
    );
  }

  await refreshTokenDoc.destroy();
};

const updatePersonalInfo = async (userId, { name, dob }) => {
  const user = await User.findOne({ where: { id: userId, deleted_at: null } });

  if (!user) {
    throw new AppError("User not found", 404, "NOT_FOUND");
  }

  const updates = {};
  if (name !== undefined) updates.name = name;
  if (dob !== undefined) updates.dob = dob;

  await user.update(updates);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    dob: user.dob,
  };
};

const updateEmailPreference = async (userId, email_reports_enabled) => {
  const user = await User.findOne({ where: { id: userId, deleted_at: null } });

  if (!user) throw new AppError("User not found", 404, "NOT_FOUND");

  await user.update({ email_reports_enabled });

  return { email_reports_enabled: user.email_reports_enabled };
};

const deleteAccount = async (userId) => {
  const user = await User.findOne({ where: { id: userId, deleted_at: null } });

  if (!user) {
    throw new AppError("User not found", 404, "NOT_FOUND");
  }

  // Revoke all tokens so existing sessions stop working immediately
  await UserToken.destroy({ where: { user_id: userId } });

  // Soft delete — set deleted_at to now
  await user.update({ deleted_at: new Date() });
};

const hardDeleteAccount = async (userId) => {
  const user = await User.findByPk(userId);

  if (!user) {
    throw new AppError("User not found", 404, "NOT_FOUND");
  }

  // Revoke all tokens first so existing sessions stop working immediately
  await UserToken.destroy({ where: { user_id: userId } });

  // Permanently destroy the user row — cascades handle related records via FK ON DELETE CASCADE
  await user.destroy({ force: true });
};

const checkEmail = async (email) => {
  const user = await User.findOne({ where: { email, deleted_at: null } });
  if (user) {
    throw new AppError("This email is already in use", 409, "CONFLICT");
  }
  return { available: true };
};

// =====================
// Export (FINAL FIX)
// =====================
module.exports = {
  register,
  verifyOTP,
  resendOTP,
  login,
  forgotPassword,
  resetPassword,
  refreshAuth,
  logout,
  updatePersonalInfo,
  updateEmailPreference,
  checkEmail,
  deleteAccount,
  hardDeleteAccount,
  computeStreak,
};
