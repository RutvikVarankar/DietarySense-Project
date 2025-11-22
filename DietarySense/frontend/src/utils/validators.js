import { VALIDATION } from "./constants";

/**
 * Email validation
 */
export const validateEmail = (email) => {
  if (!email) return "Email is required";
  if (!VALIDATION.EMAIL.test(email))
    return "Please enter a valid email address";
  return null;
};

/**
 * Password validation
 */
export const validatePassword = (password) => {
  if (!password) return "Password is required";
  if (password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters long`;
  }
  if (!/(?=.*[a-z])/.test(password)) {
    return "Password must contain at least one lowercase letter";
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    return "Password must contain at least one uppercase letter";
  }
  if (!/(?=.*\d)/.test(password)) {
    return "Password must contain at least one number";
  }
  return null;
};

/**
 * Confirm password validation
 */
export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) return "Please confirm your password";
  if (password !== confirmPassword) return "Passwords do not match";
  return null;
};

/**
 * Name validation
 */
export const validateName = (name) => {
  if (!name) return "Name is required";
  if (name.length < VALIDATION.NAME_MIN_LENGTH) {
    return `Name must be at least ${VALIDATION.NAME_MIN_LENGTH} characters long`;
  }
  if (name.length > VALIDATION.NAME_MAX_LENGTH) {
    return `Name must be less than ${VALIDATION.NAME_MAX_LENGTH} characters`;
  }
  return null;
};

/**
 * Required field validation
 */
export const validateRequired = (value, fieldName) => {
  if (!value && value !== 0) return `${fieldName} is required`;
  if (typeof value === "string" && value.trim() === "")
    return `${fieldName} is required`;
  return null;
};

/**
 * Number validation
 */
export const validateNumber = (value, fieldName, options = {}) => {
  const { min, max, required = true } = options;

  if (!value && value !== 0) {
    return required ? `${fieldName} is required` : null;
  }

  const num = Number(value);
  if (isNaN(num)) return `${fieldName} must be a valid number`;

  if (min !== undefined && num < min) {
    return `${fieldName} must be at least ${min}`;
  }

  if (max !== undefined && num > max) {
    return `${fieldName} must be at most ${max}`;
  }

  return null;
};

/**
 * Age validation
 */
export const validateAge = (age) => {
  return validateNumber(age, "Age", { min: 1, max: 120 });
};

/**
 * Height validation (in cm)
 */
export const validateHeight = (height) => {
  return validateNumber(height, "Height", { min: 50, max: 250 });
};

/**
 * Weight validation (in kg)
 */
export const validateWeight = (weight) => {
  return validateNumber(weight, "Weight", { min: 20, max: 300 });
};

/**
 * URL validation
 */
export const validateURL = (url) => {
  if (!url) return null;

  try {
    new URL(url);
    return null;
  } catch {
    return "Please enter a valid URL";
  }
};

/**
 * Phone number validation
 */
export const validatePhone = (phone) => {
  if (!phone) return null;

  const phoneRegex = /^\+?[\d\s-()]{10,}$/;
  if (!phoneRegex.test(phone)) {
    return "Please enter a valid phone number";
  }
  return null;
};

/**
 * Array validation
 */
export const validateArray = (array, fieldName, options = {}) => {
  const { minLength, maxLength, required = true } = options;

  if (!array || !Array.isArray(array)) {
    return required ? `${fieldName} is required` : null;
  }

  if (minLength !== undefined && array.length < minLength) {
    return `${fieldName} must have at least ${minLength} items`;
  }

  if (maxLength !== undefined && array.length > maxLength) {
    return `${fieldName} must have at most ${maxLength} items`;
  }

  return null;
};

/**
 * File validation
 */
export const validateFile = (file, options = {}) => {
  const {
    allowedTypes = ["image/jpeg", "image/png", "image/webp"],
    maxSize = 5 * 1024 * 1024, // 5MB
    required = true,
  } = options;

  if (!file) {
    return required ? "File is required" : null;
  }

  if (!allowedTypes.includes(file.type)) {
    return `File type not allowed. Allowed types: ${allowedTypes.join(", ")}`;
  }

  if (file.size > maxSize) {
    const maxSizeMB = maxSize / (1024 * 1024);
    return `File size must be less than ${maxSizeMB}MB`;
  }

  return null;
};

/**
 * Recipe title validation
 */
export const validateRecipeTitle = (title) => {
  if (!title) return "Recipe title is required";
  if (title.length < 3)
    return "Recipe title must be at least 3 characters long";
  if (title.length > 100)
    return "Recipe title must be less than 100 characters";
  return null;
};

/**
 * Recipe description validation
 */
export const validateRecipeDescription = (description) => {
  if (!description) return null;
  if (description.length > 500)
    return "Description must be less than 500 characters";
  return null;
};

/**
 * Recipe ingredients validation
 */
export const validateIngredients = (ingredients) => {
  return validateArray(ingredients, "Ingredients", { minLength: 1 });
};

/**
 * Recipe instructions validation
 */
export const validateInstructions = (instructions) => {
  return validateArray(instructions, "Instructions", { minLength: 1 });
};

/**
 * Form validator that combines multiple validations
 */
export const createValidator = (validations) => {
  return (values) => {
    const errors = {};

    Object.keys(validations).forEach((field) => {
      const validation = validations[field];
      const value = values[field];

      if (typeof validation === "function") {
        const error = validation(value, values);
        if (error) errors[field] = error;
      } else if (Array.isArray(validation)) {
        for (const validate of validation) {
          const error = validate(value, values);
          if (error) {
            errors[field] = error;
            break;
          }
        }
      }
    });

    return errors;
  };
};

export default {
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  validateName,
  validateRequired,
  validateNumber,
  validateAge,
  validateHeight,
  validateWeight,
  validateURL,
  validatePhone,
  validateArray,
  validateFile,
  validateRecipeTitle,
  validateRecipeDescription,
  validateIngredients,
  validateInstructions,
  createValidator,
};
