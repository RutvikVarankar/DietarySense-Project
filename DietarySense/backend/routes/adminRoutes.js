const express = require("express");
const {
  getDashboardStats,
  getUsers,
  getRecipes,
  approveRecipe,
  rejectRecipe,
  deleteUser,
  getMealPlans,
} = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  validateId,
  validatePagination,
  validateAdminActions,
} = require("../middleware/validationMiddleware");
const { asyncHandler } = require("../middleware/errorMiddleware");

const router = express.Router();

// All routes are protected and require admin role
router.use(protect);
router.use(authorize("admin"));

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
router.get("/dashboard", asyncHandler(getDashboardStats));

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
router.get("/users", validatePagination, asyncHandler(getUsers));

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
router.delete("/users/:id", validateId, asyncHandler(deleteUser));

// @desc    Get all recipes for admin
// @route   GET /api/admin/recipes
// @access  Private/Admin
router.get("/recipes", validatePagination, asyncHandler(getRecipes));

// @desc    Approve recipe
// @route   PUT /api/admin/recipes/:id/approve
// @access  Private/Admin
router.put("/recipes/:id/approve", validateId, asyncHandler(approveRecipe));

// @desc    Reject recipe
// @route   PUT /api/admin/recipes/:id/reject
// @access  Private/Admin
router.put(
  "/recipes/:id/reject",
  validateId,
  validateAdminActions,
  asyncHandler(rejectRecipe)
);

// @desc    Get all meal plans
// @route   GET /api/admin/meal-plans
// @access  Private/Admin
router.get("/meal-plans", validatePagination, asyncHandler(getMealPlans));

module.exports = router;
