const express = require("express");
const {
  getRecipes,
  getRecipe,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  uploadRecipeImage,
  generateRecipePDF,
} = require("../controllers/recipeController");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  validateRecipe,
  validateId,
  validatePagination,
  validateRecipeQuery,
} = require("../middleware/validationMiddleware");
const { asyncHandler } = require("../middleware/errorMiddleware");
const { upload } = require("../config/cloudinary");

const router = express.Router();

// @desc    Get all recipes (public)
// @route   GET /api/recipes
// @access  Public
router.get(
  "/",
  validateRecipeQuery,
  validatePagination,
  asyncHandler(getRecipes)
);

// @desc    Get single recipe (public)
// @route   GET /api/recipes/:id
// @access  Public
router.get("/:id", validateId, asyncHandler(getRecipe));

// @desc    Generate PDF for recipe (public)
// @route   GET /api/recipes/:id/pdf
// @access  Public
router.get("/:id/pdf", validateId, asyncHandler(generateRecipePDF));

// All routes below are protected
router.use(protect);

// @desc    Create new recipe
// @route   POST /api/recipes
// @access  Private
router.post("/", validateRecipe, asyncHandler(createRecipe));

// @desc    Update recipe
// @route   PUT /api/recipes/:id
// @access  Private
router.put("/:id", validateId, validateRecipe, asyncHandler(updateRecipe));

// @desc    Delete recipe
// @route   DELETE /api/recipes/:id
// @access  Private
router.delete("/:id", validateId, asyncHandler(deleteRecipe));

// @desc    Upload recipe image
// @route   POST /api/recipes/:id/image
// @access  Private
router.post(
  "/:id/image",
  validateId,
  upload.single("image"),
  asyncHandler(uploadRecipeImage)
);

module.exports = router;
