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

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/mealplans/generate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
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

      if (!response.ok) {
        throw new Error("Failed to generate meal plan");
      }

      const data = await response.json();
      setGeneratedPlan(data.data);
      setShowGeneratedPlan(true);
    } catch (err) {
      setError(err.message || "Failed to generate meal plan");
    } finally {
      setLoading(false);
    }
  };

  const saveMealPlan = async () => {
    if (!generatedPlan) return;

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/mealplans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(generatedPlan),
      });

      if (!response.ok) {
        throw new Error("Failed to save meal plan");
      }

      alert("Meal plan saved successfully!");
    } catch (err) {
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
                    Please complete your profile with calorie targets to
                    generate a meal plan.
                  </Alert>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default MealPlanGenerator;
