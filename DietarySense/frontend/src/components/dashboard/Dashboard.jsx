import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  ProgressBar,
  Alert,
  Spinner,
} from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";
import CalorieCalculator from "./CalorieCalculator";
import ProgressCharts from "./ProgressCharts";

const Dashboard = () => {
  const { user } = useAuth();
  const [todaysMeals, setTodaysMeals] = useState([]);
  const [nutritionProgress, setNutritionProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCalculator, setShowCalculator] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Simulate API calls - replace with actual endpoints
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock data - replace with actual API data
      const mockMeals = [
        {
          _id: "1",
          name: "Oatmeal with Fruits",
          type: "breakfast",
          calories: 350,
          protein: 12,
          carbs: 60,
          fats: 6,
        },
        {
          _id: "2",
          name: "Grilled Chicken Salad",
          type: "lunch",
          calories: 450,
          protein: 35,
          carbs: 20,
          fats: 25,
        },
        {
          _id: "3",
          name: "Protein Shake",
          type: "snack",
          calories: 200,
          protein: 25,
          carbs: 15,
          fats: 2,
        },
        {
          _id: "4",
          name: "Salmon with Vegetables",
          type: "dinner",
          calories: 500,
          protein: 40,
          carbs: 25,
          fats: 30,
        },
      ];

      const totalCalories = mockMeals.reduce(
        (sum, meal) => sum + meal.calories,
        0
      );
      const totalProtein = mockMeals.reduce(
        (sum, meal) => sum + meal.protein,
        0
      );
      const totalCarbs = mockMeals.reduce((sum, meal) => sum + meal.carbs, 0);
      const totalFats = mockMeals.reduce((sum, meal) => sum + meal.fats, 0);

      setTodaysMeals(mockMeals);
      setNutritionProgress({
        calories: {
          consumed: totalCalories,
          target: user?.profile?.dailyCalories || 2000,
        },
        protein: {
          consumed: totalProtein,
          target: user?.profile?.protein || 150,
        },
        carbs: { consumed: totalCarbs, target: user?.profile?.carbs || 250 },
        fats: { consumed: totalFats, target: user?.profile?.fats || 67 },
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = (consumed, target) => {
    return target > 0
      ? Math.min(Math.round((consumed / target) * 100), 100)
      : 0;
  };

  const getProgressVariant = (percentage) => {
    if (percentage >= 90) return "danger";
    if (percentage >= 70) return "warning";
    return "success";
  };

  const getMealTypeBadge = (type) => {
    const variants = {
      breakfast: "warning",
      lunch: "success",
      dinner: "primary",
      snack: "info",
    };
    return variants[type] || "secondary";
  };

  if (loading) {
    return (
      <Container className="my-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading your dashboard...</p>
      </Container>
    );
  }

  if (showCalculator) {
    return (
      <Container className="my-4">
        <Button
          variant="outline-primary"
          onClick={() => setShowCalculator(false)}
          className="mb-3"
        >
          ← Back to Dashboard
        </Button>
        <CalorieCalculator />
      </Container>
    );
  }

  return (
    <Container className="my-4">
      {/* Welcome Section */}
      <Row className="mb-4">
        <Col>
          <div className="bg-primary text-white rounded p-4">
            <h1 className="h3 mb-1">Welcome back, {user?.name}!</h1>
            <p className="mb-0 opacity-75">
              {user?.profile?.goal
                ? `Working towards: ${user.profile.goal.replace("_", " ")}`
                : "Complete your profile to get started"}
            </p>
          </div>
        </Col>
      </Row>

      {!user?.profile?.dailyCalories && (
        <Alert variant="warning" className="mb-4">
          <Alert.Heading>Complete Your Profile</Alert.Heading>
          <p>
            Set up your nutritional targets to get personalized meal
            recommendations.
          </p>
          <Button
            variant="outline-warning"
            onClick={() => setShowCalculator(true)}
          >
            Set Up Now
          </Button>
        </Alert>
      )}

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="text-center h-100 border-0 shadow-sm">
            <Card.Body>
              <div className="text-primary mb-2">
                <i className="fas fa-fire fa-2x"></i>
              </div>
              <Card.Title className="h4">
                {nutritionProgress?.calories.consumed || 0}
              </Card.Title>
              <Card.Text className="text-muted">Calories Today</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="text-center h-100 border-0 shadow-sm">
            <Card.Body>
              <div className="text-success mb-2">
                <i className="fas fa-utensils fa-2x"></i>
              </div>
              <Card.Title className="h4">{todaysMeals.length}</Card.Title>
              <Card.Text className="text-muted">Meals Today</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="text-center h-100 border-0 shadow-sm">
            <Card.Body>
              <div className="text-info mb-2">
                <i className="fas fa-bullseye fa-2x"></i>
              </div>
              <Card.Title className="h4">
                {getProgressPercentage(
                  nutritionProgress?.calories.consumed,
                  nutritionProgress?.calories.target
                )}
                %
              </Card.Title>
              <Card.Text className="text-muted">Goal Progress</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="text-center h-100 border-0 shadow-sm">
            <Card.Body>
              <div className="text-warning mb-2">
                <i className="fas fa-calendar-check fa-2x"></i>
              </div>
              <Card.Title className="h4">7</Card.Title>
              <Card.Text className="text-muted">Day Streak</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* Progress Section */}
        <Col lg={8}>
          <Card className="mb-4 border-0 shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Today's Nutrition Progress</h5>
            </Card.Header>
            <Card.Body>
              {nutritionProgress &&
                Object.entries(nutritionProgress).map(([nutrient, data]) => {
                  const percentage = getProgressPercentage(
                    data.consumed,
                    data.target
                  );
                  return (
                    <div key={nutrient} className="mb-3">
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-capitalize fw-semibold">
                          {nutrient}: {data.consumed} / {data.target}
                        </span>
                        <span className="text-muted">{percentage}%</span>
                      </div>
                      <ProgressBar
                        now={percentage}
                        variant={getProgressVariant(percentage)}
                        className="mb-2"
                      />
                    </div>
                  );
                })}

              <div className="mt-4">
                <Button variant="primary" className="me-2">
                  Log New Meal
                </Button>
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowCalculator(true)}
                >
                  Recalculate Targets
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* Today's Meals */}
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Today's Meals</h5>
              <Button variant="outline-primary" size="sm">
                Add Meal
              </Button>
            </Card.Header>
            <Card.Body>
              {todaysMeals.length === 0 ? (
                <div className="text-center py-4">
                  <i className="fas fa-utensils fa-3x text-muted mb-3"></i>
                  <p className="text-muted">No meals logged today</p>
                  <Button variant="primary">Log Your First Meal</Button>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {todaysMeals.map((meal) => (
                    <div
                      key={meal._id}
                      className="list-group-item d-flex justify-content-between align-items-center border-0 px-0"
                    >
                      <div>
                        <h6 className="mb-1">{meal.name}</h6>
                        <span
                          className={`badge bg-${getMealTypeBadge(
                            meal.type
                          )} me-2`}
                        >
                          {meal.type}
                        </span>
                        <small className="text-muted">
                          {meal.calories} cal
                        </small>
                      </div>
                      <div className="text-end">
                        <div className="text-muted small">
                          P: {meal.protein}g • C: {meal.carbs}g • F: {meal.fats}
                          g
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Sidebar */}
        <Col lg={4}>
          {/* Quick Actions */}
          <Card className="mb-4 border-0 shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Quick Actions</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Button variant="primary">
                  <i className="fas fa-plus me-2"></i>
                  Generate Meal Plan
                </Button>
                <Button variant="outline-success">
                  <i className="fas fa-book me-2"></i>
                  Browse Recipes
                </Button>
                <Button variant="outline-info">
                  <i className="fas fa-shopping-cart me-2"></i>
                  View Grocery List
                </Button>
                <Button variant="outline-warning">
                  <i className="fas fa-user me-2"></i>
                  Update Profile
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* Progress Charts */}
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Weekly Progress</h5>
            </Card.Header>
            <Card.Body>
              <ProgressCharts />
            </Card.Body>
          </Card>

          {/* Daily Tip */}
          <Card className="border-0 shadow-sm bg-light">
            <Card.Body className="text-center">
              <i className="fas fa-lightbulb text-warning fa-2x mb-2"></i>
              <h6>Daily Tip</h6>
              <p className="small text-muted mb-0">
                Stay hydrated! Drink at least 8 glasses of water throughout the
                day to support metabolism and overall health.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
