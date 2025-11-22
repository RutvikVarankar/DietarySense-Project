const express = require("express");
const {
  register,
  login,
  logout,
  getMe,
  completeOnboarding,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const {
  validateRegister,
  validateLogin,
} = require("../middleware/validationMiddleware");
const { asyncHandler } = require("../middleware/errorMiddleware");

const router = express.Router();

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post("/register", validateRegister, asyncHandler(register));

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post("/login", validateLogin, asyncHandler(login));

// @desc    Logout user
// @route   GET /api/auth/logout
// @access  Private
router.get("/logout", protect, asyncHandler(logout));

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get("/me", protect, asyncHandler(getMe));

// @desc    Complete user onboarding
// @route   POST /api/auth/onboarding
// @access  Private
router.post("/onboarding", protect, asyncHandler(completeOnboarding));

module.exports = router;
