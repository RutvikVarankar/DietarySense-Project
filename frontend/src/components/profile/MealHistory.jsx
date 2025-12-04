import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Form,
  Badge,
  Alert,
  Spinner,
  Row,
  Col,
  InputGroup,
} from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";

const MealHistory = () => {
  const { user } = useAuth();
  const [mealHistory, setMealHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  useEffect(() => {
    fetchMealHistory();
  }, []);

  const fetchMealHistory = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockMealHistory = [
        {
          _id: "1",
          date: "2024-01-15",
          meals: [
            {
              _id: "m1",
              name: "Oatmeal with Berries",
              type: "breakfast",
              calories: 350,
              protein: 12,
              carbs: 60,
              fats: 6,
            },
            {
              _id: "m2",
              name: "Grilled Chicken Salad",
              type: "lunch",
              calories: 450,
              protein: 35,
              carbs: 20,
              fats: 25,
            },
            {
              _id: "m3",
              name: "Protein Shake",
              type: "snack",
              calories: 200,
              protein: 25,
              carbs: 15,
              fats: 2,
            },
            {
              _id: "m4",
              name: "Salmon with Roasted Vegetables",
              type: "dinner",
              calories: 500,
              protein: 40,
              carbs: 25,
              fats: 30,
            },
          ],
          totalCalories: 1500,
          totalProtein: 112,
          totalCarbs: 120,
          totalFats: 63,
        },
        {
          _id: "2",
          date: "2024-01-14",
          meals: [
            {
              _id: "m5",
              name: "Greek Yogurt with Honey",
              type: "breakfast",
              calories: 300,
              protein: 20,
              carbs: 35,
              fats: 8,
            },
            {
              _id: "m6",
              name: "Turkey Sandwich",
              type: "lunch",
              calories: 400,
              protein: 25,
              carbs: 45,
              fats: 15,
            },
            {
              _id: "m7",
              name: "Apple with Almond Butter",
              type: "snack",
              calories: 250,
              protein: 8,
              carbs: 30,
              fats: 12,
            },
            {
              _id: "m8",
              name: "Vegetable Stir Fry with Tofu",
              type: "dinner",
              calories: 450,
              protein: 22,
              carbs: 50,
              fats: 18,
            },
          ],
          totalCalories: 1400,
          totalProtein: 75,
          totalCarbs: 160,
          totalFats: 53,
        },
      ];

      setMealHistory(mockMealHistory);
    } catch (err) {
      setError("Failed to load meal history");
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = mealHistory.filter((day) => {
    const matchesDate = !dateFilter || day.date === dateFilter;
    const matchesType =
      !typeFilter || day.meals.some((meal) => meal.type === typeFilter);
    return matchesDate && matchesType;
  });

  const getMealTypeIcon = (type) => {
    const icons = {
      breakfast: "☕",
      lunch: "🥗",
      dinner: "🍽️",
      snack: "🍎",
    };
    return icons[type] || "🍴";
  };

  const getMealTypeVariant = (type) => {
    const variants = {
      breakfast: "warning",
      lunch: "success",
      dinner: "primary",
      snack: "info",
    };
    return variants[type] || "secondary";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getProgressPercentage = (consumed, target = 2000) => {
    return Math.min(Math.round((consumed / target) * 100), 100);
  };

  const getProgressVariant = (percentage) => {
    if (percentage >= 100) return "danger";
    if (percentage >= 90) return "warning";
    return "success";
  };

  const calculateWeeklyStats = () => {
    const totalDays = mealHistory.length;
    const totalCalories = mealHistory.reduce(
      (sum, day) => sum + day.totalCalories,
      0
    );
    const totalProtein = mealHistory.reduce(
      (sum, day) => sum + day.totalProtein,
      0
    );
    const totalCarbs = mealHistory.reduce(
      (sum, day) => sum + day.totalCarbs,
      0
    );
    const totalFats = mealHistory.reduce((sum, day) => sum + day.totalFats, 0);

    return {
      totalDays,
      avgCalories: Math.round(totalCalories / totalDays),
      avgProtein: Math.round(totalProtein / totalDays),
      avgCarbs: Math.round(totalCarbs / totalDays),
      avgFats: Math.round(totalFats / totalDays),
    };
  };

  const weeklyStats = calculateWeeklyStats();

  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading meal history...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header and Filters */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h5 className="mb-1">Meal History</h5>
          <p className="text-muted mb-0">Track your daily food consumption</p>
        </div>
        <Button variant="outline-primary" size="sm">
          <i className="fas fa-plus me-2"></i>
          Add Meal
        </Button>
      </div>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Weekly Summary */}
      {mealHistory.length > 0 && (
        <Card className="border-0 bg-light mb-4">
          <Card.Body>
            <h6 className="mb-3">📈 Weekly Summary</h6>
            <Row className="text-center">
              <Col xs={6} md={3} className="mb-3">
                <div className="h4 text-primary mb-1">
                  {weeklyStats.totalDays}
                </div>
                <small className="text-muted">Days Tracked</small>
              </Col>
              <Col xs={6} md={3} className="mb-3">
                <div className="h4 text-success mb-1">
                  {weeklyStats.avgCalories}
                </div>
                <small className="text-muted">Avg. Calories</small>
              </Col>
              <Col xs={6} md={3} className="mb-3">
                <div className="h4 text-info mb-1">
                  {weeklyStats.avgProtein}g
                </div>
                <small className="text-muted">Avg. Protein</small>
              </Col>
              <Col xs={6} md={3} className="mb-3">
                <div className="h4 text-warning mb-1">
                  {weeklyStats.avgFats}g
                </div>
                <small className="text-muted">Avg. Fats</small>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Filters */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={6}>
              <Form.Label className="small">Filter by Date</Form.Label>
              <Form.Control
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </Col>
            <Col md={6}>
              <Form.Label className="small">Filter by Meal Type</Form.Label>
              <Form.Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">All Meal Types</option>
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snacks</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Meal History */}
      {filteredHistory.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <Card.Body className="text-center py-5">
            <i className="fas fa-utensils fa-3x text-muted mb-3"></i>
            <h5 className="text-muted">No meal history found</h5>
            <p className="text-muted mb-3">
              {mealHistory.length === 0
                ? "You haven't logged any meals yet."
                : "No meals match your current filters."}
            </p>
            <Button variant="primary">Log Your First Meal</Button>
          </Card.Body>
        </Card>
      ) : (
        <div>
          {filteredHistory.map((day) => (
            <Card key={day._id} className="border-0 shadow-sm mb-4">
              <Card.Header className="bg-white">
                <div className="d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">{formatDate(day.date)}</h6>
                  <Badge bg="outline-primary" text="dark">
                    {day.totalCalories} total calories
                  </Badge>
                </div>
              </Card.Header>
              <Card.Body className="p-0">
                <Table hover className="mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th>Meal</th>
                      <th>Type</th>
                      <th>Calories</th>
                      <th>Protein</th>
                      <th>Carbs</th>
                      <th>Fats</th>
                    </tr>
                  </thead>
                  <tbody>
                    {day.meals.map((meal) => (
                      <tr key={meal._id}>
                        <td>
                          <div className="fw-medium">{meal.name}</div>
                        </td>
                        <td>
                          <Badge bg={getMealTypeVariant(meal.type)}>
                            {getMealTypeIcon(meal.type)} {meal.type}
                          </Badge>
                        </td>
                        <td>
                          <span className="fw-bold text-primary">
                            {meal.calories}
                          </span>
                        </td>
                        <td>
                          <span className="text-success">{meal.protein}g</span>
                        </td>
                        <td>
                          <span className="text-info">{meal.carbs}g</span>
                        </td>
                        <td>
                          <span className="text-warning">{meal.fats}g</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-light">
                    <tr>
                      <td colSpan="2" className="text-end fw-bold">
                        Daily Total:
                      </td>
                      <td className="fw-bold text-primary">
                        {day.totalCalories}
                      </td>
                      <td className="fw-bold text-success">
                        {day.totalProtein}g
                      </td>
                      <td className="fw-bold text-info">{day.totalCarbs}g</td>
                      <td className="fw-bold text-warning">{day.totalFats}g</td>
                    </tr>
                  </tfoot>
                </Table>
              </Card.Body>
              <Card.Footer className="bg-white">
                <div className="d-flex justify-content-between align-items-center">
                  <small className="text-muted">
                    Progress: {getProgressPercentage(day.totalCalories)}% of
                    daily goal
                  </small>
                  <div style={{ width: "100px" }}>
                    <div className="progress" style={{ height: "6px" }}>
                      <div
                        className={`progress-bar bg-${getProgressVariant(
                          getProgressPercentage(day.totalCalories)
                        )}`}
                        style={{
                          width: `${getProgressPercentage(day.totalCalories)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </Card.Footer>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      {mealHistory.length > 0 && (
        <Card className="border-0 shadow-sm mt-4">
          <Card.Body>
            <h6 className="mb-3">Quick Actions</h6>
            <div className="d-flex gap-2 flex-wrap">
              <Button variant="outline-primary" size="sm">
                <i className="fas fa-download me-2"></i>
                Export History
              </Button>
              <Button variant="outline-success" size="sm">
                <i className="fas fa-chart-bar me-2"></i>
                View Analytics
              </Button>
              <Button variant="outline-info" size="sm">
                <i className="fas fa-share-alt me-2"></i>
                Share Progress
              </Button>
              <Button
                variant="outline-warning"
                size="sm"
                onClick={() => {
                  setDateFilter("");
                  setTypeFilter("");
                }}
              >
                <i className="fas fa-times me-2"></i>
                Clear Filters
              </Button>
            </div>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default MealHistory;
