const express = require("express");
const {
  generateMealPlan,
  getUserMealPlans,
  getMealPlan,
  updateMealPlan,
  deleteMealPlan,
  getGroceryList,
} = require("../controllers/mealPlanController");
const { protect } = require("../middleware/authMiddleware");
const {
  validateMealPlan,
  validateId,
  validatePagination,
} = require("../middleware/validationMiddleware");
const { asyncHandler } = require("../middleware/errorMiddleware");

const router = express.Router();

// All routes are protected
router.use(protect);

// @desc    Generate meal plan
// @route   POST /api/mealplans/generate
// @access  Private
router.post("/generate", validateMealPlan, asyncHandler(generateMealPlan));

// @desc    Get user meal plans
// @route   GET /api/mealplans
// @access  Private
router.get("/", validatePagination, asyncHandler(getUserMealPlans));

// @desc    Get single meal plan
// @route   GET /api/mealplans/:id
// @access  Private
router.get("/:id", validateId, asyncHandler(getMealPlan));

// @desc    Update meal plan
// @route   PUT /api/mealplans/:id
// @access  Private
router.put("/:id", validateId, validateMealPlan, asyncHandler(updateMealPlan));

// @desc    Delete meal plan
// @route   DELETE /api/mealplans/:id
// @access  Private
router.delete("/:id", validateId, asyncHandler(deleteMealPlan));

// @desc    Get grocery list for meal plan
// @route   GET /api/mealplans/:id/grocery-list
// @access  Private
router.get("/:id/grocery-list", validateId, asyncHandler(getGroceryList));

module.exports = router;
