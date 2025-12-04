import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create axios instance with default config for your backend
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Create axios instance for direct Spoonacular API
const spoonacularApi = axios.create({
  baseURL: 'https://api.spoonacular.com',
  timeout: 10000,
  params: {
    apiKey: import.meta.env.VITE_SPOONACULAR_API_KEY
  }
});

// Request interceptor to add auth token to your backend API
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors for your backend API
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    } else if (error.response?.status === 403) {
      console.error("Access denied:", error.response.data);
    } else if (error.response?.status === 500) {
      console.error("Server error:", error.response.data);
    }
    return Promise.reject(error);
  }
);

// Generic API methods (your existing service)
export const apiService = {
  get: (url, config = {}) => api.get(url, config),
  post: (url, data, config = {}) => api.post(url, data, config),
  put: (url, data, config = {}) => api.put(url, data, config),
  patch: (url, data, config = {}) => api.patch(url, data, config),
  delete: (url, config = {}) => api.delete(url, config),
  upload: (url, formData, onUploadProgress = null) => {
    return api.post(url, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress,
    });
  },
};

// Your MongoDB Recipes API
export const recipesAPI = {
  getRecipes: (params = {}) => api.get('/recipes', { params }),
  getRecipe: (id) => api.get(`/recipes/${id}`),
  createRecipe: (recipeData) => api.post('/recipes', recipeData),
  updateRecipe: (id, recipeData) => api.put(`/recipes/${id}`, recipeData),
  deleteRecipe: (id) => api.delete(`/recipes/${id}`),
  uploadRecipeImage: (id, imageFile, onUploadProgress = null) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    return apiService.upload(`/recipes/${id}/image`, formData, onUploadProgress);
  },
};

// Nutrition API
export const nutritionAPI = {
  getTodaysNutrition: () => api.get('/nutrition/today'),
  logMeal: (mealData) => api.post('/nutrition/log-meal', mealData),
  getNutritionByDates: (dates) => api.get('/nutrition/by-dates', { params: { dates } }),
  getWeeklyProgress: (startDate) => api.get('/nutrition/weekly-progress', { params: { startDate } }),
  updateWaterIntake: (amount) => api.put('/nutrition/water-intake', { amount }),
};

// Spoonacular External Recipes API
export const spoonacularAPI = {
  // Via your backend (recommended)
  getRecipes: (params = {}) => api.get('/spoonacular/recipes', { params }),
  getRecipe: (id) => api.get(`/spoonacular/recipes/${id}`),
  getRecipesByIngredients: (ingredients, number = 12) =>
    api.get('/spoonacular/recipes/by-ingredients', {
      params: { ingredients, number }
    }),
  getSimilarRecipes: (id, number = 6) =>
    api.get(`/spoonacular/recipes/${id}/similar`, {
      params: { number }
    }),

  // Direct API calls
  direct: {
    getRandomRecipes: (number = 10) =>
      spoonacularApi.get(`/recipes/random?number=${number}`),
    searchRecipes: (query, number = 12, params = {}) =>
      spoonacularApi.get(`/recipes/complexSearch`, {
        params: { query, number, addRecipeInformation: true, ...params }
      }),
    getRecipeById: (id) =>
      spoonacularApi.get(`/recipes/${id}/information`),
    getSimilarRecipes: (id, number = 6) =>
      spoonacularApi.get(`/recipes/${id}/similar`, { params: { number } }),
  }
};

export default api;