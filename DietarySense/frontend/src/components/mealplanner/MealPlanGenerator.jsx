import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
  Badge,
} from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";
import WeeklyMealPlan from "./WeeklyMealPlan";

const MealPlanGenerator = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState({
    duration: 7,
    dietaryPreference: user?.profile?.dietaryPreference || "",
    excludedIngredients: [],
    maxPrepTime: 60,
    maxCookTime: 60,
    cuisine: [],
  });
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showGeneratedPlan, setShowGeneratedPlan] = useState(false);

  const cuisineOptions = [
    "Italian",
    "Mexican",
    "Asian",
    "Indian",
    "Mediterranean",
    "American",
  ];
  const ingredientOptions = [
    "Dairy",
    "Nuts",
    "Gluten",
    "Shellfish",
    "Eggs",
    "Soy",
  ];

  // Mock data for testing
  const mockMealPlanData = {
    id: "mock-plan-1",
    duration: 7,
    startDate: new Date().toISOString().split('T')[0],
    meals: [
      {
        day: "Monday",
        date: new Date().toISOString().split('T')[0],
        meals: {
          breakfast: {
            name: "Oatmeal with Berries",
            calories: 350,
            protein: 12,
            carbs: 60,
            fats: 8,
            prepTime: 10,
            cookTime: 5,
            ingredients: ["oats", "mixed berries", "almond milk", "honey"]
          },
          lunch: {
            name: "Quinoa Salad",
            calories: 450,
            protein: 15,
            carbs: 55,
            fats: 18,
            prepTime: 15,
            cookTime: 0,
            ingredients: ["quinoa", "cherry tomatoes", "cucumber", "feta cheese", "olive oil"]
          },
          dinner: {
            name: "Grilled Chicken with Vegetables",
            calories: 550,
            protein: 35,
            carbs: 40,
            fats: 22,
            prepTime: 20,
            cookTime: 25,
            ingredients: ["chicken breast", "bell peppers", "broccoli", "olive oil", "garlic"]
          }
        }
      }
      // ... more days can be added here
    ],
    nutritionSummary: {
      totalCalories: 2450,
      totalProtein: 125,
      totalCarbs: 280,
      totalFats: 98
    }
  };

  useEffect(() => {
    if (user?.profile) {
      setPreferences((prev) => ({
        ...prev,
        dietaryPreference: user.profile.dietaryPreference || "",
        excludedIngredients: user.profile.allergies || [],
      }));
    }
  }, [user]);

  const handlePreferenceChange = (key, value) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleArrayToggle = (key, value) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((item) => item !== value)
        : [...prev[key], value],
    }));
  };

  const generateMealPlan = async () => {
    if (!user?.profile?.dailyCalories) {
      setError("Please complete your profile with calorie targets first.");
      return;
    }

    // Check if user is authenticated
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please log in again.");
      return;
    }

    setLoading(true);
    setError("");

    // For testing - comment this out when backend is ready
    console.log("Using mock data for testing");
    setTimeout(() => {
      setGeneratedPlan(mockMealPlanData);
      setShowGeneratedPlan(true);
      setLoading(false);
    }, 1500);
    return;
    // End of mock data - remove the above lines when backend is ready

    try {
      console.log("Sending request to backend with preferences:", preferences);

      const response = await fetch(
        "http://localhost:5000/api/mealplans/generate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            duration: preferences.duration,
            preferences: {
              dietaryPreference: preferences.dietaryPreference,
              excludedIngredients: preferences.excludedIngredients,
              cuisine: preferences.cuisine,
              maxPrepTime: preferences.maxPrepTime,
              maxCookTime: preferences.maxCookTime,
            },
          }),
        }
      );

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Received data:", data);

      setGeneratedPlan(data.data);
      setShowGeneratedPlan(true);
    } catch (err) {
      console.error("Meal plan generation error:", err);
      setError(err.message || "Failed to generate meal plan. Please check if the server is running.");
    } finally {
      setLoading(false);
    }
  };

  const saveMealPlan = async () => {
    if (!generatedPlan) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/mealplans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(generatedPlan),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to save meal plan");
      }

      alert("Meal plan saved successfully!");
    } catch (err) {
      console.error("Save meal plan error:", err);
      setError(err.message || "Failed to save meal plan");
    } finally {
      setLoading(false);
    }
  };

  if (showGeneratedPlan && generatedPlan) {
    return (
      <Container className="my-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Your Generated Meal Plan</h2>
          <div>
            <Button
              variant="outline-secondary"
              onClick={() => setShowGeneratedPlan(false)}
              className="me-2"
            >
              ← Back to Generator
            </Button>
            <Button variant="success" onClick={saveMealPlan} disabled={loading}>
              {loading ? "Saving..." : "Save This Plan"}
            </Button>
          </div>
        </div>
        <WeeklyMealPlan mealPlan={generatedPlan} />
      </Container>
    );
  }

  return (
    <Container className="my-4">
      <Row className="justify-content-center">
        <Col lg={10}>
          <Card className="border-0 shadow">
            <Card.Header className="bg-primary text-white py-3">
              <h2 className="mb-0">Generate Your Meal Plan</h2>
            </Card.Header>
            <Card.Body className="p-4">
              {error && (
                <Alert variant="danger" className="mb-4">
                  {error}
                </Alert>
              )}

              <Row>
                <Col md={6}>
                  {/* Basic Settings */}
                  <Card className="border-0 bg-light mb-4">
                    <Card.Body>
                      <h5 className="mb-3">Basic Settings</h5>

                      <Form.Group className="mb-3">
                        <Form.Label>Plan Duration</Form.Label>
                        <Form.Select
                          value={preferences.duration}
                          onChange={(e) =>
                            handlePreferenceChange(
                              "duration",
                              parseInt(e.target.value)
                            )
                          }
                        >
                          <option value={3}>3 Days</option>
                          <option value={7}>7 Days</option>
                          <option value={14}>14 Days</option>
                          <option value={30}>30 Days</option>
                        </Form.Select>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Dietary Preference</Form.Label>
                        <Form.Select
                          value={preferences.dietaryPreference}
                          onChange={(e) =>
                            handlePreferenceChange(
                              "dietaryPreference",
                              e.target.value
                            )
                          }
                        >
                          <option value="">No Preference</option>
                          <option value="vegetarian">Vegetarian</option>
                          <option value="vegan">Vegan</option>
                          <option value="gluten-free">Gluten-Free</option>
                          <option value="non-vegetarian">Non-Vegetarian</option>
                        </Form.Select>
                      </Form.Group>
                    </Card.Body>
                  </Card>

                  {/* Time Constraints */}
                  <Card className="border-0 bg-light mb-4">
                    <Card.Body>
                      <h5 className="mb-3">Time Constraints</h5>

                      <Form.Group className="mb-3">
                        <Form.Label>
                          Max Preparation Time: {preferences.maxPrepTime}{" "}
                          minutes
                        </Form.Label>
                        <Form.Range
                          min="10"
                          max="120"
                          step="5"
                          value={preferences.maxPrepTime}
                          onChange={(e) =>
                            handlePreferenceChange(
                              "maxPrepTime",
                              parseInt(e.target.value)
                            )
                          }
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>
                          Max Cooking Time: {preferences.maxCookTime} minutes
                        </Form.Label>
                        <Form.Range
                          min="10"
                          max="120"
                          step="5"
                          value={preferences.maxCookTime}
                          onChange={(e) =>
                            handlePreferenceChange(
                              "maxCookTime",
                              parseInt(e.target.value)
                            )
                          }
                        />
                      </Form.Group>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6}>
                  {/* Cuisine Preferences */}
                  <Card className="border-0 bg-light mb-4">
                    <Card.Body>
                      <h5 className="mb-3">Cuisine Preferences</h5>
                      <p className="text-muted small mb-3">
                        Select your preferred cuisines
                      </p>
                      <div className="d-flex flex-wrap gap-2">
                        {cuisineOptions.map((cuisine) => (
                          <Badge
                            key={cuisine}
                            bg={
                              preferences.cuisine.includes(cuisine)
                                ? "primary"
                                : "outline-primary"
                            }
                            style={{ cursor: "pointer" }}
                            onClick={() =>
                              handleArrayToggle("cuisine", cuisine)
                            }
                            className="p-2"
                          >
                            {cuisine}
                          </Badge>
                        ))}
                      </div>
                    </Card.Body>
                  </Card>

                  {/* Exclude Ingredients */}
                  <Card className="border-0 bg-light mb-4">
                    <Card.Body>
                      <h5 className="mb-3">Exclude Ingredients</h5>
                      <p className="text-muted small mb-3">
                        Select ingredients to exclude (allergies, dislikes)
                      </p>
                      <div className="d-flex flex-wrap gap-2">
                        {ingredientOptions.map((ingredient) => (
                          <Badge
                            key={ingredient}
                            bg={
                              preferences.excludedIngredients.includes(
                                ingredient.toLowerCase()
                              )
                                ? "danger"
                                : "outline-danger"
                            }
                            style={{ cursor: "pointer" }}
                            onClick={() =>
                              handleArrayToggle(
                                "excludedIngredients",
                                ingredient.toLowerCase()
                              )
                            }
                            className="p-2"
                          >
                            {ingredient}
                          </Badge>
                        ))}
                      </div>
                    </Card.Body>
                  </Card>

                  {/* Nutrition Summary */}
                  <Card className="border-0 bg-info text-white">
                    <Card.Body>
                      <h5 className="mb-3">Your Nutrition Targets</h5>
                      <Row className="text-center">
                        <Col xs={6} className="mb-2">
                          <div className="h4 mb-1">
                            {user?.profile?.dailyCalories || "--"}
                          </div>
                          <small>Daily Calories</small>
                        </Col>
                        <Col xs={6} className="mb-2">
                          <div className="h4 mb-1">
                            {user?.profile?.protein || "--"}g
                          </div>
                          <small>Protein</small>
                        </Col>
                        <Col xs={6}>
                          <div className="h4 mb-1">
                            {user?.profile?.carbs || "--"}g
                          </div>
                          <small>Carbs</small>
                        </Col>
                        <Col xs={6}>
                          <div className="h4 mb-1">
                            {user?.profile?.fats || "--"}g
                          </div>
                          <small>Fats</small>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <div className="text-center mt-4">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={generateMealPlan}
                  disabled={loading || !user?.profile?.dailyCalories}
                  className="px-5"
                >
                  {loading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Generating Plan...
                    </>
                  ) : (
                    "Generate Meal Plan"
                  )}
                </Button>

                {!user?.profile?.dailyCalories && (
                  <Alert variant="warning" className="mt-3">
                    Please complete your profile with calorie targets to generate a meal plan.
                  </Alert>
                )}

                {/* Debug info - remove in production */}
                <div className="mt-3">
                  <small className="text-muted">
                    Debug: Using mock data for testing. Check console for details.
                  </small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default MealPlanGenerator;