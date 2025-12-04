const axios = require('axios');
const Recipe = require('../models/Recipe');
const { asyncHandler } = require('../middleware/errorMiddleware');

const API_KEY = process.env.SPOONACULAR_API_KEY;
const BASE_URL = 'https://api.spoonacular.com';

// @desc    Get recipes from Spoonacular API
// @route   GET /api/spoonacular/recipes
// @access  Public
const getSpoonacularRecipes = asyncHandler(async (req, res) => {
  if (!API_KEY || API_KEY === 'your_spoonacular_api_key_here') {
    return res.status(500).json({
      success: false,
      message: 'Spoonacular API key not configured'
    });
  }

  const {
    search,
    number = 12,
    diet,
    intolerances,
    type,
    maxReadyTime,
    cuisine
  } = req.query;

  let url;
  let params = {
    apiKey: API_KEY,
    number: parseInt(number)
  };

  if (search) {
    url = `${BASE_URL}/recipes/complexSearch`;
    params.query = search;
    params.addRecipeInformation = true;
    params.includeNutrition = true;

    // Add optional filters
    if (diet) params.diet = diet;
    if (intolerances) params.intolerances = intolerances;
    if (type) params.type = type;
    if (maxReadyTime) params.maxReadyTime = parseInt(maxReadyTime);
    if (cuisine) params.cuisine = cuisine;
  } else {
    url = `${BASE_URL}/recipes/random`;
    params.includeNutrition = true;
  }

  try {
    const response = await axios.get(url, { params });
    const recipes = search ? response.data.results : response.data.recipes;

    res.json({
      success: true,
      count: recipes.length,
      data: recipes,
      source: 'spoonacular'
    });
  } catch (error) {
    console.error('Spoonacular API Error:', error.response?.data || error.message);

    // Check if it's a rate limit error
    if (error.response?.status === 402 || error.response?.data?.message?.includes('points limit')) {
      console.log('Spoonacular API limit reached, falling back to sample recipes');

      // Return sample recipes when API limit is reached
      const sampleRecipes = [
        {
          id: 1001,
          title: "Grilled Chicken Salad",
          image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400",
          summary: "A healthy and protein-packed grilled chicken salad perfect for lunch or dinner.",
          servings: 2,
          readyInMinutes: 25,
          nutrition: {
            nutrients: [
              { name: "Calories", amount: 425, unit: "kcal" },
              { name: "Protein", amount: 50, unit: "g" },
              { name: "Carbohydrates", amount: 12, unit: "g" },
              { name: "Fat", amount: 19, unit: "g" }
            ]
          },
          diets: ["high-protein", "low-carb"],
          vegetarian: false,
          vegan: false,
          glutenFree: true,
          dairyFree: true
        },
        {
          id: 1002,
          title: "Vegetable Stir Fry",
          image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400",
          summary: "Quick and healthy vegetable stir fry with tofu and fresh vegetables.",
          servings: 4,
          readyInMinutes: 20,
          nutrition: {
            nutrients: [
              { name: "Calories", amount: 321, unit: "kcal" },
              { name: "Protein", amount: 28, unit: "g" },
              { name: "Carbohydrates", amount: 32, unit: "g" },
              { name: "Fat", amount: 11, unit: "g" }
            ]
          },
          diets: ["vegetarian", "vegan", "high-protein"],
          vegetarian: true,
          vegan: true,
          glutenFree: true,
          dairyFree: true
        },
        {
          id: 1003,
          title: "Oatmeal with Fresh Fruits",
          image: "https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=400",
          summary: "A nutritious breakfast with oats, fresh fruits, and nuts.",
          servings: 1,
          readyInMinutes: 10,
          nutrition: {
            nutrients: [
              { name: "Calories", amount: 416, unit: "kcal" },
              { name: "Protein", amount: 9, unit: "g" },
              { name: "Carbohydrates", amount: 82, unit: "g" },
              { name: "Fat", amount: 5, unit: "g" }
            ]
          },
          diets: ["vegetarian", "vegan", "gluten-free"],
          vegetarian: true,
          vegan: true,
          glutenFree: true,
          dairyFree: true
        },
        {
          id: 1004,
          title: "Salmon with Quinoa",
          image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400",
          summary: "Omega-3 rich salmon served with protein-packed quinoa and vegetables.",
          servings: 2,
          readyInMinutes: 30,
          nutrition: {
            nutrients: [
              { name: "Calories", amount: 512, unit: "kcal" },
              { name: "Protein", amount: 42, unit: "g" },
              { name: "Carbohydrates", amount: 35, unit: "g" },
              { name: "Fat", amount: 22, unit: "g" }
            ]
          },
          diets: ["high-protein", "gluten-free"],
          vegetarian: false,
          vegan: false,
          glutenFree: true,
          dairyFree: true
        },
        {
          id: 1005,
          title: "Greek Yogurt Parfait",
          image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400",
          summary: "Creamy Greek yogurt layered with fresh berries and crunchy granola.",
          servings: 1,
          readyInMinutes: 5,
          nutrition: {
            nutrients: [
              { name: "Calories", amount: 298, unit: "kcal" },
              { name: "Protein", amount: 22, unit: "g" },
              { name: "Carbohydrates", amount: 45, unit: "g" },
              { name: "Fat", amount: 8, unit: "g" }
            ]
          },
          diets: ["vegetarian", "gluten-free"],
          vegetarian: true,
          vegan: false,
          glutenFree: true,
          dairyFree: false
        },
        {
          id: 1006,
          title: "Turkey and Avocado Wrap",
          image: "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=400",
          summary: "Lean turkey breast wrapped with avocado, lettuce, and tomato in a whole wheat tortilla.",
          servings: 1,
          readyInMinutes: 10,
          nutrition: {
            nutrients: [
              { name: "Calories", amount: 387, unit: "kcal" },
              { name: "Protein", amount: 32, unit: "g" },
              { name: "Carbohydrates", amount: 28, unit: "g" },
              { name: "Fat", amount: 18, unit: "g" }
            ]
          },
          diets: ["high-protein"],
          vegetarian: false,
          vegan: false,
          glutenFree: false,
          dairyFree: true
        }
      ];

      // Return a subset based on the requested number
      const recipesToReturn = sampleRecipes.slice(0, parseInt(number) || 12);

      return res.json({
        success: true,
        count: recipesToReturn.length,
        data: recipesToReturn,
        source: 'sample',
        note: 'Spoonacular API daily limit reached - showing sample recipes'
      });
    }

    // For other errors, return the error
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch recipes from Spoonacular API',
      error: error.response?.data?.message || error.message
    });
  }
});

// @desc    Get recipe details from Spoonacular
// @route   GET /api/spoonacular/recipes/:id
// @access  Public
const getSpoonacularRecipe = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!API_KEY || API_KEY === 'your_spoonacular_api_key_here') {
    return res.status(500).json({
      success: false,
      message: 'Spoonacular API key not configured'
    });
  }

  try {
    // Get recipe information with nutrition data
    const recipeResponse = await axios.get(`${BASE_URL}/recipes/${id}/information`, {
      params: {
        apiKey: API_KEY,
        includeNutrition: true
      }
    });

    res.json({
      success: true,
      data: recipeResponse.data,
      source: 'spoonacular'
    });
  } catch (error) {
    console.error('Spoonacular API Error:', error.response?.data || error.message);

    // Check if it's a rate limit error
    if (error.response?.status === 402 || error.response?.data?.message?.includes('points limit')) {
      console.log('Spoonacular API limit reached for recipe details, falling back to sample data');

      // Return sample recipe data when API limit is reached
      const sampleRecipe = {
        id: parseInt(id),
        title: "Sample Healthy Recipe",
        image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400",
        summary: "This is a sample healthy recipe with detailed nutritional information. The Spoonacular API daily limit has been reached.",
        servings: 4,
        readyInMinutes: 30,
        nutrition: {
          nutrients: [
            { name: "Calories", amount: 350, unit: "kcal" },
            { name: "Protein", amount: 25, unit: "g" },
            { name: "Carbohydrates", amount: 30, unit: "g" },
            { name: "Fat", amount: 15, unit: "g" }
          ]
        },
        extendedIngredients: [
          { id: 1, original: "2 cups mixed vegetables", name: "mixed vegetables", amount: 2, unit: "cups" },
          { id: 2, original: "1 cup protein source (chicken, tofu, or beans)", name: "protein source", amount: 1, unit: "cup" },
          { id: 3, original: "2 tbsp olive oil", name: "olive oil", amount: 2, unit: "tbsp" },
          { id: 4, original: "1 tsp herbs and spices", name: "herbs and spices", amount: 1, unit: "tsp" }
        ],
        analyzedInstructions: [{
          steps: [
            { number: 1, step: "Prepare all ingredients by washing and chopping vegetables." },
            { number: 2, step: "Heat olive oil in a large pan over medium heat." },
            { number: 3, step: "Add vegetables and protein source to the pan." },
            { number: 4, step: "Season with herbs and spices, cook for 15-20 minutes." },
            { number: 5, step: "Serve hot with your favorite side dish." }
          ]
        }],
        diets: ["balanced"],
        vegetarian: false,
        vegan: false,
        glutenFree: true,
        dairyFree: true
      };

      return res.json({
        success: true,
        data: sampleRecipe,
        source: 'sample',
        note: 'Spoonacular API daily limit reached - showing sample recipe data'
      });
    }

    // For other errors, return the error
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch recipe details from Spoonacular API',
      error: error.response?.data?.message || error.message
    });
  }
});

// @desc    Search recipes by ingredients
// @route   GET /api/spoonacular/recipes/by-ingredients
// @access  Public
const getRecipesByIngredients = asyncHandler(async (req, res) => {
  const { ingredients, number = 12, ranking = 1 } = req.query;

  if (!ingredients) {
    return res.status(400).json({
      success: false,
      message: 'Ingredients parameter is required'
    });
  }

  try {
    const response = await axios.get(`${SPOONACULAR_BASE_URL}/recipes/findByIngredients`, {
      params: {
        apiKey: SPOONACULAR_API_KEY,
        ingredients,
        number: parseInt(number),
        ranking: parseInt(ranking),
        ignorePantry: true
      }
    });

    res.json({
      success: true,
      count: response.data.length,
      data: response.data,
      source: 'spoonacular'
    });
  } catch (error) {
    console.warn('Spoonacular API failed for ingredient search, attempting USDA fallback...');

    // Try USDA API as fallback - search for foods with those ingredients
    try {
      if (USDA_API_KEY && USDA_API_KEY !== 'your_usda_api_key_here') {
        console.log('Using USDA API for ingredient search');
        const usdaRecipes = await fetchUSDARecipes(ingredients, number);

        return res.json({
          success: true,
          count: usdaRecipes.length,
          data: usdaRecipes,
          source: 'usda',
          note: 'Using USDA API as Spoonacular API is unavailable'
        });
      }
    } catch (usdaError) {
      console.warn('USDA API also failed for ingredient search:', usdaError.message);
    }

    // Fallback to sample recipes
    const sampleRecipes = [
      {
        id: 1001,
        title: `Recipe with ${ingredients}`,
        image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400",
        summary: `A recipe containing ${ingredients}.`,
        usedIngredientCount: 1,
        missedIngredientCount: 2,
        likes: 0
      }
    ];

    return res.json({
      success: true,
      count: sampleRecipes.length,
      data: sampleRecipes,
      source: 'sample',
      note: 'Using sample data as APIs are unavailable'
    });
  }
});

// @desc    Get similar recipes
// @route   GET /api/spoonacular/recipes/:id/similar
// @access  Public
const getSimilarRecipes = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { number = 6 } = req.query;

  if (!API_KEY || API_KEY === 'your_spoonacular_api_key_here') {
    return res.status(500).json({
      success: false,
      message: 'Spoonacular API key not configured'
    });
  }

  try {
    const response = await axios.get(`${BASE_URL}/recipes/${id}/similar`, {
      params: {
        apiKey: API_KEY,
        number: parseInt(number)
      }
    });

    res.json({
      success: true,
      count: response.data.length,
      data: response.data,
      source: 'spoonacular'
    });
  } catch (error) {
    console.error('Spoonacular API Error:', error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch similar recipes',
      error: error.response?.data?.message || error.message
    });
  }
});

module.exports = {
  getSpoonacularRecipes,
  getSpoonacularRecipe,
  getRecipesByIngredients,
  getSimilarRecipes
};
