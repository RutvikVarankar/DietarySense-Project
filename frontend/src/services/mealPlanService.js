import { apiService } from "./api";

const MEAL_PLAN_ENDPOINTS = {
  MEAL_PLANS: "/mealplans",
  GENERATE: "/mealplans/generate",
  GROCERY_LIST: "/grocery-list",
};

export const mealPlanService = {
  // Generate meal plan
  generateMealPlan: async (preferences) => {
    const response = await apiService.post(
      MEAL_PLAN_ENDPOINTS.GENERATE,
      preferences
    );
    return response.data;
  },

  // Get user meal plans
  getMealPlans: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await apiService.get(
      `${MEAL_PLAN_ENDPOINTS.MEAL_PLANS}?${params}`
    );
    return response.data;
  },

  // Get single meal plan
  getMealPlan: async (id) => {
    const response = await apiService.get(
      `${MEAL_PLAN_ENDPOINTS.MEAL_PLANS}/${id}`
    );
    return response.data;
  },

  // Create meal plan
  createMealPlan: async (mealPlanData) => {
    const response = await apiService.post(
      MEAL_PLAN_ENDPOINTS.MEAL_PLANS,
      mealPlanData
    );
    return response.data;
  },

  // Update meal plan
  updateMealPlan: async (id, mealPlanData) => {
    const response = await apiService.put(
      `${MEAL_PLAN_ENDPOINTS.MEAL_PLANS}/${id}`,
      mealPlanData
    );
    return response.data;
  },

  // Delete meal plan
  deleteMealPlan: async (id) => {
    const response = await apiService.delete(
      `${MEAL_PLAN_ENDPOINTS.MEAL_PLANS}/${id}`
    );
    return response.data;
  },

  // Get grocery list for meal plan
  getGroceryList: async (mealPlanId) => {
    const response = await apiService.get(
      `${MEAL_PLAN_ENDPOINTS.MEAL_PLANS}/${mealPlanId}${MEAL_PLAN_ENDPOINTS.GROCERY_LIST}`
    );
    return response.data;
  },

  // Mark meal as consumed
  markMealAsConsumed: async (mealPlanId, dayIndex, mealType, mealIndex) => {
    const response = await apiService.put(
      `${MEAL_PLAN_ENDPOINTS.MEAL_PLANS}/${mealPlanId}/days/${dayIndex}/meals/${mealType}/${mealIndex}/consume`
    );
    return response.data;
  },

  // Add meal feedback
  addMealFeedback: async (
    mealPlanId,
    dayIndex,
    mealType,
    mealIndex,
    feedback
  ) => {
    const response = await apiService.put(
      `${MEAL_PLAN_ENDPOINTS.MEAL_PLANS}/${mealPlanId}/days/${dayIndex}/meals/${mealType}/${mealIndex}/feedback`,
      feedback
    );
    return response.data;
  },

  // Get active meal plans
  getActiveMealPlans: async () => {
    const response = await apiService.get(
      `${MEAL_PLAN_ENDPOINTS.MEAL_PLANS}?status=active`
    );
    return response.data;
  },

  // Get completed meal plans
  getCompletedMealPlans: async () => {
    const response = await apiService.get(
      `${MEAL_PLAN_ENDPOINTS.MEAL_PLANS}?status=completed`
    );
    return response.data;
  },

  // Duplicate meal plan
  duplicateMealPlan: async (id) => {
    const mealPlan = await mealPlanService.getMealPlan(id);
    const newMealPlan = {
      ...mealPlan.data,
      title: `${mealPlan.data.title} (Copy)`,
      _id: undefined,
    };
    return await mealPlanService.createMealPlan(newMealPlan);
  },
};

export default mealPlanService;
