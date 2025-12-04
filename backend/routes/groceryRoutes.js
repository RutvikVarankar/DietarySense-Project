const express = require("express");
const {
  getGroceryList,
  addGroceryItem,
  updateGroceryItem,
  deleteGroceryItem,
  togglePurchased,
  clearGroceryList,
  getGroceryItemsByCategory,
  addRecipeIngredientsToGrocery,
} = require("../controllers/groceryController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Validation middleware
const { body } = require("express-validator");

// All routes require authentication
router.use(protect);

// @route   GET /api/grocery
// @desc    Get user's grocery list
// @access  Private
router.get("/", getGroceryList);

// @route   POST /api/grocery
// @desc    Add grocery item
// @access  Private
router.post(
  "/",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("quantity").isNumeric().withMessage("Quantity must be a number"),
    body("unit").notEmpty().withMessage("Unit is required"),
    body("category").notEmpty().withMessage("Category is required"),
  ],
  addGroceryItem
);

// @route   PUT /api/grocery/:id
// @desc    Update grocery item
// @access  Private
router.put(
  "/:id",
  [
    body("name").optional().notEmpty().withMessage("Name cannot be empty"),
    body("quantity")
      .optional()
      .isNumeric()
      .withMessage("Quantity must be a number"),
    body("unit").optional().notEmpty().withMessage("Unit cannot be empty"),
    body("category")
      .optional()
      .notEmpty()
      .withMessage("Category cannot be empty"),
  ],
  updateGroceryItem
);

// @route   DELETE /api/grocery/:id
// @desc    Delete grocery item
// @access  Private
router.delete("/:id", deleteGroceryItem);

// @route   PATCH /api/grocery/:id/toggle
// @desc    Toggle purchased status
// @access  Private
router.patch("/:id/toggle", togglePurchased);

// @route   DELETE /api/grocery
// @desc    Clear all grocery items
// @access  Private
router.delete("/", clearGroceryList);

// @route   GET /api/grocery/category/:category
// @desc    Get grocery items by category
// @access  Private
router.get("/category/:category", getGroceryItemsByCategory);

// @route   POST /api/grocery/add-recipe-ingredients
// @desc    Add recipe ingredients to grocery list
// @access  Private
router.post("/add-recipe-ingredients", addRecipeIngredientsToGrocery);

module.exports = router;
