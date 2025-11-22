const User = require("../models/User");
const Recipe = require("../models/Recipe");
const { calculateCalories } = require("../utils/calorieCalculator");
const { validationResult } = require("express-validator");

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateUserProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const {
      name,
      age,
      gender,
      height,
      weight,
      goal,
      activityLevel,
      dietaryPreference,
      allergies,
      restrictions,
    } = req.body;

    const updateData = { name };

    // Calculate new nutrition targets if relevant fields are updated
    if (age || gender || height || weight || goal || activityLevel) {
      const currentUser = await User.findById(req.user.id);
      const profileData = {
        age: age || currentUser.profile.age,
        gender: gender || currentUser.profile.gender,
        height: height || currentUser.profile.height,
        weight: weight || currentUser.profile.weight,
        goal: goal || currentUser.profile.goal,
        activityLevel: activityLevel || currentUser.profile.activityLevel,
      };

      const nutritionTargets = calculateCalories(profileData);

      updateData.profile = {
        ...profileData,
        dietaryPreference:
          dietaryPreference || currentUser.profile.dietaryPreference,
        allergies: allergies || currentUser.profile.allergies,
        restrictions: restrictions || currentUser.profile.restrictions,
        dailyCalories: nutritionTargets.dailyCalories,
        protein: nutritionTargets.protein,
        carbs: nutritionTargets.carbs,
        fats: nutritionTargets.fats,
      };
    } else {
      updateData.profile = {
        dietaryPreference,
        allergies: allergies || [],
        restrictions: restrictions || [],
      };
    }

    const user = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Calculate user calories
// @route   POST /api/users/calculate-calories
// @access  Private
exports.calculateUserCalories = async (req, res, next) => {
  try {
    const { age, gender, height, weight, goal, activityLevel } = req.body;

    if (!age || !gender || !height || !weight || !goal || !activityLevel) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    const nutritionTargets = calculateCalories({
      age,
      gender,
      height,
      weight,
      goal,
      activityLevel,
    });

    // Update user profile with calculated targets
    await User.findByIdAndUpdate(req.user.id, {
      profile: {
        age,
        gender,
        height,
        weight,
        goal,
        activityLevel,
        dailyCalories: nutritionTargets.dailyCalories,
        protein: nutritionTargets.protein,
        carbs: nutritionTargets.carbs,
        fats: nutritionTargets.fats,
      },
    });

    res.status(200).json({
      success: true,
      message: "Calories calculated successfully",
      data: nutritionTargets,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user meal history
// @route   GET /api/users/meal-history
// @access  Private
exports.getMealHistory = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate("mealHistory.meals");

    res.status(200).json({
      success: true,
      mealHistory: user.mealHistory || [],
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add meal to history
// @route   POST /api/users/meal-history
// @access  Private
exports.addMealToHistory = async (req, res, next) => {
  try {
    const { date, meals, totalCalories } = req.body;

    const user = await User.findById(req.user.id);

    const mealEntry = {
      date: date || new Date(),
      meals,
      totalCalories,
    };

    user.mealHistory.push(mealEntry);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Meal added to history successfully",
      mealHistory: user.mealHistory,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user account
// @route   DELETE /api/users/account
// @access  Private
exports.deleteUserAccount = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.user.id);

    res.status(200).json({
      success: true,
      message: "User account deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
