const express = require("express");
const {
  getUserProfile,
  updateUserProfile,
  calculateUserCalories,
  getMealHistory,
  addMealToHistory,
  deleteUserAccount,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const {
  validateUserProfile,
  validateCalorieCalculation,
  validateId,
  validatePagination,
} = require("../middleware/validationMiddleware");
const { asyncHandler } = require("../middleware/errorMiddleware");

const router = express.Router();

// All routes are protected
router.use(protect);

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get("/profile", asyncHandler(getUserProfile));

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put("/profile", validateUserProfile, asyncHandler(updateUserProfile));

// @desc    Calculate user calories
// @route   POST /api/users/calculate-calories
// @access  Private
router.post(
  "/calculate-calories",
  validateCalorieCalculation,
  asyncHandler(calculateUserCalories)
);

// @desc    Get user meal history
// @route   GET /api/users/meal-history
// @access  Private
router.get("/meal-history", validatePagination, asyncHandler(getMealHistory));

// @desc    Add meal to history
// @route   POST /api/users/meal-history
// @access  Private
router.post("/meal-history", asyncHandler(addMealToHistory));

// @desc    Delete user account
// @route   DELETE /api/users/account
// @access  Private
router.delete("/account", asyncHandler(deleteUserAccount));

module.exports = router;
