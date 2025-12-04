const express = require("express");
const {
  getTodaysNutrition,
  logMeal,
  getNutritionByDates,
  getWeeklyProgress,
  updateWaterIntake,
} = require("../controllers/nutritionController");
const { protect } = require("../middleware/authMiddleware");
const { body } = require("express-validator");

const router = express.Router();

// All routes require authentication
router.use(protect);

// @route   GET /api/nutrition/today
router.get("/today", getTodaysNutrition);

// @route   POST /api/nutrition/log-meal
router.post(
  "/log-meal",
  [
    body("mealType")
      .isIn(["breakfast", "lunch", "dinner", "snack"])
      .withMessage("Meal type must be breakfast, lunch, dinner, or snack"),
    body("recipeId")
      .optional()
      .isMongoId()
      .withMessage("Invalid recipe ID"),
    body("customMeal")
      .optional()
      .isObject()
      .withMessage("Custom meal must be an object"),
    body("customMeal.name")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Custom meal name is required"),
    body("customMeal.ingredients")
      .optional()
      .isArray()
      .withMessage("Ingredients must be an array"),
    body("notes")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Notes cannot exceed 500 characters"),
  ],
  logMeal
);

// @route   GET /api/nutrition/weekly-progress
router.get("/weekly-progress", getWeeklyProgress);

// @route   PUT /api/nutrition/water-intake
router.put(
  "/water-intake",
  [
    body("amount")
      .isNumeric()
      .withMessage("Amount must be a number")
      .isFloat({ min: 0 })
      .withMessage("Amount cannot be negative"),
  ],
  updateWaterIntake
);

module.exports = router;
