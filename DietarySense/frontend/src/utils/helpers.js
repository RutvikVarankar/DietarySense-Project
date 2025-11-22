import { DATE_FORMATS, MEASUREMENT_UNITS, THEME_COLORS } from "./constants";

/**
 * Format date to readable string
 */
export const formatDate = (date, format = DATE_FORMATS.DISPLAY) => {
  if (!date) return "N/A";

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return "Invalid Date";

  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  return dateObj.toLocaleDateString("en-US", options);
};

/**
 * Format time from minutes to readable string
 */
export const formatTime = (minutes) => {
  if (!minutes || minutes < 0) return "0m";

  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

/**
 * Format measurement for display
 */
export const formatMeasurement = (quantity, unit) => {
  if (!quantity && quantity !== 0) return "";

  const formattedQuantity = Number.isInteger(quantity)
    ? quantity
    : quantity.toFixed(1);

  switch (unit) {
    case MEASUREMENT_UNITS.GRAMS:
      return `${formattedQuantity}g`;
    case MEASUREMENT_UNITS.KILOGRAMS:
      return `${formattedQuantity}kg`;
    case MEASUREMENT_UNITS.MILLILITERS:
      return `${formattedQuantity}ml`;
    case MEASUREMENT_UNITS.LITERS:
      return `${formattedQuantity}L`;
    case MEASUREMENT_UNITS.TABLESPOONS:
      return `${formattedQuantity} tbsp`;
    case MEASUREMENT_UNITS.TEASPOONS:
      return `${formattedQuantity} tsp`;
    case MEASUREMENT_UNITS.CUPS:
      return `${formattedQuantity} cup${formattedQuantity !== 1 ? "s" : ""}`;
    default:
      return `${formattedQuantity} ${unit}`;
  }
};

/**
 * Calculate BMI
 */
export const calculateBMI = (weight, height) => {
  if (!weight || !height) return null;

  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);
  return parseFloat(bmi.toFixed(1));
};

/**
 * Get BMI category
 */
export const getBMICategory = (bmi) => {
  if (bmi < 18.5)
    return { category: "Underweight", color: THEME_COLORS.WARNING };
  if (bmi < 25)
    return { category: "Normal weight", color: THEME_COLORS.SUCCESS };
  if (bmi < 30) return { category: "Overweight", color: THEME_COLORS.WARNING };
  return { category: "Obese", color: THEME_COLORS.DANGER };
};

/**
 * Debounce function for search inputs
 */
export const debounce = (func, wait) => {
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
 * Truncate text with ellipsis
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

/**
 * Generate random ID
 */
export const generateId = (prefix = "id") => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Capitalize first letter
 */
export const capitalize = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Format number with commas
 */
export const formatNumber = (num) => {
  if (!num && num !== 0) return "0";
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

/**
 * Calculate percentage
 */
export const calculatePercentage = (value, total) => {
  if (!total || total === 0) return 0;
  return Math.round((value / total) * 100);
};

/**
 * Get initial from name
 */
export const getInitials = (name) => {
  if (!name) return "U";
  return name
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
    .substring(0, 2);
};

/**
 * Check if value is empty
 */
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
};

/**
 * Deep clone object
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== "object") return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map((item) => deepClone(item));
  if (obj instanceof Object) {
    const clonedObj = {};
    Object.keys(obj).forEach((key) => {
      clonedObj[key] = deepClone(obj[key]);
    });
    return clonedObj;
  }
};

/**
 * Get error message from error object
 */
export const getErrorMessage = (error) => {
  if (typeof error === "string") return error;
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.message) return error.message;
  return "An unexpected error occurred";
};

/**
 * Format file size
 */
export const formatFileSize = (bytes) => {
  if (!bytes) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/**
 * Sleep function for testing
 */
export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default {
  formatDate,
  formatTime,
  formatMeasurement,
  calculateBMI,
  getBMICategory,
  debounce,
  truncateText,
  generateId,
  capitalize,
  formatNumber,
  calculatePercentage,
  getInitials,
  isEmpty,
  deepClone,
  getErrorMessage,
  formatFileSize,
  sleep,
};
