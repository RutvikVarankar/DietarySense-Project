import { useState, useEffect } from "react";

export const useMealPlan = () => {
  const [mealPlans, setMealPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchMealPlans = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/mealplans", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch meal plans");
      }

      const data = await response.json();
      setMealPlans(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateMealPlan = async (preferences) => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:5000/api/mealplans/generate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(preferences),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate meal plan");
      }

      const data = await response.json();
      return data.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createMealPlan = async (mealPlanData) => {
    const token = localStorage.getItem("token");
    const response = await fetch("http://localhost:5000/api/mealplans", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(mealPlanData),
    });

    if (!response.ok) {
      throw new Error("Failed to create meal plan");
    }

    const data = await response.json();
    setMealPlans((prev) => [data.data, ...prev]);
    return data;
  };

  const updateMealPlan = async (mealPlanId, updates) => {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `http://localhost:5000/api/mealplans/${mealPlanId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update meal plan");
    }

    const data = await response.json();
    setMealPlans((prev) =>
      prev.map((plan) => (plan._id === mealPlanId ? data.data : plan))
    );
    return data;
  };

  const deleteMealPlan = async (mealPlanId) => {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `http://localhost:5000/api/mealplans/${mealPlanId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete meal plan");
    }

    setMealPlans((prev) => prev.filter((plan) => plan._id !== mealPlanId));
  };

  useEffect(() => {
    fetchMealPlans();
  }, []);

  return {
    mealPlans,
    loading,
    error,
    generateMealPlan,
    createMealPlan,
    updateMealPlan,
    deleteMealPlan,
    refetch: fetchMealPlans,
  };
};
