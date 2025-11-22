import React from "react";

// This file is now integrated into App.jsx
// Keeping it for future route configuration if needed

export const routePaths = {
  // Public routes
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",

  // Protected routes
  DASHBOARD: "/dashboard",
  ONBOARDING: "/onboarding",
  RECIPES: "/recipes",
  RECIPE_DETAIL: "/recipes/:id",
  MEAL_PLANNER: "/meal-planner",
  GROCERY_LIST: "/grocery-list",

  // Admin routes
  ADMIN: "/admin",
  ADMIN_USERS: "/admin/users",
  ADMIN_RECIPES: "/admin/recipes",
  ADMIN_MEAL_PLANS: "/admin/meal-plans",
};

export const navigationRoutes = [
  {
    path: routePaths.DASHBOARD,
    label: "Dashboard",
    icon: "📊",
    description: "Your health overview",
    requiresAuth: true,
  },
  {
    path: routePaths.MEAL_PLANNER,
    label: "Meal Planner",
    icon: "📋",
    description: "Plan your meals",
    requiresAuth: true,
  },
  {
    path: routePaths.RECIPES,
    label: "Recipes",
    icon: "🍳",
    description: "Browse recipes",
    requiresAuth: true,
  },
  {
    path: routePaths.GROCERY_LIST,
    label: "Grocery List",
    icon: "🛒",
    description: "Shopping list",
    requiresAuth: true,
  },
];

export const adminRoutes = [
  {
    path: routePaths.ADMIN,
    label: "Dashboard",
    icon: "⚙️",
    description: "Admin overview",
    requiresAdmin: true,
  },
  {
    path: routePaths.ADMIN_USERS,
    label: "Users",
    icon: "👥",
    description: "Manage users",
    requiresAdmin: true,
  },
  {
    path: routePaths.ADMIN_RECIPES,
    label: "Recipes",
    icon: "🍳",
    description: "Manage recipes",
    requiresAdmin: true,
  },
];

export default {
  routePaths,
  navigationRoutes,
  adminRoutes,
};
