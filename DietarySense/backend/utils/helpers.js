/**
 * @desc    Utility functions for common operations
 */

/**
 * Format date to YYYY-MM-DD
 */
const formatDate = (date = new Date()) => {
  return date.toISOString().split("T")[0];
};

/**
 * Generate a random string of specified length
 */
const generateRandomString = (length = 8) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Validate email format
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Calculate age from birth date
 */
const calculateAge = (birthDate) => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
};

/**
 * Convert grams to ounces
 */
const gramsToOunces = (grams) => {
  return parseFloat((grams * 0.035274).toFixed(2));
};

/**
 * Convert ounces to grams
 */
const ouncesToGrams = (ounces) => {
  return parseFloat((ounces * 28.3495).toFixed(2));
};

/**
 * Convert centimeters to inches
 */
const cmToInches = (cm) => {
  return parseFloat((cm * 0.393701).toFixed(2));
};

/**
 * Convert inches to centimeters
 */
const inchesToCm = (inches) => {
  return parseFloat((inches * 2.54).toFixed(2));
};

/**
 * Convert kilograms to pounds
 */
const kgToLbs = (kg) => {
  return parseFloat((kg * 2.20462).toFixed(2));
};

/**
 * Convert pounds to kilograms
 */
const lbsToKg = (lbs) => {
  return parseFloat((lbs * 0.453592).toFixed(2));
};

/**
 * Calculate BMI
 */
const calculateBMI = (weight, height, isMetric = true) => {
  let weightKg = isMetric ? weight : lbsToKg(weight);
  let heightM = isMetric ? height / 100 : inchesToCm(height) / 100;

  if (heightM === 0) return 0;

  const bmi = weightKg / (heightM * heightM);
  return parseFloat(bmi.toFixed(1));
};

/**
 * Get BMI category
 */
const getBMICategory = (bmi) => {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal weight";
  if (bmi < 30) return "Overweight";
  return "Obese";
};

/**
 * Paginate array of results
 */
const paginateResults = (results, page = 1, limit = 10) => {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const paginatedResults = results.slice(startIndex, endIndex);

  return {
    data: paginatedResults,
    currentPage: page,
    totalPages: Math.ceil(results.length / limit),
    totalItems: results.length,
    hasNext: endIndex < results.length,
    hasPrev: startIndex > 0,
  };
};

/**
 * Sanitize user input for database queries
 */
const sanitizeInput = (input) => {
  if (typeof input === "string") {
    return input.trim().replace(/[<>&"']/g, "");
  }
  return input;
};

/**
 * Generate progress percentage
 */
const calculateProgress = (current, target) => {
  if (target === 0) return 0;
  return Math.min(Math.round((current / target) * 100), 100);
};

/**
 * Format nutrition values for display
 */
const formatNutrition = (value, unit = "g") => {
  if (value === 0) return `0${unit}`;
  if (value < 1) return `${value}${unit}`;
  return `${Math.round(value)}${unit}`;
};

/**
 * Calculate water intake recommendation
 */
const calculateWaterIntake = (weight, activityLevel = "moderate") => {
  const baseWater = weight * 0.033; // Base recommendation in liters

  const activityMultipliers = {
    sedentary: 1,
    light: 1.2,
    moderate: 1.5,
    active: 1.8,
    very_active: 2,
  };

  const multiplier = activityMultipliers[activityLevel] || 1;
  return Math.round(baseWater * multiplier * 1000); // Convert to ml
};

/**
 * Debounce function for search inputs
 */
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Generate meal plan color based on dietary preference
 */
const getDietaryPreferenceColor = (preference) => {
  const colors = {
    vegetarian: "#4CAF50",
    vegan: "#8BC34A",
    "gluten-free": "#FF9800",
    "non-vegetarian": "#F44336",
    none: "#9E9E9E",
  };

  return colors[preference] || "#9E9E9E";
};

module.exports = {
  formatDate,
  generateRandomString,
  isValidEmail,
  calculateAge,
  gramsToOunces,
  ouncesToGrams,
  cmToInches,
  inchesToCm,
  kgToLbs,
  lbsToKg,
  calculateBMI,
  getBMICategory,
  paginateResults,
  sanitizeInput,
  calculateProgress,
  formatNutrition,
  calculateWaterIntake,
  debounce,
  getDietaryPreferenceColor,
};
