// Application constants
export const APP_CONFIG = {
  NAME: "DietarySense",
  VERSION: "1.0.0",
  DESCRIPTION: "Personalized Dietary Restriction Meal Planner",
};

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: "token",
  USER: "user",
  THEME: "theme",
  LANGUAGE: "language",
};

// User Roles
export const USER_ROLES = {
  USER: "user",
  ADMIN: "admin",
};

// Dietary Preferences
export const DIETARY_PREFERENCES = {
  VEGETARIAN: "vegetarian",
  VEGAN: "vegan",
  GLUTEN_FREE: "gluten-free",
  NON_VEGETARIAN: "non-vegetarian",
  NONE: "none",
};

// Activity Levels
export const ACTIVITY_LEVELS = {
  SEDENTARY: "sedentary",
  LIGHT: "light",
  MODERATE: "moderate",
  ACTIVE: "active",
  VERY_ACTIVE: "very_active",
};

// Goals
export const GOALS = {
  WEIGHT_LOSS: "weight_loss",
  MAINTENANCE: "maintenance",
  MUSCLE_GAIN: "muscle_gain",
};

// Recipe Difficulties
export const RECIPE_DIFFICULTIES = {
  EASY: "easy",
  MEDIUM: "medium",
  HARD: "hard",
};

// Meal Types
export const MEAL_TYPES = {
  BREAKFAST: "breakfast",
  LUNCH: "lunch",
  DINNER: "dinner",
  SNACKS: "snacks",
};

// Dietary Tags
export const DIETARY_TAGS = {
  VEGETARIAN: "vegetarian",
  VEGAN: "vegan",
  GLUTEN_FREE: "gluten-free",
  DAIRY_FREE: "dairy-free",
  NUT_FREE: "nut-free",
  LOW_CARB: "low-carb",
  HIGH_PROTEIN: "high-protein",
  LOW_FAT: "low-fat",
  KETO: "keto",
  PALEO: "paleo",
  MEDITERRANEAN: "mediterranean",
};

// Grocery Categories
export const GROCERY_CATEGORIES = {
  PRODUCE: "produce",
  DAIRY: "dairy",
  MEAT: "meat",
  SEAFOOD: "seafood",
  GRAINS: "grains",
  PANTRY: "pantry",
  SPICES: "spices",
  BEVERAGES: "beverages",
  FROZEN: "frozen",
  OTHER: "other",
};

// Measurement Units
export const MEASUREMENT_UNITS = {
  PIECES: "pieces",
  GRAMS: "g",
  KILOGRAMS: "kg",
  MILLILITERS: "ml",
  LITERS: "l",
  CUPS: "cups",
  TABLESPOONS: "tbsp",
  TEASPOONS: "tsp",
  BOTTLE: "bottle",
  PACK: "pack",
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
  MAX_LIMIT: 100,
};

// Form Validation
export const VALIDATION = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 6,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: "MMM DD, YYYY",
  API: "YYYY-MM-DD",
  TIME: "HH:mm",
};

// Theme Colors
export const THEME_COLORS = {
  PRIMARY: "#2c5530",
  SECONDARY: "#4a7c59",
  SUCCESS: "#28a745",
  INFO: "#17a2b8",
  WARNING: "#ffc107",
  DANGER: "#dc3545",
  LIGHT: "#f8f9fa",
  DARK: "#343a40",
};

// Breakpoints for responsive design
export const BREAKPOINTS = {
  XS: 0,
  SM: 576,
  MD: 768,
  LG: 992,
  XL: 1200,
  XXL: 1400,
};

// Export all constants as default
export default {
  APP_CONFIG,
  API_CONFIG,
  STORAGE_KEYS,
  USER_ROLES,
  DIETARY_PREFERENCES,
  ACTIVITY_LEVELS,
  GOALS,
  RECIPE_DIFFICULTIES,
  MEAL_TYPES,
  DIETARY_TAGS,
  GROCERY_CATEGORIES,
  MEASUREMENT_UNITS,
  PAGINATION,
  VALIDATION,
  DATE_FORMATS,
  THEME_COLORS,
  BREAKPOINTS,
};
