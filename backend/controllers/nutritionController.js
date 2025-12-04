const Nutrition = require("../models/Nutrition");
const Recipe = require("../models/Recipe");
const User = require("../models/User");
const { validationResult } = require("express-validator");

// @desc    Get today's nutrition data
// @route   GET /api/nutrition/today
// @access  Private
exports.getTodaysNutrition = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let nutrition = await Nutrition.findOne({
      user: req.user.id,
      date: {
        $gte: today,
        $lt: tomorrow,
      },
    }).populate("meals.recipe");

    if (!nutrition) {
      // Create new nutrition entry for today
      const user = await User.findById(req.user.id);
      nutrition = await Nutrition.create({
        user: req.user.id,
        date: today,
        targets: {
          calories: user.profile?.dailyCalories || 2000,
          protein: user.profile?.protein || 150,
          carbs: user.profile?.carbs || 250,
          fats: user.profile?.fats || 67,
        },
      });
    }

    res.status(200).json({
      success: true,
      data: nutrition,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Log a meal
// @route   POST /api/nutrition/log-meal
// @access  Private
exports.logMeal = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { mealType, recipeId, customMeal, notes } = req.body;

    // Get today's nutrition entry
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let nutrition = await Nutrition.findOne({
      user: req.user.id,
      date: {
        $gte: today,
        $lt: tomorrow,
      },
    });

    if (!nutrition) {
      // Create new nutrition entry for today
      const user = await User.findById(req.user.id);
      nutrition = await Nutrition.create({
        user: req.user.id,
        date: today,
        targets: {
          calories: user.profile?.dailyCalories || 2000,
          protein: user.profile?.protein || 150,
          carbs: user.profile?.carbs || 250,
          fats: user.profile?.fats || 67,
        },
      });
    }

    let mealData = {
      mealType,
      consumedAt: new Date(),
      notes,
    };

    if (recipeId) {
      // Log meal from recipe
      const recipe = await Recipe.findById(recipeId);
      if (!recipe) {
        return res.status(404).json({
          success: false,
          message: "Recipe not found",
        });
      }

      mealData.recipe = recipeId;
      mealData.nutrition = {
        calories: recipe.nutrition.calories,
        protein: recipe.nutrition.protein,
        carbs: recipe.nutrition.carbs,
        fats: recipe.nutrition.fats,
        fiber: recipe.nutrition.fiber || 0,
        sugar: recipe.nutrition.sugar || 0,
      };
    } else if (customMeal) {
      // Log custom meal
      mealData.customMeal = customMeal;
      // Calculate nutrition from custom meal ingredients
      const nutrition = calculateNutritionFromIngredients(customMeal.ingredients);
      mealData.nutrition = nutrition;
    } else {
      return res.status(400).json({
        success: false,
        message: "Either recipeId or customMeal must be provided",
      });
    }

    nutrition.meals.push(mealData);
    await nutrition.save();

    res.status(201).json({
      success: true,
      message: "Meal logged successfully",
      data: nutrition,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get nutrition data for specific dates
// @route   GET /api/nutrition/by-dates
// @access  Private
exports.getNutritionByDates = async (req, res, next) => {
  try {
    const { dates } = req.query; // dates should be comma-separated ISO date strings

    if (!dates) {
      return res.status(400).json({
        success: false,
        message: "Dates parameter is required",
      });
    }

    const dateArray = dates.split(',').map(date => new Date(date.trim()));

    const nutritionData = await Nutrition.find({
      user: req.user.id,
      date: { $in: dateArray }
    }).populate("meals.recipe").sort({ date: 1 });

    res.status(200).json({
      success: true,
      data: nutritionData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get weekly progress
// @route   GET /api/nutrition/weekly-progress
// @access  Private
exports.getWeeklyProgress = async (req, res, next) => {
  try {
    const { startDate } = req.query;
    let start = startDate ? new Date(startDate) : new Date();

    // Set to start of week (Monday)
    const dayOfWeek = start.getDay();
    const diff = start.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);

    const endDate = new Date(start);
    endDate.setDate(endDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);

    const nutritionData = await Nutrition.find({
      user: req.user.id,
      date: {
        $gte: start,
        $lte: endDate,
      },
    }).sort({ date: 1 });

    // Generate labels for the week
    const labels = [];
    const calories = [];
    const protein = [];
    const carbs = [];
    const fats = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));

      const dayData = nutritionData.find(d => {
        const dataDate = new Date(d.date);
        return dataDate.toDateString() === date.toDateString();
      });

      calories.push(dayData ? dayData.dailySummary.totalCalories : 0);
      protein.push(dayData ? dayData.dailySummary.totalProtein : 0);
      carbs.push(dayData ? dayData.dailySummary.totalCarbs : 0);
      fats.push(dayData ? dayData.dailySummary.totalFats : 0);
    }

    const user = await User.findById(req.user.id);
    const targets = {
      calories: user.profile?.dailyCalories || 2000,
      protein: user.profile?.protein || 150,
      carbs: user.profile?.carbs || 250,
      fats: user.profile?.fats || 67,
    };

    res.status(200).json({
      success: true,
      data: {
        labels,
        calories,
        protein,
        carbs,
        fats,
        targets,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update water intake
// @route   PUT /api/nutrition/water-intake
// @access  Private
exports.updateWaterIntake = async (req, res, next) => {
  try {
    const { amount } = req.body;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let nutrition = await Nutrition.findOne({
      user: req.user.id,
      date: {
        $gte: today,
        $lt: tomorrow,
      },
    });

    if (!nutrition) {
      const user = await User.findById(req.user.id);
      nutrition = await Nutrition.create({
        user: req.user.id,
        date: today,
        targets: {
          calories: user.profile?.dailyCalories || 2000,
          protein: user.profile?.protein || 150,
          carbs: user.profile?.carbs || 250,
          fats: user.profile?.fats || 67,
        },
      });
    }

    nutrition.dailySummary.waterIntake = amount;
    await nutrition.save();

    res.status(200).json({
      success: true,
      message: "Water intake updated successfully",
      data: nutrition,
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
    sugar: 0,
  };

  ingredients.forEach((ingredient) => {
    nutrition.calories += ingredient.calories || 0;
    nutrition.protein += ingredient.protein || 0;
    nutrition.carbs += ingredient.carbs || 0;
    nutrition.fats += ingredient.fats || 0;
    nutrition.fiber += ingredient.fiber || 0;
    nutrition.sugar += ingredient.sugar || 0;
  });

  return nutrition;
};
