/**
 * @desc    Calculate daily calorie needs and macronutrients using Mifflin-St Jeor Equation
 * @param   userData - Object containing age, gender, height, weight, goal, activityLevel
 * @return  Object with dailyCalories, protein, carbs, fats, bmr, maintenanceCalories
 */

const calculateCalories = (userData) => {
  const { age, gender, height, weight, goal, activityLevel } = userData;

  // Validate required fields
  if (!age || !gender || !height || !weight || !goal || !activityLevel) {
    throw new Error(
      "All user data fields (age, gender, height, weight, goal, activityLevel) are required for calorie calculation"
    );
  }

  // Validate numeric ranges
  if (age < 1 || age > 120) throw new Error("Age must be between 1 and 120");
  if (height < 50 || height > 250)
    throw new Error("Height must be between 50cm and 250cm");
  if (weight < 20 || weight > 300)
    throw new Error("Weight must be between 20kg and 300kg");

  // BMR calculation using Mifflin-St Jeor Equation (most accurate)
  let bmr;
  if (gender === "male") {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else if (gender === "female") {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  } else {
    // For 'other', use average of male and female formulas
    bmr =
      (10 * weight +
        6.25 * height -
        5 * age +
        5 +
        10 * weight +
        6.25 * height -
        5 * age -
        161) /
      2;
  }

  // Activity multiplier (Harris-Benedict revised)
  const activityMultipliers = {
    sedentary: 1.2, // Little or no exercise
    light: 1.375, // Light exercise 1-3 days/week
    moderate: 1.55, // Moderate exercise 3-5 days/week
    active: 1.725, // Hard exercise 6-7 days/week
    very_active: 1.9, // Very hard exercise, physical job
  };

  const activityMultiplier = activityMultipliers[activityLevel] || 1.2;
  const maintenanceCalories = bmr * activityMultiplier;

  // Goal adjustment with safe limits
  const goalAdjustments = {
    weight_loss: -500, // 0.5kg per week
    maintenance: 0, // Maintain current weight
    muscle_gain: 300, // Lean muscle gain
  };

  const adjustment = goalAdjustments[goal] || 0;
  let targetCalories = maintenanceCalories + adjustment;

  // Ensure minimum calorie intake for health
  const minimumCalories = gender === "male" ? 1500 : 1200;
  targetCalories = Math.max(targetCalories, minimumCalories);

  // Macronutrient distribution based on goal and best practices
  let macroRatios;
  switch (goal) {
    case "weight_loss":
      // Higher protein for satiety and muscle preservation
      macroRatios = { protein: 0.35, carbs: 0.4, fats: 0.25 };
      break;
    case "muscle_gain":
      // Balanced with adequate carbs for energy
      macroRatios = { protein: 0.3, carbs: 0.5, fats: 0.2 };
      break;
    case "maintenance":
    default:
      // Standard balanced distribution
      macroRatios = { protein: 0.25, carbs: 0.5, fats: 0.25 };
  }

  // Calculate macronutrients in grams
  const proteinGrams = (targetCalories * macroRatios.protein) / 4; // 4 calories per gram
  const carbsGrams = (targetCalories * macroRatios.carbs) / 4; // 4 calories per gram
  const fatsGrams = (targetCalories * macroRatios.fats) / 9; // 9 calories per gram

  // Calculate BMI
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);

  return {
    bmr: Math.round(bmr),
    maintenanceCalories: Math.round(maintenanceCalories),
    dailyCalories: Math.round(targetCalories),
    protein: Math.round(proteinGrams),
    carbs: Math.round(carbsGrams),
    fats: Math.round(fatsGrams),
    bmi: parseFloat(bmi.toFixed(1)),
    macroRatios,
    activityMultiplier,
  };
};

/**
 * @desc    Calculate calorie needs for specific weight target
 * @param   currentWeight - Current weight in kg
 * @param   targetWeight - Target weight in kg
 * @param   timeframeWeeks - Timeframe in weeks to reach target
 * @return  Object with dailyCalorieAdjustment and weeklyDeficit
 */
const calculateWeightGoalCalories = (
  currentWeight,
  targetWeight,
  timeframeWeeks = 12
) => {
  const weightDifference = currentWeight - targetWeight;
  const totalCalorieDeficit = weightDifference * 7700; // 7700 calories per kg of weight loss

  const weeklyDeficit = totalCalorieDeficit / timeframeWeeks;
  const dailyDeficit = weeklyDeficit / 7;

  return {
    dailyCalorieAdjustment: Math.round(dailyDeficit),
    weeklyDeficit: Math.round(weeklyDeficit),
    recommendedTimeframe: timeframeWeeks,
    isAggressive: timeframeWeeks < 8,
  };
};

/**
 * @desc    Calculate maintenance calories for weight management
 * @param   weight - Weight in kg
 * @param   isMetric - Whether weight is in kg (true) or lbs (false)
 * @return  Maintenance calories estimate
 */
const calculateMaintenanceCalories = (weight, isMetric = true) => {
  const weightInKg = isMetric ? weight : weight * 0.453592;
  return Math.round(weightInKg * 30); // Simple maintenance estimate
};

module.exports = {
  calculateCalories,
  calculateWeightGoalCalories,
  calculateMaintenanceCalories,
};
