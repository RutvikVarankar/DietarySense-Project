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
  Tabs,
  Tab,
} from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";
import MealHistory from "./MealHistory";

const UserProfile = () => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editMode, setEditMode] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    goal: "",
    activityLevel: "",
    dietaryPreference: "",
    allergies: [],
    restrictions: [],
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        age: user.profile?.age || "",
        gender: user.profile?.gender || "",
        height: user.profile?.height || "",
        weight: user.profile?.weight || "",
        goal: user.profile?.goal || "",
        activityLevel: user.profile?.activityLevel || "",
        dietaryPreference: user.profile?.dietaryPreference || "",
        allergies: user.profile?.allergies || [],
        restrictions: user.profile?.restrictions || [],
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleArrayChange = (e, field) => {
    const { value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [field]: checked
        ? [...prev[field], value]
        : prev[field].filter((item) => item !== value),
    }));
  };

  const calculateBMI = () => {
    if (!formData.height || !formData.weight) return null;
    const heightInMeters = formData.height / 100;
    const bmi = formData.weight / (heightInMeters * heightInMeters);
    return bmi.toFixed(1);
  };

  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return { category: "Underweight", variant: "warning" };
    if (bmi < 25) return { category: "Normal weight", variant: "success" };
    if (bmi < 30) return { category: "Overweight", variant: "warning" };
    return { category: "Obese", variant: "danger" };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await updateProfile({
        name: formData.name,
        age: parseInt(formData.age),
        gender: formData.gender,
        height: parseInt(formData.height),
        weight: parseInt(formData.weight),
        goal: formData.goal,
        activityLevel: formData.activityLevel,
        dietaryPreference: formData.dietaryPreference,
        allergies: formData.allergies,
        restrictions: formData.restrictions,
      });

      setSuccess("Profile updated successfully!");
      setEditMode(false);

      // Auto-hide success message
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const bmi = calculateBMI();
  const bmiInfo = bmi ? getBMICategory(parseFloat(bmi)) : null;

  if (!user) {
    return (
      <Container className="my-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading profile...</p>
      </Container>
    );
  }

  return (
    <Container className="my-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="bg-primary text-white rounded p-4">
            <h1 className="h2 mb-2">👤 User Profile</h1>
            <p className="mb-0 opacity-75">
              Manage your personal information and dietary preferences
            </p>
          </div>
        </Col>
      </Row>

      <Row>
        <Col lg={4}>
          {/* Profile Summary */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body className="text-center">
              <div
                className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                style={{ width: "80px", height: "80px" }}
              >
                <span className="text-white fs-2">
                  {user.name?.charAt(0) || "U"}
                </span>
              </div>
              <h4>{user.name}</h4>
              <p className="text-muted mb-3">{user.email}</p>

              <div className="d-grid gap-2">
                <Button
                  variant={editMode ? "outline-secondary" : "outline-primary"}
                  onClick={() => setEditMode(!editMode)}
                >
                  {editMode ? "Cancel Editing" : "Edit Profile"}
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* Health Stats */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white">
              <h6 className="mb-0">📊 Health Stats</h6>
            </Card.Header>
            <Card.Body>
              {bmi ? (
                <div className="text-center">
                  <div className="h3 mb-1">{bmi}</div>
                  <Badge bg={bmiInfo.variant} className="mb-2">
                    {bmiInfo.category}
                  </Badge>
                  <div className="small text-muted">Body Mass Index</div>
                </div>
              ) : (
                <div className="text-center text-muted">
                  <small>Complete your profile to see BMI</small>
                </div>
              )}

              <hr />

              <div className="row text-center">
                <div className="col-6">
                  <div className="h5 text-success mb-1">
                    {user.profile?.dailyCalories || "--"}
                  </div>
                  <small className="text-muted">Daily Calories</small>
                </div>
                <div className="col-6">
                  <div className="h5 text-info mb-1">
                    {user.profile?.protein || "--"}g
                  </div>
                  <small className="text-muted">Protein Target</small>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Dietary Preferences */}
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white">
              <h6 className="mb-0">🥗 Dietary Preferences</h6>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <strong>Primary Diet:</strong>
                <div>
                  <Badge bg="outline-primary" text="dark" className="mt-1">
                    {user.profile?.dietaryPreference || "Not set"}
                  </Badge>
                </div>
              </div>

              {user.profile?.allergies && user.profile.allergies.length > 0 && (
                <div className="mb-3">
                  <strong>Allergies:</strong>
                  <div className="mt-1">
                    {user.profile.allergies.map((allergy) => (
                      <Badge
                        key={allergy}
                        bg="outline-danger"
                        text="dark"
                        className="me-1 mb-1"
                      >
                        {allergy}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {user.profile?.restrictions &&
                user.profile.restrictions.length > 0 && (
                  <div>
                    <strong>Restrictions:</strong>
                    <div className="mt-1">
                      {user.profile.restrictions.map((restriction) => (
                        <Badge
                          key={restriction}
                          bg="outline-warning"
                          text="dark"
                          className="me-1 mb-1"
                        >
                          {restriction}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0 p-0">
              <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="px-3 pt-3"
              >
                <Tab eventKey="profile" title="Profile Information">
                  <Card.Body>
                    {error && (
                      <Alert variant="danger" className="mb-3">
                        {error}
                      </Alert>
                    )}

                    {success && (
                      <Alert variant="success" className="mb-3">
                        {success}
                      </Alert>
                    )}

                    <Form onSubmit={handleSubmit}>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Full Name *</Form.Label>
                            <Form.Control
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              required
                              disabled={!editMode}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Email Address *</Form.Label>
                            <Form.Control
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              required
                              disabled
                              className="bg-light"
                            />
                            <Form.Text className="text-muted">
                              Email cannot be changed
                            </Form.Text>
                          </Form.Group>
                        </Col>
                      </Row>

                      <h6 className="mt-4 mb-3 text-muted">
                        Personal Information
                      </h6>

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Age</Form.Label>
                            <Form.Control
                              type="number"
                              name="age"
                              value={formData.age}
                              onChange={handleInputChange}
                              min="1"
                              max="120"
                              disabled={!editMode}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Gender</Form.Label>
                            <Form.Select
                              name="gender"
                              value={formData.gender}
                              onChange={handleInputChange}
                              disabled={!editMode}
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
                            <Form.Label>Height (cm)</Form.Label>
                            <Form.Control
                              type="number"
                              name="height"
                              value={formData.height}
                              onChange={handleInputChange}
                              min="50"
                              max="250"
                              disabled={!editMode}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Weight (kg)</Form.Label>
                            <Form.Control
                              type="number"
                              name="weight"
                              value={formData.weight}
                              onChange={handleInputChange}
                              min="20"
                              max="300"
                              disabled={!editMode}
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <h6 className="mt-4 mb-3 text-muted">
                        Goals & Preferences
                      </h6>

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Primary Goal</Form.Label>
                            <Form.Select
                              name="goal"
                              value={formData.goal}
                              onChange={handleInputChange}
                              disabled={!editMode}
                            >
                              <option value="">Select Goal</option>
                              <option value="weight_loss">Weight Loss</option>
                              <option value="maintenance">
                                Maintain Weight
                              </option>
                              <option value="muscle_gain">Muscle Gain</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Activity Level</Form.Label>
                            <Form.Select
                              name="activityLevel"
                              value={formData.activityLevel}
                              onChange={handleInputChange}
                              disabled={!editMode}
                            >
                              <option value="">Select Activity Level</option>
                              <option value="sedentary">Sedentary</option>
                              <option value="light">Light</option>
                              <option value="moderate">Moderate</option>
                              <option value="active">Active</option>
                              <option value="very_active">Very Active</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                      </Row>

                      <Form.Group className="mb-4">
                        <Form.Label>Dietary Preference</Form.Label>
                        <Form.Select
                          name="dietaryPreference"
                          value={formData.dietaryPreference}
                          onChange={handleInputChange}
                          disabled={!editMode}
                        >
                          <option value="">Select Preference</option>
                          <option value="vegetarian">Vegetarian</option>
                          <option value="non-vegetarian">Non-Vegetarian</option>
                          <option value="vegan">Vegan</option>
                          <option value="gluten-free">Gluten-Free</option>
                          <option value="none">No Preference</option>
                        </Form.Select>
                      </Form.Group>

                      <h6 className="mt-4 mb-3 text-muted">
                        Allergies & Restrictions
                      </h6>

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Allergies</Form.Label>
                            <div>
                              {[
                                "Dairy",
                                "Nuts",
                                "Gluten",
                                "Shellfish",
                                "Eggs",
                                "Soy",
                              ].map((allergy) => (
                                <Form.Check
                                  key={allergy}
                                  type="checkbox"
                                  id={`allergy-${allergy}`}
                                  label={allergy}
                                  value={allergy.toLowerCase()}
                                  checked={formData.allergies.includes(
                                    allergy.toLowerCase()
                                  )}
                                  onChange={(e) =>
                                    handleArrayChange(e, "allergies")
                                  }
                                  disabled={!editMode}
                                  className="mb-2"
                                />
                              ))}
                            </div>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Dietary Restrictions</Form.Label>
                            <div>
                              {[
                                "Low Carb",
                                "Low Fat",
                                "Low Sodium",
                                "High Protein",
                                "Sugar Free",
                              ].map((restriction) => (
                                <Form.Check
                                  key={restriction}
                                  type="checkbox"
                                  id={`restriction-${restriction}`}
                                  label={restriction}
                                  value={restriction
                                    .toLowerCase()
                                    .replace(" ", "_")}
                                  checked={formData.restrictions.includes(
                                    restriction.toLowerCase().replace(" ", "_")
                                  )}
                                  onChange={(e) =>
                                    handleArrayChange(e, "restrictions")
                                  }
                                  disabled={!editMode}
                                  className="mb-2"
                                />
                              ))}
                            </div>
                          </Form.Group>
                        </Col>
                      </Row>

                      {editMode && (
                        <div className="d-flex gap-2 mt-4">
                          <Button
                            variant="primary"
                            type="submit"
                            disabled={loading}
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
                                Saving...
                              </>
                            ) : (
                              "Save Changes"
                            )}
                          </Button>
                          <Button
                            variant="outline-secondary"
                            onClick={() => setEditMode(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                    </Form>
                  </Card.Body>
                </Tab>

                <Tab eventKey="history" title="Meal History">
                  <Card.Body>
                    <MealHistory />
                  </Card.Body>
                </Tab>

                <Tab eventKey="nutrition" title="Nutrition Targets">
                  <Card.Body>
                    {user.profile?.dailyCalories ? (
                      <div>
                        <Alert variant="info" className="mb-4">
                          <h6>Your Daily Nutrition Targets</h6>
                          <p className="mb-0">
                            Based on your profile information and goals
                          </p>
                        </Alert>

                        <Row className="text-center">
                          <Col md={3} className="mb-3">
                            <Card className="border-0 bg-primary text-white">
                              <Card.Body>
                                <div className="h4 mb-1">
                                  {user.profile.dailyCalories}
                                </div>
                                <small>Calories</small>
                              </Card.Body>
                            </Card>
                          </Col>
                          <Col md={3} className="mb-3">
                            <Card className="border-0 bg-success text-white">
                              <Card.Body>
                                <div className="h4 mb-1">
                                  {user.profile.protein}g
                                </div>
                                <small>Protein</small>
                              </Card.Body>
                            </Card>
                          </Col>
                          <Col md={3} className="mb-3">
                            <Card className="border-0 bg-info text-white">
                              <Card.Body>
                                <div className="h4 mb-1">
                                  {user.profile.carbs}g
                                </div>
                                <small>Carbs</small>
                              </Card.Body>
                            </Card>
                          </Col>
                          <Col md={3} className="mb-3">
                            <Card className="border-0 bg-warning text-white">
                              <Card.Body>
                                <div className="h4 mb-1">
                                  {user.profile.fats}g
                                </div>
                                <small>Fats</small>
                              </Card.Body>
                            </Card>
                          </Col>
                        </Row>

                        <div className="text-center mt-4">
                          <Button variant="outline-primary">
                            Recalculate Targets
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted">
                        <i className="fas fa-calculator fa-3x mb-3"></i>
                        <h5>No Nutrition Targets Set</h5>
                        <p>
                          Complete your profile to get personalized nutrition
                          targets
                        </p>
                        <Button
                          variant="primary"
                          onClick={() => setActiveTab("profile")}
                        >
                          Complete Profile
                        </Button>
                      </div>
                    )}
                  </Card.Body>
                </Tab>
              </Tabs>
            </Card.Header>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default UserProfile;
