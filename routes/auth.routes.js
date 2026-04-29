const express = require("express");
const router = express.Router();

const {
  createUser,
  loginUser,
  refreshToken,
  logoutUser,
  verifyOtp,
  forgotPassword,
  resetPassword,
  updatePersonalInfo,
  checkEmail,
  deleteAccount,
} = require("../controller/auth.controller");

const validate = require("../middlewares/validate");
const authenticate = require("../middlewares/authenticate.middleware");

const {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  logoutSchema,
  verifyOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updatePersonalInfoSchema,
  checkEmailSchema,
} = require("../validations/auth.validation");

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User registration and login
 */

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: mypassword123
 *               name:
 *                 type: string
 *                 example: John Doe
 *               dob:
 *                 type: string
 *                 format: date
 *                 example: "1995-06-15"
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *                 example: male
 *               goal:
 *                 type: string
 *                 example: "Improve mental wellness"
 *               art_frequency:
 *                 type: string
 *                 example: "1-2 times a week"
 *               source:
 *                 type: string
 *                 example: "Instagram"
 
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Bad request
 */
/**
 * @swagger
 * /api/v1/auth/check-email:
 *   post:
 *     summary: Check if an email is already registered
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: john@example.com
 *     responses:
 *       200:
 *         description: Email is available
 *       409:
 *         description: This email is already in use
 */
router.post("/check-email", validate(checkEmailSchema), checkEmail);

router.post("/register", validate(registerSchema), createUser);

/**
 * @swagger
 * /api/v1/auth/verify-otp:
 *   post:
 *     summary: Verify OTP to activate account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp_code
 *             properties:
 *               email:
 *                 type: string
 *                 example: john@gmail.com
 *               otp_code:
 *                 type: string
 *                 example: "847291"
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid OTP / OTP expired / Already verified
 */
router.post("/verify-otp", validate(verifyOtpSchema), verifyOtp);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: mypassword123
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Bad request
 */
router.post("/login", validate(loginSchema), loginUser);

/**
 * @swagger
 * /api/v1/auth/refresh-tokens:
 *   post:
 *     summary: Refresh auth tokens
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: OK
 *       401:
 *         description: Unauthorized
 */
router.post("/refresh-tokens", validate(refreshTokenSchema), refreshToken);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logout successful
 *       400:
 *         description: Bad request
 */
router.post("/logout", validate(logoutSchema), logoutUser);

/**
 * @swagger
 * /api/v1/auth/forgot-password:
 *   post:
 *     summary: Request password reset OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: john@example.com
 *     responses:
 *       200:
 *         description: OTP sent to your email
 *       400:
 *         description: User not found or not verified
 */
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);

/**
 * @swagger
 * /api/v1/auth/reset-password:
 *   post:
 *     summary: Reset password using token from email link
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *                 description: Reset token received via email link query param
 *               newPassword:
 *                 type: string
 *                 example: newpassword123
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid or expired reset link
 */
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);

/**
 * @swagger
 * /api/v1/auth/personal-info:
 *   patch:
 *     summary: Update personal information
 *     description: Update name and date of birth from the Personal Information screen. Email and password are not changed here.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Luna
 *               dob:
 *                 type: string
 *                 format: date
 *                 example: "1984-04-11"
 *     responses:
 *       200:
 *         description: Personal information updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Personal information updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                         dob:
 *                           type: string
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.patch("/personal-info", authenticate, validate(updatePersonalInfoSchema), updatePersonalInfo);

/**
 * @swagger
 * /api/v1/auth/me:
 *   delete:
 *     summary: Delete account (soft delete)
 *     description: |
 *       Soft-deletes the authenticated user's account by setting deleted_at.
 *       All active sessions are revoked immediately.
 *       The same email can be used to register a new account after deletion.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *       401:
 *         description: Unauthorized
 */
router.delete("/me", authenticate, deleteAccount);

module.exports = router;
