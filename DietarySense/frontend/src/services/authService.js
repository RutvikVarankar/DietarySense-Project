import { apiService } from "./api";

const AUTH_ENDPOINTS = {
  REGISTER: "/auth/register",
  LOGIN: "/auth/login",
  LOGOUT: "/auth/logout",
  ME: "/auth/me",
  ONBOARDING: "/auth/onboarding",
  REFRESH_TOKEN: "/auth/refresh",
  FORGOT_PASSWORD: "/auth/forgot-password",
  RESET_PASSWORD: "/auth/reset-password",
};

export const authService = {
  // Register new user
  register: async (userData) => {
    const response = await apiService.post(AUTH_ENDPOINTS.REGISTER, userData);
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await apiService.post(AUTH_ENDPOINTS.LOGIN, credentials);
    return response.data;
  },

  // Logout user
  logout: async () => {
    const response = await apiService.get(AUTH_ENDPOINTS.LOGOUT);
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await apiService.get(AUTH_ENDPOINTS.ME);
    return response.data;
  },

  // Complete onboarding
  completeOnboarding: async (profileData) => {
    const response = await apiService.post(
      AUTH_ENDPOINTS.ONBOARDING,
      profileData
    );
    return response.data;
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await apiService.put("/users/profile", profileData);
    return response.data;
  },

  // Calculate calories
  calculateCalories: async (userData) => {
    const response = await apiService.post(
      "/users/calculate-calories",
      userData
    );
    return response.data;
  },

  // Forgot password
  forgotPassword: async (email) => {
    const response = await apiService.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, {
      email,
    });
    return response.data;
  },

  // Reset password
  resetPassword: async (token, newPassword) => {
    const response = await apiService.post(AUTH_ENDPOINTS.RESET_PASSWORD, {
      token,
      newPassword,
    });
    return response.data;
  },

  // Refresh token
  refreshToken: async () => {
    const response = await apiService.post(AUTH_ENDPOINTS.REFRESH_TOKEN);
    return response.data;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },

  // Get stored token
  getToken: () => {
    return localStorage.getItem("token");
  },

  // Store token
  setToken: (token) => {
    localStorage.setItem("token", token);
  },

  // Remove token
  removeToken: () => {
    localStorage.removeItem("token");
  },
};

export default authService;
