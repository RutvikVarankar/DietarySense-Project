const mongoose = require("mongoose");

const grocerySchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Please add a grocery item name"],
      trim: true,
      maxlength: [100, "Name cannot be more than 100 characters"],
    },
    quantity: {
      type: Number,
      required: [true, "Please add quantity"],
      min: [0.1, "Quantity must be at least 0.1"],
    },
    unit: {
      type: String,
      required: [true, "Please add unit"],
      enum: [
        "pieces",
        "g",
        "kg",
        "ml",
        "l",
        "cups",
        "tbsp",
        "tsp",
        "bottle",
        "pack",
        "oz",
        "lb",
      ],
      default: "pieces",
    },
    category: {
      type: String,
      required: [true, "Please add category"],
      enum: [
        "produce",
        "dairy",
        "meat",
        "seafood",
        "grains",
        "pantry",
        "spices",
        "beverages",
        "frozen",
        "other",
      ],
      default: "other",
    },
    purchased: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [200, "Notes cannot be more than 200 characters"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for better query performance
grocerySchema.index({ user: 1, createdAt: -1 });
grocerySchema.index({ user: 1, category: 1 });
grocerySchema.index({ user: 1, purchased: 1 });

// Virtual for formatted quantity
grocerySchema.virtual("formattedQuantity").get(function () {
  return `${this.quantity} ${this.unit}`;
});

// Static method to get user's grocery list
grocerySchema.statics.getUserGroceryList = function (userId) {
  return this.find({ user: userId }).sort({ createdAt: -1 });
};

// Static method to get items by category
grocerySchema.statics.getItemsByCategory = function (userId, category) {
  return this.find({ user: userId, category }).sort({ createdAt: -1 });
};

// Static method to get purchased items
grocerySchema.statics.getPurchasedItems = function (userId) {
  return this.find({ user: userId, purchased: true }).sort({ createdAt: -1 });
};

// Static method to get pending items
grocerySchema.statics.getPendingItems = function (userId) {
  return this.find({ user: userId, purchased: false }).sort({ createdAt: -1 });
};

module.exports = mongoose.model("Grocery", grocerySchema);
