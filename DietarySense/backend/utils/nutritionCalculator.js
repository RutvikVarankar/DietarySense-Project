/**
 * @desc    Calculate nutrition facts from ingredients
 * @param   ingredients - Array of ingredient objects
 * @return  Object with total nutrition values
 */

const calculateNutritionFromIngredients = (ingredients) => {
  if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
    throw new Error("Ingredients array is required and cannot be empty");
  }

  const nutrition = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0,
  };

  ingredients.forEach((ingredient) => {
    const ingredientNutrition = ingredient.nutrition || {};

    nutrition.calories += ingredientNutrition.calories || 0;
    nutrition.protein += ingredientNutrition.protein || 0;
    nutrition.carbs += ingredientNutrition.carbs || 0;
    nutrition.fats += ingredientNutrition.fats || 0;
    nutrition.fiber += ingredientNutrition.fiber || 0;
    nutrition.sugar += ingredientNutrition.sugar || 0;
    nutrition.sodium += ingredientNutrition.sodium || 0;
  });

  // Round to 1 decimal place for better readability
  Object.keys(nutrition).forEach((key) => {
    nutrition[key] = parseFloat(nutrition[key].toFixed(1));
  });

  return nutrition;
};

/**
 * @desc    Calculate nutrition per serving
 * @param   totalNutrition - Total nutrition object
 * @param   servings - Number of servings
 * @return  Object with nutrition per serving
 */
const calculateNutritionPerServing = (totalNutrition, servings = 1) => {
  if (servings <= 0) {
    throw new Error("Servings must be greater than 0");
  }

  const perServing = { ...totalNutrition };

  Object.keys(perServing).forEach((key) => {
    if (typeof perServing[key] === "number") {
      perServing[key] = parseFloat((perServing[key] / servings).toFixed(1));
    }
  });

  return perServing;
};

/**
 * @desc    Calculate meal nutrition from multiple recipes
 * @param   recipes - Array of recipe objects or IDs
 * @return  Object with combined nutrition values
 */
const calculateMealNutrition = async (recipes) => {
  const Recipe = require("../models/Recipe");

  if (!recipes || !Array.isArray(recipes)) {
    throw new Error("Recipes array is required");
  }

  const mealNutrition = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0,
  };

  for (const recipeItem of recipes) {
    let recipe;

    if (typeof recipeItem === "string" || recipeItem._id) {
      // It's a recipe ID or populated recipe
      recipe = await Recipe.findById(recipeItem._id || recipeItem);
    } else if (recipeItem.nutrition) {
      // It's already a recipe object with nutrition
      recipe = recipeItem;
    }

    if (recipe && recipe.nutrition) {
      mealNutrition.calories += recipe.nutrition.calories || 0;
      mealNutrition.protein += recipe.nutrition.protein || 0;
      mealNutrition.carbs += recipe.nutrition.carbs || 0;
      mealNutrition.fats += recipe.nutrition.fats || 0;
      mealNutrition.fiber += recipe.nutrition.fiber || 0;
      mealNutrition.sugar += recipe.nutrition.sugar || 0;
      mealNutrition.sodium += recipe.nutrition.sodium || 0;
    }
  }

  // Round values
  Object.keys(mealNutrition).forEach((key) => {
    mealNutrition[key] = Math.round(mealNutrition[key]);
  });

  return mealNutrition;
};

/**
 * @desc    Calculate daily nutrition progress
 * @param   meals - Array of meals consumed
 * @param   targets - Daily nutrition targets
 * @return  Object with progress percentages and remaining values
 */
const calculateDailyProgress = (meals, targets) => {
  const consumed = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
  };

  // Sum nutrition from all meals
  meals.forEach((meal) => {
    if (meal.nutrition) {
      consumed.calories += meal.nutrition.calories || 0;
      consumed.protein += meal.nutrition.protein || 0;
      consumed.carbs += meal.nutrition.carbs || 0;
      consumed.fats += meal.nutrition.fats || 0;
    }
  });

  // Calculate progress percentages and remaining values
  const progress = {};
  const remaining = {};

  Object.keys(consumed).forEach((nutrient) => {
    const target = targets[nutrient] || 0;
    const consumedAmount = consumed[nutrient];

    if (target > 0) {
      progress[nutrient] = Math.min(
        Math.round((consumedAmount / target) * 100),
        100
      );
      remaining[nutrient] = Math.max(target - consumedAmount, 0);
    } else {
      progress[nutrient] = 0;
      remaining[nutrient] = 0;
    }
  });

  return {
    consumed,
    targets,
    progress,
    remaining,
    totalConsumed: consumed,
  };
};

/**
 * @desc    Estimate nutrition for common ingredients
 * @param   ingredientName - Name of the ingredient
 * @param   quantity - Quantity in grams
 * @return  Estimated nutrition values
 */
const estimateIngredientNutrition = (ingredientName, quantity = 100) => {
  const commonIngredients = {
    // Nutrition per 100g
    "chicken breast": { calories: 165, protein: 31, carbs: 0, fats: 3.6 },
    "brown rice": { calories: 111, protein: 2.6, carbs: 23, fats: 0.9 },
    broccoli: { calories: 34, protein: 2.8, carbs: 7, fats: 0.4 },
    salmon: { calories: 208, protein: 20, carbs: 0, fats: 13 },
    eggs: { calories: 155, protein: 13, carbs: 1.1, fats: 11 },
    oats: { calories: 389, protein: 16.9, carbs: 66, fats: 6.9 },
    banana: { calories: 89, protein: 1.1, carbs: 23, fats: 0.3 },
    almonds: { calories: 579, protein: 21, carbs: 22, fats: 50 },
    milk: { calories: 42, protein: 3.4, carbs: 5, fats: 1 },
    yogurt: { calories: 59, protein: 10, carbs: 3.6, fats: 0.4 },
  };

  const normalizedName = ingredientName.toLowerCase().trim();
  const baseNutrition = commonIngredients[normalizedName];

  if (!baseNutrition) {
    // Return default values for unknown ingredients
    return {
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      estimated: false,
    };
  }

  const scale = quantity / 100;

  return {
    calories: Math.round(baseNutrition.calories * scale),
    protein: parseFloat((baseNutrition.protein * scale).toFixed(1)),
    carbs: parseFloat((baseNutrition.carbs * scale).toFixed(1)),
    fats: parseFloat((baseNutrition.fats * scale).toFixed(1)),
    estimated: true,
  };
};

module.exports = {
  calculateNutritionFromIngredients,
  calculateNutritionPerServing,
  calculateMealNutrition,
  calculateDailyProgress,
  estimateIngredientNutrition,
};
