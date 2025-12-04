const Grocery = require("../models/Grocery");
const { validationResult } = require("express-validator");

// @desc    Get user's grocery list
// @route   GET /api/grocery
// @access  Private
exports.getGroceryList = async (req, res, next) => {
  try {
    const groceryItems = await Grocery.find({ user: req.user.id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: groceryItems.length,
      data: groceryItems,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add grocery item
// @route   POST /api/grocery
// @access  Private
exports.addGroceryItem = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const groceryItem = await Grocery.create({
      ...req.body,
      user: req.user.id,
    });

    res.status(201).json({
      success: true,
      data: groceryItem,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update grocery item
// @route   PUT /api/grocery/:id
// @access  Private
exports.updateGroceryItem = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    let groceryItem = await Grocery.findById(req.params.id);

    if (!groceryItem) {
      return res.status(404).json({
        success: false,
        message: "Grocery item not found",
      });
    }

    // Make sure user owns the grocery item
    if (groceryItem.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to update this grocery item",
      });
    }

    groceryItem = await Grocery.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: groceryItem,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete grocery item
// @route   DELETE /api/grocery/:id
// @access  Private
exports.deleteGroceryItem = async (req, res, next) => {
  try {
    const groceryItem = await Grocery.findById(req.params.id);

    if (!groceryItem) {
      return res.status(404).json({
        success: false,
        message: "Grocery item not found",
      });
    }

    // Make sure user owns the grocery item
    if (groceryItem.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to delete this grocery item",
      });
    }

    await groceryItem.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle purchased status
// @route   PATCH /api/grocery/:id/toggle
// @access  Private
exports.togglePurchased = async (req, res, next) => {
  try {
    let groceryItem = await Grocery.findById(req.params.id);

    if (!groceryItem) {
      return res.status(404).json({
        success: false,
        message: "Grocery item not found",
      });
    }

    // Make sure user owns the grocery item
    if (groceryItem.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to update this grocery item",
      });
    }

    groceryItem.purchased = !groceryItem.purchased;
    await groceryItem.save();

    res.status(200).json({
      success: true,
      data: groceryItem,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear all grocery items
// @route   DELETE /api/grocery
// @access  Private
exports.clearGroceryList = async (req, res, next) => {
  try {
    await Grocery.deleteMany({ user: req.user.id });

    res.status(200).json({
      success: true,
      message: "All grocery items cleared",
      data: [],
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get grocery items by category
// @route   GET /api/grocery/category/:category
// @access  Private
exports.getGroceryItemsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;

    const groceryItems = await Grocery.find({
      user: req.user.id,
      category,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: groceryItems.length,
      data: groceryItems,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add recipe ingredients to grocery list
// @route   POST /api/grocery/add-recipe-ingredients
// @access  Private
exports.addRecipeIngredientsToGrocery = async (req, res, next) => {
  try {
    const { ingredients } = req.body;

    if (!ingredients || !Array.isArray(ingredients)) {
      return res.status(400).json({
        success: false,
        message: "Ingredients array is required",
      });
    }

    // Map ingredients to grocery items
    const groceryItems = ingredients.map((ingredient) => ({
      name: ingredient.name,
      quantity: ingredient.quantity,
      unit: ingredient.unit,
      category: ingredient.category || "other",
      user: req.user.id,
    }));

    const addedItems = await Grocery.insertMany(groceryItems);

    res.status(201).json({
      success: true,
      count: addedItems.length,
      data: addedItems,
    });
  } catch (error) {
    next(error);
  }
};
