const express = require("express");
const {
  getSpoonacularRecipes,
  getSpoonacularRecipe,
  getRecipesByIngredients,
  getSimilarRecipes,
} = require("../controllers/spoonacularController");
const { asyncHandler } = require("../middleware/errorMiddleware");

const router = express.Router();

// @desc    Get Spoonacular recipes (search or random)
// @route   GET /api/spoonacular/recipes
// @access  Public
router.get("/recipes", asyncHandler(getSpoonacularRecipes));

// @desc    Get Spoonacular recipe details
// @route   GET /api/spoonacular/recipes/:id
// @access  Public
router.get("/recipes/:id", asyncHandler(getSpoonacularRecipe));

// @desc    Get recipes by ingredients
// @route   GET /api/spoonacular/recipes/by-ingredients
// @access  Public
router.get("/recipes/by-ingredients", asyncHandler(getRecipesByIngredients));

// @desc    Get similar recipes
// @route   GET /api/spoonacular/recipes/:id/similar
// @access  Public
router.get("/recipes/:id/similar", asyncHandler(getSimilarRecipes));

module.exports = router;