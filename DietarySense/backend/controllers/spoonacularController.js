const axios = require('axios');
const Recipe = require('../models/Recipe');
const { asyncHandler } = require('../middleware/errorMiddleware');

const API_KEY = process.env.SPOONACULAR_API_KEY;
const BASE_URL = 'https://api.spoonacular.com';

// @desc    Get recipes from Spoonacular or fallback to local recipes
// @route   GET /api/spoonacular/recipes
// @access  Public
const getSpoonacularRecipes = asyncHandler(async (req, res) => {
  // Check if API key is configured
  if (!API_KEY || API_KEY === 'your_spoonacular_api_key_here') {
    // Fallback to local recipes
    try {
      const {
        search,
        number = 12,
        diet,
        intolerances,
        type,
        maxReadyTime,
        cuisine
      } = req.query;

      // Build filter object for local recipes
      const filter = { isApproved: true };

      // Search in title and description
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ];
      }

      // Map dietary tags to local recipe filters
      if (diet) {
        const diets = diet.split(',');
        filter.dietaryTags = { $in: diets };
      }

      // Max ready time (combine prep and cook time)
      if (maxReadyTime) {
        filter.$or = [
          { prepTime: { $lte: parseInt(maxReadyTime) } },
          { cookTime: { $lte: parseInt(maxReadyTime) } }
        ];
      }

      const recipes = await Recipe.find(filter)
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 })
        .limit(parseInt(number));

      // If no recipes found in database, return sample recipes
      if (recipes.length === 0) {
        const sampleRecipes = [
          {
            _id: "sample-1",
            title: "Oatmeal with Fresh Fruits",
            description: "A healthy and filling breakfast with oats and seasonal fruits",
            image: "https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=400",
            nutrition: { calories: 416, protein: 9, carbs: 82, fats: 5 },
            dietaryTags: ["vegetarian", "vegan", "gluten-free"],
            prepTime: 5,
            cookTime: 7,
            servings: 1,
            difficulty: "easy",
            cuisine: "International",
            createdBy: { name: "DietarySense", email: "admin@dietarysense.com" }
          },
          {
            _id: "sample-2",
            title: "Grilled Chicken Salad",
            description: "Protein-packed salad with grilled chicken and fresh vegetables",
            image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400",
            nutrition: { calories: 425, protein: 50, carbs: 12, fats: 19 },
            dietaryTags: ["high-protein", "low-carb"],
            prepTime: 10,
            cookTime: 15,
            servings: 1,
            difficulty: "easy",
            cuisine: "Mediterranean",
            createdBy: { name: "DietarySense", email: "admin@dietarysense.com" }
          },
          {
            _id: "sample-3",
            title: "Vegetable Stir Fry",
            description: "Quick and healthy vegetable stir fry with tofu",
            image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400",
            nutrition: { calories: 321, protein: 28, carbs: 32, fats: 11 },
            dietaryTags: ["vegetarian", "vegan", "high-protein"],
            prepTime: 15,
            cookTime: 10,
            servings: 2,
            difficulty: "medium",
            cuisine: "Asian",
            createdBy: { name: "DietarySense", email: "admin@dietarysense.com" }
          }
        ];

        return res.json({
          success: true,
          count: sampleRecipes.length,
          data: sampleRecipes,
          source: 'sample'
        });
      }

      return res.json({
        success: true,
        count: recipes.length,
        data: recipes,
        source: 'local'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch local recipes',
        error: error.message
      });
    }
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

    // Add optional filters
    if (diet) params.diet = diet;
    if (intolerances) params.intolerances = intolerances;
    if (type) params.type = type;
    if (maxReadyTime) params.maxReadyTime = parseInt(maxReadyTime);
    if (cuisine) params.cuisine = cuisine;
  } else {
    url = `${BASE_URL}/recipes/random`;
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
    res.status(500).json({
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

  const response = await axios.get(`${BASE_URL}/recipes/${id}/information`, {
    params: { apiKey: API_KEY }
  });

  res.json({
    success: true,
    data: response.data,
    source: 'spoonacular'
  });
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

  const response = await axios.get(`${BASE_URL}/recipes/findByIngredients`, {
    params: {
      apiKey: API_KEY,
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
});

// @desc    Get similar recipes
// @route   GET /api/spoonacular/recipes/:id/similar
// @access  Public
const getSimilarRecipes = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { number = 6 } = req.query;

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
});

module.exports = {
  getSpoonacularRecipes,
  getSpoonacularRecipe,
  getRecipesByIngredients,
  getSimilarRecipes
};
