const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      trim: true,
      maxlength: [50, "Name cannot be more than 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    profile: {
      age: {
        type: Number,
        min: [1, "Age must be at least 1"],
        max: [120, "Age cannot be more than 120"],
      },
      gender: {
        type: String,
        enum: ["male", "female", "other"],
      },
      height: {
        type: Number, // in cm
        min: [50, "Height must be at least 50cm"],
        max: [250, "Height cannot be more than 250cm"],
      },
      weight: {
        type: Number, // in kg
        min: [20, "Weight must be at least 20kg"],
        max: [300, "Weight cannot be more than 300kg"],
      },
      goal: {
        type: String,
        enum: ["weight_loss", "maintenance", "muscle_gain"],
      },
      activityLevel: {
        type: String,
        enum: ["sedentary", "light", "moderate", "active", "very_active"],
      },
      dietaryPreference: {
        type: String,
        enum: ["vegetarian", "non-vegetarian", "vegan", "gluten-free", "none"],
      },
      allergies: [
        {
          type: String,
          trim: true,
        },
      ],
      restrictions: [
        {
          type: String,
          trim: true,
        },
      ],
      dailyCalories: {
        type: Number,
        min: [0, "Calories cannot be negative"],
      },
      protein: {
        type: Number, // in grams
        min: [0, "Protein cannot be negative"],
      },
      carbs: {
        type: Number, // in grams
        min: [0, "Carbs cannot be negative"],
      },
      fats: {
        type: Number, // in grams
        min: [0, "Fats cannot be negative"],
      },
    },
    mealHistory: [
      {
        date: {
          type: Date,
          default: Date.now,
        },
        meals: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Recipe",
          },
        ],
        totalCalories: {
          type: Number,
          default: 0,
        },
        totalProtein: {
          type: Number,
          default: 0,
        },
        totalCarbs: {
          type: Number,
          default: 0,
        },
        totalFats: {
          type: Number,
          default: 0,
        },
      },
    ],
    preferences: {
      cuisine: [
        {
          type: String,
          trim: true,
        },
      ],
      excludedIngredients: [
        {
          type: String,
          trim: true,
        },
      ],
      cookingTime: {
        maxPrepTime: Number,
        maxCookTime: Number,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for BMI calculation
userSchema.virtual("profile.bmi").get(function () {
  if (this.profile.height && this.profile.weight) {
    const heightInMeters = this.profile.height / 100;
    return (this.profile.weight / (heightInMeters * heightInMeters)).toFixed(1);
  }
  return null;
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ "profile.dietaryPreference": 1 });
userSchema.index({ createdAt: -1 });

// Pre-save middleware to hash password
userSchema.pre("save", async function (next) {
  // Only run if password was modified
  if (!this.isModified("password")) {
    return next();
  }

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Instance method to update last login
userSchema.methods.updateLastLogin = async function () {
  this.lastLogin = new Date();
  return await this.save();
};

// Static method to get users by dietary preference
userSchema.statics.getUsersByDietaryPreference = function (preference) {
  return this.find({ "profile.dietaryPreference": preference });
};

// Static method to get inactive users
userSchema.statics.getInactiveUsers = function (days = 30) {
  const date = new Date();
  date.setDate(date.getDate() - days);

  return this.find({
    $or: [{ lastLogin: { $lt: date } }, { lastLogin: { $exists: false } }],
    isActive: true,
  });
};

module.exports = mongoose.model("User", userSchema);
