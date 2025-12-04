import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';

const RecipeContext = createContext();

export const useRecipe = () => {
  const context = useContext(RecipeContext);
  if (!context) {
    throw new Error('useRecipe must be used within a RecipeProvider');
  }
  return context;
};

export const RecipeProvider = ({ children }) => {
  const [recipes, setRecipes] = useState([]);
  const [currentRecipe, setCurrentRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all recipes
  const fetchRecipes = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.get('/recipes', { params });
      setRecipes(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch recipes');
      console.error('Error fetching recipes:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch single recipe
  const fetchRecipeById = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.get(`/recipes/${id}`);
      setCurrentRecipe(response.data.data);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch recipe');
      console.error('Error fetching recipe:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create new recipe
  const createRecipe = async (recipeData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.post('/recipes', recipeData);
      setRecipes(prev => [response.data.data, ...prev]);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create recipe');
      console.error('Error creating recipe:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update recipe
  const updateRecipe = async (id, recipeData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.put(`/recipes/${id}`, recipeData);
      setRecipes(prev => 
        prev.map(recipe => recipe._id === id ? response.data.data : recipe)
      );
      if (currentRecipe && currentRecipe._id === id) {
        setCurrentRecipe(response.data.data);
      }
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update recipe');
      console.error('Error updating recipe:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete recipe
  const deleteRecipe = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await apiService.delete(`/recipes/${id}`);
      setRecipes(prev => prev.filter(recipe => recipe._id !== id));
      if (currentRecipe && currentRecipe._id === id) {
        setCurrentRecipe(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete recipe');
      console.error('Error deleting recipe:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Upload recipe image
  const uploadRecipeImage = async (id, imageFile) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      
      const response = await apiService.upload(`/recipes/${id}/image`, formData);
      
      // Update the current recipe if it's the one being viewed
      if (currentRecipe && currentRecipe._id === id) {
        setCurrentRecipe(prev => ({
          ...prev,
          image: response.data.data.image
        }));
      }
      
      // Update in recipes list
      setRecipes(prev => 
        prev.map(recipe => 
          recipe._id === id 
            ? { ...recipe, image: response.data.data.image }
            : recipe
        )
      );
      
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload image');
      console.error('Error uploading image:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Clear error
  const clearError = () => setError(null);

  // Clear current recipe
  const clearCurrentRecipe = () => setCurrentRecipe(null);

  const value = {
    recipes,
    currentRecipe,
    loading,
    error,
    fetchRecipes,
    fetchRecipeById,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    uploadRecipeImage,
    clearError,
    clearCurrentRecipe,
    setCurrentRecipe,
  };

  return (
    <RecipeContext.Provider value={value}>
      {children}
    </RecipeContext.Provider>
  );
};