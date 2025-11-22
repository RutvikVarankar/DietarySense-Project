import React, { createContext, useState, useContext } from "react";

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [selectedMealPlan, setSelectedMealPlan] = useState(null);
  const [groceryList, setGroceryList] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const addToFavorites = (recipe) => {
    setFavorites((prev) => [...prev, recipe]);
  };

  const removeFromFavorites = (recipeId) => {
    setFavorites((prev) => prev.filter((recipe) => recipe._id !== recipeId));
  };

  const addNotification = (notification) => {
    setNotifications((prev) => [notification, ...prev]);
  };

  const removeNotification = (notificationId) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const value = {
    selectedMealPlan,
    setSelectedMealPlan,
    groceryList,
    setGroceryList,
    favorites,
    addToFavorites,
    removeFromFavorites,
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
