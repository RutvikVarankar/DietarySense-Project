import { useState, useEffect } from "react";

export const useRecipes = (filters = {}) => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRecipes();
  }, [filters]);

  const fetchRecipes = async () => {
    setLoading(true);
    setError("");

    try {
      const queryParams = new URLSearchParams(filters);
      const response = await fetch(
        `http://localhost:5000/api/recipes?${queryParams}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch recipes");
      }

      const data = await response.json();
      setRecipes(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createRecipe = async (recipeData) => {
    const token = localStorage.getItem("token");
    const response = await fetch("http://localhost:5000/api/recipes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(recipeData),
    });

    if (!response.ok) {
      throw new Error("Failed to create recipe");
    }

    const data = await response.json();
    setRecipes((prev) => [data.data, ...prev]);
    return data;
  };

  const updateRecipe = async (recipeId, recipeData) => {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `http://localhost:5000/api/recipes/${recipeId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(recipeData),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update recipe");
    }

    const data = await response.json();
    setRecipes((prev) =>
      prev.map((recipe) => (recipe._id === recipeId ? data.data : recipe))
    );
    return data;
  };

  const deleteRecipe = async (recipeId) => {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `http://localhost:5000/api/recipes/${recipeId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete recipe");
    }

    setRecipes((prev) => prev.filter((recipe) => recipe._id !== recipeId));
  };

  return {
    recipes,
    loading,
    error,
    fetchRecipes,
    createRecipe,
    updateRecipe,
    deleteRecipe,
  };
};
