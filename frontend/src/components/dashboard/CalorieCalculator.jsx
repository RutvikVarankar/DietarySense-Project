import React, { useState } from "react";
import { Card, Form, Button, Row, Col, Alert, Spinner } from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";

const CalorieCalculator = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    age: user?.profile?.age || "",
    gender: user?.profile?.gender || "",
    height: user?.profile?.height || "",
    weight: user?.profile?.weight || "",
    goal: user?.profile?.goal || "",
    activityLevel: user?.profile?.activityLevel || "",
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const calculateCalories = async (e) => {
    if (e) e.preventDefault();

    // Basic validation
    if (
      !formData.age ||
      !formData.gender ||
      !formData.height ||
      !formData.weight ||
      !formData.goal ||
      !formData.activityLevel
    ) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/users/calculate-calories",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to calculate calories");
      }

      const data = await response.json();
      setResults(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveResults = async () => {
    if (!results) return;

    setLoading(true);
    try {
      await updateProfile({
        age: parseInt(formData.age),
        gender: formData.gender,
        height: parseInt(formData.height),
        weight: parseInt(formData.weight),
        goal: formData.goal,
        activityLevel: formData.activityLevel,
        dailyCalories: results.dailyCalories,
        protein: results.protein,
        carbs: results.carbs,
        fats: results.fats,
      });

      setError("");
      alert("Profile updated successfully!");
    } catch (err) {
      setError("Failed to save profile: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Row className="justify-content-center">
      <Col md={8} lg={6}>
        <Card className="border-0 shadow">
          <Card.Header className="bg-primary text-white">
            <h4 className="mb-0">Calorie & Nutrition Calculator</h4>
          </Card.Header>
          <Card.Body className="p-4">
            {error && (
              <Alert variant="danger" className="mb-3">
                {error}
              </Alert>
            )}

            <Form onSubmit={calculateCalories}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Age *</Form.Label>
                    <Form.Control
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      min="1"
                      max="120"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Gender *</Form.Label>
                    <Form.Select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Height (cm) *</Form.Label>
                    <Form.Control
                      type="number"
                      name="height"
                      value={formData.height}
                      onChange={handleChange}
                      min="50"
                      max="250"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Weight (kg) *</Form.Label>
                    <Form.Control
                      type="number"
                      name="weight"
                      value={formData.weight}
                      onChange={handleChange}
                      min="20"
                      max="300"
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Goal *</Form.Label>
                <Form.Select
                  name="goal"
                  value={formData.goal}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select your goal</option>
                  <option value="weight_loss">Weight Loss</option>
                  <option value="maintenance">Maintain Weight</option>
                  <option value="muscle_gain">Muscle Gain</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Activity Level *</Form.Label>
                <Form.Select
                  name="activityLevel"
                  value={formData.activityLevel}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select activity level</option>
                  <option value="sedentary">
                    Sedentary (little or no exercise)
                  </option>
                  <option value="light">Light (exercise 1-3 times/week)</option>
                  <option value="moderate">
                    Moderate (exercise 3-5 times/week)
                  </option>
                  <option value="active">
                    Active (exercise 6-7 times/week)
                  </option>
                  <option value="very_active">
                    Very Active (physical job or 2x training)
                  </option>
                </Form.Select>
              </Form.Group>

              <div className="d-grid">
                <Button
                  variant="primary"
                  type="submit"
                  disabled={loading}
                  size="lg"
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
                      Calculating...
                    </>
                  ) : (
                    "Calculate My Calories"
                  )}
                </Button>
              </div>
            </Form>

            {results && (
              <div className="mt-4">
                <hr />
                <h5 className="text-center mb-3">
                  Your Recommended Daily Targets
                </h5>

                <Row className="text-center">
                  <Col md={3} className="mb-3">
                    <div className="bg-primary text-white rounded p-3">
                      <h4 className="mb-1">{results.dailyCalories}</h4>
                      <small>Calories</small>
                    </div>
                  </Col>
                  <Col md={3} className="mb-3">
                    <div className="bg-success text-white rounded p-3">
                      <h4 className="mb-1">{results.protein}g</h4>
                      <small>Protein</small>
                    </div>
                  </Col>
                  <Col md={3} className="mb-3">
                    <div className="bg-info text-white rounded p-3">
                      <h4 className="mb-1">{results.carbs}g</h4>
                      <small>Carbs</small>
                    </div>
                  </Col>
                  <Col md={3} className="mb-3">
                    <div className="bg-warning text-white rounded p-3">
                      <h4 className="mb-1">{results.fats}g</h4>
                      <small>Fats</small>
                    </div>
                  </Col>
                </Row>

                <div className="bg-light rounded p-3 mb-3">
                  <h6>Additional Information:</h6>
                  <ul className="list-unstyled mb-0">
                    <li>
                      <strong>BMR:</strong> {results.bmr} calories/day
                    </li>
                    <li>
                      <strong>Maintenance:</strong>{" "}
                      {results.maintenanceCalories} calories/day
                    </li>
                    <li>
                      <strong>BMI:</strong> {results.bmi} (
                      {results.bmi < 18.5
                        ? "Underweight"
                        : results.bmi < 25
                        ? "Normal"
                        : results.bmi < 30
                        ? "Overweight"
                        : "Obese"}
                      )
                    </li>
                  </ul>
                </div>

                <div className="d-grid">
                  <Button
                    variant="success"
                    onClick={saveResults}
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Save to My Profile"}
                  </Button>
                </div>
              </div>
            )}
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default CalorieCalculator;
