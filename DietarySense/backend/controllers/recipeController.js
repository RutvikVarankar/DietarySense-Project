const Recipe = require("../models/Recipe");
const { cloudinaryUtils } = require("../config/cloudinary");
const { validationResult } = require("express-validator");

// @desc    Get all recipes with filtering and pagination
// @route   GET /api/recipes
// @access  Public
exports.getRecipes = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      dietaryTags,
      maxPrepTime,
      maxCookTime,
      difficulty,
      maxCalories,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter object
    const filter = { isApproved: true };

    // Search in title and description
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Dietary tags filter
    if (dietaryTags) {
      const tags = Array.isArray(dietaryTags) ? dietaryTags : [dietaryTags];
      filter.dietaryTags = { $in: tags };
    }

    // Max prep time filter
    if (maxPrepTime) {
      filter.prepTime = { $lte: parseInt(maxPrepTime) };
    }

    // Max cook time filter
    if (maxCookTime) {
      filter.cookTime = { $lte: parseInt(maxCookTime) };
    }

    // Difficulty filter
    if (difficulty) {
      filter.difficulty = difficulty;
    }

    // Max calories filter
    if (maxCalories) {
      filter["nutrition.calories"] = { $lte: parseInt(maxCalories) };
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Execute query with pagination
    const recipes = await Recipe.find(filter)
      .populate("createdBy", "name email")
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get total count for pagination
    const total = await Recipe.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: recipes.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: recipes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single recipe
// @route   GET /api/recipes/:id
// @access  Public
exports.getRecipe = async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id).populate(
      "createdBy",
      "name email"
    );

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "Recipe not found",
      });
    }

    res.status(200).json({
      success: true,
      data: recipe,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new recipe
// @route   POST /api/recipes
// @access  Private
exports.createRecipe = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    // Add createdBy field
    req.body.createdBy = req.user.id;

    // Calculate nutrition if not provided
    if (req.body.ingredients && !req.body.nutrition) {
      const nutrition = calculateNutritionFromIngredients(req.body.ingredients);
      req.body.nutrition = nutrition;
    }

    const recipe = await Recipe.create(req.body);

    res.status(201).json({
      success: true,
      message: "Recipe created successfully",
      data: recipe,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update recipe
// @route   PUT /api/recipes/:id
// @access  Private
exports.updateRecipe = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    let recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "Recipe not found",
      });
    }

    // Check if user owns the recipe or is admin
    if (
      recipe.createdBy.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this recipe",
      });
    }

    // Recalculate nutrition if ingredients are updated
    if (req.body.ingredients) {
      const nutrition = calculateNutritionFromIngredients(req.body.ingredients);
      req.body.nutrition = nutrition;
    }

    recipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Recipe updated successfully",
      data: recipe,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete recipe
// @route   DELETE /api/recipes/:id
// @access  Private
exports.deleteRecipe = async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "Recipe not found",
      });
    }

    // Check if user owns the recipe or is admin
    if (
      recipe.createdBy.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this recipe",
      });
    }

    // Delete image from Cloudinary if exists
    if (recipe.image) {
      const publicId = cloudinaryUtils.getPublicIdFromUrl(recipe.image);
      if (publicId) {
        await cloudinaryUtils.deleteImage(publicId);
      }
    }

    await Recipe.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Recipe deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload recipe image
// @route   POST /api/recipes/:id/image
// @access  Private
exports.uploadRecipeImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an image file",
      });
    }

    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "Recipe not found",
      });
    }

    // Check if user owns the recipe or is admin
    if (
      recipe.createdBy.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this recipe",
      });
    }

    // Delete old image from Cloudinary if exists
    if (recipe.image) {
      const publicId = cloudinaryUtils.getPublicIdFromUrl(recipe.image);
      if (publicId) {
        await cloudinaryUtils.deleteImage(publicId);
      }
    }

    // Update recipe with new image URL
    recipe.image = req.file.path;
    await recipe.save();

    res.status(200).json({
      success: true,
      message: "Recipe image uploaded successfully",
      data: {
        image: recipe.image,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to calculate nutrition from ingredients
const calculateNutritionFromIngredients = (ingredients) => {
  const nutrition = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    fiber: 0,
  };

  ingredients.forEach((ingredient) => {
    nutrition.calories += ingredient.calories || 0;
    nutrition.protein += ingredient.protein || 0;
    nutrition.carbs += ingredient.carbs || 0;
    nutrition.fats += ingredient.fats || 0;
    nutrition.fiber += ingredient.fiber || 0;
  });

  return nutrition;
};
