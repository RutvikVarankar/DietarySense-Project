import React, { useState } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Badge,
  Accordion,
  Tab,
  Tabs,
} from "react-bootstrap";
import MealCard from "./MealCard";

const WeeklyMealPlan = ({ mealPlan }) => {
  const [activeDay, setActiveDay] = useState(0);
  const [activeMealType, setActiveMealType] = useState("breakfast");

  if (!mealPlan || !mealPlan.days || mealPlan.days.length === 0) {
    return (
      <Card className="border-0 shadow">
        <Card.Body className="text-center py-5">
          <i className="fas fa-utensils fa-3x text-muted mb-3"></i>
          <h4 className="text-muted">No Meal Plan Generated</h4>
          <p className="text-muted">
            Generate a meal plan to get started with your dietary journey.
          </p>
        </Card.Body>
      </Card>
    );
  }

  const mealTypes = [
    { key: "breakfast", name: "Breakfast", icon: "☕" },
    { key: "lunch", name: "Lunch", icon: "🥗" },
    { key: "dinner", name: "Dinner", icon: "🍽️" },
    { key: "snacks", name: "Snacks", icon: "🍎" },
  ];

  const getDayName = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { weekday: "long" });
  };

  const getFormattedDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const calculateDayNutrition = (day) => {
    return (
      day.nutrition || {
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFats: 0,
      }
    );
  };

  return (
    <div>
      {/* Plan Header */}
      <Card className="border-0 bg-primary text-white mb-4">
        <Card.Body>
          <Row className="align-items-center">
            <Col>
              <h3 className="mb-1">{mealPlan.title}</h3>
              <p className="mb-0 opacity-75">
                {mealPlan.duration} days •{" "}
                {mealPlan.preferences?.dietaryPreference || "Mixed"} • Avg.{" "}
                {mealPlan.nutritionSummary?.averageDailyCalories || 0}{" "}
                calories/day
              </p>
            </Col>
            <Col xs="auto">
              <Badge bg="light" text="dark" className="fs-6">
                {mealPlan.status || "Active"}
              </Badge>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Day Navigation */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="p-3">
          <div className="d-flex overflow-auto pb-2">
            {mealPlan.days.map((day, index) => (
              <Button
                key={day.dayNumber}
                variant={activeDay === index ? "primary" : "outline-primary"}
                onClick={() => setActiveDay(index)}
                className="me-2 flex-shrink-0"
                style={{ minWidth: "120px" }}
              >
                <div className="small">Day {day.dayNumber}</div>
                <div className="fw-bold">{getDayName(day.date)}</div>
                <div className="small">{getFormattedDate(day.date)}</div>
              </Button>
            ))}
          </div>
        </Card.Body>
      </Card>

      <Row>
        <Col lg={8}>
          {/* Meal Type Tabs */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white border-0">
              <Tabs
                activeKey={activeMealType}
                onSelect={(k) => setActiveMealType(k)}
                className="border-0"
              >
                {mealTypes.map((mealType) => (
                  <Tab
                    key={mealType.key}
                    eventKey={mealType.key}
                    title={
                      <span>
                        {mealType.icon} {mealType.name}
                      </span>
                    }
                  >
                    <Card.Body>
                      <h5 className="mb-3">{mealType.name} Recipes</h5>
                      {mealPlan.days[activeDay]?.meals[mealType.key]?.length >
                      0 ? (
                        <Row>
                          {mealPlan.days[activeDay].meals[mealType.key].map(
                            (meal, mealIndex) => (
                              <Col key={mealIndex} md={6} className="mb-3">
                                <MealCard
                                  meal={meal}
                                  mealType={mealType.key}
                                  dayIndex={activeDay}
                                  mealIndex={mealIndex}
                                />
                              </Col>
                            )
                          )}
                        </Row>
                      ) : (
                        <div className="text-center py-4 text-muted">
                          <i className="fas fa-utensils fa-2x mb-2"></i>
                          <p>No {mealType.name} recipes planned for this day</p>
                        </div>
                      )}
                    </Card.Body>
                  </Tab>
                ))}
              </Tabs>
            </Card.Header>
          </Card>

          {/* Day Notes */}
          {mealPlan.days[activeDay]?.notes && (
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-warning text-dark">
                <h6 className="mb-0">📝 Day Notes</h6>
              </Card.Header>
              <Card.Body>
                <p className="mb-0">{mealPlan.days[activeDay].notes}</p>
              </Card.Body>
            </Card>
          )}
        </Col>

        <Col lg={4}>
          {/* Day Nutrition Summary */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-success text-white">
              <h6 className="mb-0">📊 Daily Nutrition</h6>
            </Card.Header>
            <Card.Body>
              {(() => {
                const nutrition = calculateDayNutrition(
                  mealPlan.days[activeDay]
                );
                return (
                  <>
                    <div className="text-center mb-3">
                      <div className="h3 text-success">
                        {nutrition.totalCalories}
                      </div>
                      <small className="text-muted">Total Calories</small>
                    </div>
                    <Row className="text-center">
                      <Col xs={6} className="mb-2">
                        <div className="h5">{nutrition.totalProtein}g</div>
                        <small className="text-muted">Protein</small>
                      </Col>
                      <Col xs={6} className="mb-2">
                        <div className="h5">{nutrition.totalCarbs}g</div>
                        <small className="text-muted">Carbs</small>
                      </Col>
                      <Col xs={6}>
                        <div className="h5">{nutrition.totalFats}g</div>
                        <small className="text-muted">Fats</small>
                      </Col>
                      <Col xs={6}>
                        <div className="h5">
                          {Math.round(
                            (nutrition.totalCalories /
                              (mealPlan.nutritionSummary
                                ?.averageDailyCalories || 1)) *
                              100
                          )}
                          %
                        </div>
                        <small className="text-muted">of Daily Goal</small>
                      </Col>
                    </Row>
                  </>
                );
              })()}
            </Card.Body>
          </Card>

          {/* Quick Actions */}
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white">
              <h6 className="mb-0">⚡ Quick Actions</h6>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Button variant="outline-primary" size="sm">
                  <i className="fas fa-shopping-cart me-2"></i>
                  Generate Grocery List
                </Button>
                <Button variant="outline-success" size="sm">
                  <i className="fas fa-edit me-2"></i>
                  Customize This Day
                </Button>
                <Button variant="outline-info" size="sm">
                  <i className="fas fa-print me-2"></i>
                  Print Meal Plan
                </Button>
                <Button variant="outline-warning" size="sm">
                  <i className="fas fa-sync me-2"></i>
                  Regenerate Day
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* Weekly Progress */}
          <Card className="border-0 shadow-sm mt-4">
            <Card.Header className="bg-info text-white">
              <h6 className="mb-0">📈 Weekly Progress</h6>
            </Card.Header>
            <Card.Body>
              <div className="text-center">
                <div className="h4 mb-1">{mealPlan.completionRate || 0}%</div>
                <small className="text-muted">Plan Completion</small>
              </div>
              <div className="progress mt-2" style={{ height: "8px" }}>
                <div
                  className="progress-bar bg-success"
                  style={{ width: `${mealPlan.completionRate || 0}%` }}
                ></div>
              </div>
              <div className="mt-3">
                <small className="text-muted d-block">
                  <i className="fas fa-fire me-1"></i>
                  Total Calories:{" "}
                  {mealPlan.nutritionSummary?.totalCalories || 0}
                </small>
                <small className="text-muted d-block">
                  <i className="fas fa-dumbbell me-1"></i>
                  Total Protein: {mealPlan.nutritionSummary?.totalProtein || 0}g
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default WeeklyMealPlan;
