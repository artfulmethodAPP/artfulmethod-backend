const UserService = require("../services/user.service");
const asyncHandler = require("../utils/async-handler");
const { sendSuccess } = require("../utils/api-response");

const createUser = asyncHandler(async (req, res) => {
  const user = await UserService.register(req.body);
  return sendSuccess(res, {
    statusCode: 201,
    message: "User registered successfully, Please verify your email with the OTP.",
    data: { user },
  });
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await UserService.login({ email, password });
  return sendSuccess(res, {
    message: "Login successful",
    data: result,
  });
});

const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const result = await UserService.refreshAuth(refreshToken);
  return sendSuccess(res, {
    message: "Token refreshed successfully",
    data: result,
  });
});

const logoutUser = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  await UserService.logout(refreshToken);
  return sendSuccess(res, {
    message: "Logout successful",
  });
});

const verifyOtp = asyncHandler(async (req, res) => {
  const user = await UserService.verifyOTP(req.body);
  return sendSuccess(res, {
    message: "Email verified successfully",
    data: { user },
  });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const result = await UserService.forgotPassword(email);
  return sendSuccess(res, {
    message: result.message,
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  const result = await UserService.resetPassword(req.body);
  return sendSuccess(res, {
    message: result.message,
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await UserService.updateProfile(req.user.id, req.body);
  return sendSuccess(res, {
    message: "Profile updated successfully",
    data: { user },
  });
});

module.exports = {
  createUser,
  loginUser,
  refreshToken,
  logoutUser,
  verifyOtp,
  forgotPassword,
  resetPassword,
  updateProfile,
};
