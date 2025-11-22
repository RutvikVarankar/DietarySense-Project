const User = require("../models/User");
const Recipe = require("../models/Recipe");
const MealPlan = require("../models/MealPlan");
const { validationResult } = require("express-validator");

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboardStats = async (req, res, next) => {
  try {
    // Get total counts
    const totalUsers = await User.countDocuments();
    const totalRecipes = await Recipe.countDocuments();
    const totalMealPlans = await MealPlan.countDocuments();
    const pendingRecipes = await Recipe.countDocuments({ isApproved: false });

    // Get user growth data (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    // Get dietary preference statistics
    const dietaryStats = await User.aggregate([
      {
        $group: {
          _id: "$profile.dietaryPreference",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get meal plan type statistics
    const mealPlanStats = await MealPlan.aggregate([
      {
        $unwind: "$days",
      },
      {
        $group: {
          _id: "$preferences.dietaryPreference",
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totals: {
          users: totalUsers,
          recipes: totalRecipes,
          mealPlans: totalMealPlans,
          pendingRecipes,
        },
        growth: {
          newUsers,
        },
        dietaryStats,
        mealPlanStats,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users with pagination
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all recipes for admin with filters
// @route   GET /api/admin/recipes
// @access  Private/Admin
exports.getRecipes = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;

    const filter = {};

    if (status === "pending") {
      filter.isApproved = false;
    } else if (status === "approved") {
      filter.isApproved = true;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const recipes = await Recipe.find(filter)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

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

// @desc    Approve recipe
// @route   PUT /api/admin/recipes/:id/approve
// @access  Private/Admin
exports.approveRecipe = async (req, res, next) => {
  try {
    const recipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    ).populate("createdBy", "name email");

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "Recipe not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Recipe approved successfully",
      data: recipe,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject recipe
// @route   PUT /api/admin/recipes/:id/reject
// @access  Private/Admin
exports.rejectRecipe = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const recipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      {
        isApproved: false,
        rejectionReason: reason,
      },
      { new: true }
    ).populate("createdBy", "name email");

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "Recipe not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Recipe rejected successfully",
      data: recipe,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete your own account",
      });
    }

    // Delete user's recipes and meal plans
    await Recipe.deleteMany({ createdBy: user._id });
    await MealPlan.deleteMany({ user: user._id });
    await User.findByIdAndDelete(user._id);

    res.status(200).json({
      success: true,
      message: "User and associated data deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user meal plans (admin view)
// @route   GET /api/admin/meal-plans
// @access  Private/Admin
exports.getMealPlans = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, userId } = req.query;

    const filter = {};
    if (userId) {
      filter.user = userId;
    }

    const mealPlans = await MealPlan.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await MealPlan.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: mealPlans.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: mealPlans,
    });
  } catch (error) {
    next(error);
  }
};
