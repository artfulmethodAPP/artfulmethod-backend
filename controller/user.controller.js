const UserService = require("../services/user.service");

const createUser = async (req, res) => {
  try {
    const user = await UserService.register(req.body);
    res.status(201).json({
      message:
        "User registered successfully, Please verify your email with the OTP.",
      data: user,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await UserService.login({ email, password });
    res.status(200).json({
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const result = await UserService.refreshAuth(refreshToken);
    res.status(200).json({
      message: "Token refreshed successfully",
      data: result,
    });
  } catch (error) {
    res.status(401).json({
      message: error.message,
    });
  }
};

const logoutUser = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    await UserService.logout(refreshToken);
    res.status(200).json({
      message: "Logout successful",
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const user = await UserService.verifyOTP(req.body);
    res.status(200).json({
      message: "Email verified successfully",
      data: user,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await UserService.forgotPassword(email);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const result = await UserService.resetPassword(req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createUser,
  loginUser,
  refreshToken,
  logoutUser,
  verifyOtp,
  forgotPassword,
  resetPassword,
};
