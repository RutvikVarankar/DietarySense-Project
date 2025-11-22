const mongoose = require("mongoose");

const nutritionSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please add a user reference"],
    },
    date: {
      type: Date,
      required: [true, "Please add a date"],
      default: Date.now,
    },
    meals: [
      {
        mealType: {
          type: String,
          enum: ["breakfast", "lunch", "dinner", "snack"],
          required: true,
        },
        recipe: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Recipe",
        },
        customMeal: {
          name: {
            type: String,
            trim: true,
          },
          ingredients: [
            {
              name: String,
              quantity: Number,
              unit: String,
            },
          ],
        },
        nutrition: {
          calories: {
            type: Number,
            required: true,
            min: [0, "Calories cannot be negative"],
          },
          protein: {
            type: Number,
            required: true,
            min: [0, "Protein cannot be negative"],
          },
          carbs: {
            type: Number,
            required: true,
            min: [0, "Carbs cannot be negative"],
          },
          fats: {
            type: Number,
            required: true,
            min: [0, "Fats cannot be negative"],
          },
          fiber: {
            type: Number,
            default: 0,
            min: [0, "Fiber cannot be negative"],
          },
          sugar: {
            type: Number,
            default: 0,
            min: [0, "Sugar cannot be negative"],
          },
        },
        consumedAt: {
          type: Date,
          default: Date.now,
        },
        notes: {
          type: String,
          trim: true,
          maxlength: [500, "Notes cannot be more than 500 characters"],
        },
      },
    ],
    dailySummary: {
      totalCalories: {
        type: Number,
        default: 0,
        min: [0, "Calories cannot be negative"],
      },
      totalProtein: {
        type: Number,
        default: 0,
        min: [0, "Protein cannot be negative"],
      },
      totalCarbs: {
        type: Number,
        default: 0,
        min: [0, "Carbs cannot be negative"],
      },
      totalFats: {
        type: Number,
        default: 0,
        min: [0, "Fats cannot be negative"],
      },
      totalFiber: {
        type: Number,
        default: 0,
        min: [0, "Fiber cannot be negative"],
      },
      totalSugar: {
        type: Number,
        default: 0,
        min: [0, "Sugar cannot be negative"],
      },
      waterIntake: {
        type: Number, // in ml
        default: 0,
        min: [0, "Water intake cannot be negative"],
      },
    },
    targets: {
      calories: {
        type: Number,
        min: [0, "Calories cannot be negative"],
      },
      protein: {
        type: Number,
        min: [0, "Protein cannot be negative"],
      },
      carbs: {
        type: Number,
        min: [0, "Carbs cannot be negative"],
      },
      fats: {
        type: Number,
        min: [0, "Fats cannot be negative"],
      },
    },
    goalsMet: {
      calories: {
        type: Boolean,
        default: false,
      },
      protein: {
        type: Boolean,
        default: false,
      },
      carbs: {
        type: Boolean,
        default: false,
      },
      fats: {
        type: Boolean,
        default: false,
      },
    },
    mood: {
      type: String,
      enum: ["excellent", "good", "average", "poor", "terrible"],
    },
    energyLevel: {
      type: String,
      enum: ["very_high", "high", "medium", "low", "very_low"],
    },
    sleepQuality: {
      type: String,
      enum: ["excellent", "good", "average", "poor", "terrible"],
    },
    exercise: {
      type: {
        type: String,
        trim: true,
      },
      duration: {
        type: Number, // in minutes
        min: [0, "Duration cannot be negative"],
      },
      intensity: {
        type: String,
        enum: ["low", "medium", "high"],
      },
      caloriesBurned: {
        type: Number,
        min: [0, "Calories burned cannot be negative"],
      },
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, "Notes cannot be more than 1000 characters"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for calorie balance (intake - burned)
nutritionSchema.virtual("calorieBalance").get(function () {
  const intake = this.dailySummary.totalCalories || 0;
  const burned = this.exercise?.caloriesBurned || 0;
  return intake - burned;
});

// Virtual for progress percentages
nutritionSchema.virtual("progress").get(function () {
  const progress = {};

  if (this.targets.calories) {
    progress.calories = Math.min(
      Math.round(
        (this.dailySummary.totalCalories / this.targets.calories) * 100
      ),
      100
    );
  }
  if (this.targets.protein) {
    progress.protein = Math.min(
      Math.round((this.dailySummary.totalProtein / this.targets.protein) * 100),
      100
    );
  }
  if (this.targets.carbs) {
    progress.carbs = Math.min(
      Math.round((this.dailySummary.totalCarbs / this.targets.carbs) * 100),
      100
    );
  }
  if (this.targets.fats) {
    progress.fats = Math.min(
      Math.round((this.dailySummary.totalFats / this.targets.fats) * 100),
      100
    );
  }

  return progress;
});

// Indexes for better query performance
nutritionSchema.index({ user: 1, date: 1 }, { unique: true });
nutritionSchema.index({ date: 1 });
nutritionSchema.index({ "dailySummary.totalCalories": 1 });

// Pre-save middleware to calculate daily summary and goals met
nutritionSchema.pre("save", function (next) {
  // Calculate daily summary from meals
  const summary = {
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFats: 0,
    totalFiber: 0,
    totalSugar: 0,
  };

  this.meals.forEach((meal) => {
    summary.totalCalories += meal.nutrition.calories || 0;
    summary.totalProtein += meal.nutrition.protein || 0;
    summary.totalCarbs += meal.nutrition.carbs || 0;
    summary.totalFats += meal.nutrition.fats || 0;
    summary.totalFiber += meal.nutrition.fiber || 0;
    summary.totalSugar += meal.nutrition.sugar || 0;
  });

  this.dailySummary = summary;

  // Check if goals are met
  if (this.targets.calories) {
    this.goalsMet.calories =
      this.dailySummary.totalCalories >= this.targets.calories * 0.9 &&
      this.dailySummary.totalCalories <= this.targets.calories * 1.1;
  }
  if (this.targets.protein) {
    this.goalsMet.protein =
      this.dailySummary.totalProtein >= this.targets.protein * 0.9;
  }
  if (this.targets.carbs) {
    this.goalsMet.carbs =
      this.dailySummary.totalCarbs >= this.targets.carbs * 0.9;
  }
  if (this.targets.fats) {
    this.goalsMet.fats = this.dailySummary.totalFats >= this.targets.fats * 0.9;
  }

  next();
});

// Static method to get nutrition data for a date range
nutritionSchema.statics.findByDateRange = function (
  userId,
  startDate,
  endDate
) {
  return this.find({
    user: userId,
    date: {
      $gte: startDate,
      $lte: endDate,
    },
  }).sort({ date: 1 });
};

// Static method to get weekly summary
nutritionSchema.statics.getWeeklySummary = async function (userId, startDate) {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);

  const data = await this.find({
    user: userId,
    date: {
      $gte: startDate,
      $lte: endDate,
    },
  });

  const summary = {
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFats: 0,
    averageCalories: 0,
    daysCompleted: data.length,
    goalsMet: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
    },
  };

  data.forEach((day) => {
    summary.totalCalories += day.dailySummary.totalCalories;
    summary.totalProtein += day.dailySummary.totalProtein;
    summary.totalCarbs += day.dailySummary.totalCarbs;
    summary.totalFats += day.dailySummary.totalFats;

    if (day.goalsMet.calories) summary.goalsMet.calories++;
    if (day.goalsMet.protein) summary.goalsMet.protein++;
    if (day.goalsMet.carbs) summary.goalsMet.carbs++;
    if (day.goalsMet.fats) summary.goalsMet.fats++;
  });

  summary.averageCalories =
    data.length > 0 ? Math.round(summary.totalCalories / data.length) : 0;

  return summary;
};

// Instance method to add meal
nutritionSchema.methods.addMeal = async function (mealData) {
  this.meals.push(mealData);
  return await this.save();
};

// Instance method to update water intake
nutritionSchema.methods.updateWaterIntake = async function (amount) {
  this.dailySummary.waterIntake = amount;
  return await this.save();
};

module.exports = mongoose.model("Nutrition", nutritionSchema);
