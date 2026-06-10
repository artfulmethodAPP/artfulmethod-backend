const authService = require("../services/auth.service");
const asyncHandler = require("../utils/async-handler");
const { sendSuccess } = require("../utils/api-response");
const { timezoneFromRequest } = require("../utils/timezone");

//create user api business logic

const createUser = asyncHandler(async (req, res) => {
  const timezone = timezoneFromRequest(req.body, req.headers);
  const user = await authService.register({ ...req.body, timezone });
  return sendSuccess(res, {
    statusCode: 201,
    message: "User registered successfully, Please verify your email with the OTP.",
    data: { user },
  });
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const timezone = timezoneFromRequest(req.body, req.headers);
  const result = await authService.login({ email, password, timezone });
  return sendSuccess(res, {
    message: "Login successful",
    data: result,
  });
});

const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const result = await authService.refreshAuth(refreshToken);
  return sendSuccess(res, {
    message: "Token refreshed successfully",
    data: result,
  });
});

const logoutUser = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  await authService.logout(refreshToken);
  return sendSuccess(res, {
    message: "Logout successful",
  });
});

const verifyOtp = asyncHandler(async (req, res) => {
  const result = await authService.verifyOTP(req.body);
  return sendSuccess(res, {
    message: "Email verified successfully",
    data: result,
  });
});

const resendOtp = asyncHandler(async (req, res) => {
  const result = await authService.resendOTP(req.body);
  return sendSuccess(res, {
    message: result.message,
  });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const result = await authService.forgotPassword(email);
  return sendSuccess(res, {
    message: result.message,
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  const result = await authService.resetPassword(req.body);
  return sendSuccess(res, {
    message: result.message,
  });
});

const checkEmail = asyncHandler(async (req, res) => {
  const result = await authService.checkEmail(req.body.email);
  return sendSuccess(res, {
    message: "Email is available",
    data: result,
  });
});

const deleteAccount = asyncHandler(async (req, res) => {
  await authService.deleteAccount(req.user.id);
  return sendSuccess(res, {
    message: "Account deleted successfully",
  });
});

const updatePersonalInfo = asyncHandler(async (req, res) => {
  const user = await authService.updatePersonalInfo(req.user.id, req.body);
  return sendSuccess(res, {
    message: "Personal information updated successfully",
    data: { user },
  });
});

const updateEmailPreference = asyncHandler(async (req, res) => {
  const { email_reports_enabled } = req.body;
  const result = await authService.updateEmailPreference(req.user.id, email_reports_enabled);
  return sendSuccess(res, {
    message: "Email preference updated successfully",
    data: result,
  });
});

const hardDeleteAccount = asyncHandler(async (req, res) => {
  await authService.hardDeleteAccount(req.user.id);
  return sendSuccess(res, {
    message: "Account permanently deleted",
  });
});

module.exports = {
  createUser,
  loginUser,
  refreshToken,
  logoutUser,
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
  updatePersonalInfo,
  updateEmailPreference,
  checkEmail,
  deleteAccount,
  hardDeleteAccount,
};
