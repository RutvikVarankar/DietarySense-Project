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
  Tab,
  Tabs,
} from "react-bootstrap";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
    setError("");
    setSuccess("");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await updateProfile(formData);
      setSuccess("Profile updated successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

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
      <Row className="justify-content-center">
        <Col lg={10}>
          <Card className="border-0 shadow">
            <Card.Header className="bg-primary text-white py-3">
              <h2 className="mb-0">👤 User Profile</h2>
            </Card.Header>
            <Card.Body className="p-0">
              <Tabs defaultActiveKey="personal" className="p-3">
                <Tab eventKey="personal" title="Personal Information">
                  <div className="p-3">
                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}

                    <Form onSubmit={handleSubmit}>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Full Name</Form.Label>
                            <Form.Control
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              required
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Email Address</Form.Label>
                            <Form.Control
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              required
                              disabled
                            />
                            <Form.Text className="text-muted">
                              Email cannot be changed
                            </Form.Text>
                          </Form.Group>
                        </Col>
                      </Row>

                      <Row>
                        <Col md={4}>
                          <Form.Group className="mb-3">
                            <Form.Label>Age</Form.Label>
                            <Form.Control
                              type="number"
                              name="age"
                              value={formData.age}
                              onChange={handleInputChange}
                              min="1"
                              max="120"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group className="mb-3">
                            <Form.Label>Gender</Form.Label>
                            <Form.Select
                              name="gender"
                              value={formData.gender}
                              onChange={handleInputChange}
                            >
                              <option value="">Select Gender</option>
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                              <option value="other">Other</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group className="mb-3">
                            <Form.Label>Dietary Preference</Form.Label>
                            <Form.Select
                              name="dietaryPreference"
                              value={formData.dietaryPreference}
                              onChange={handleInputChange}
                            >
                              <option value="">No Preference</option>
                              <option value="vegetarian">Vegetarian</option>
                              <option value="vegan">Vegan</option>
                              <option value="gluten-free">Gluten-Free</option>
                              <option value="non-vegetarian">
                                Non-Vegetarian
                              </option>
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
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Goal</Form.Label>
                            <Form.Select
                              name="goal"
                              value={formData.goal}
                              onChange={handleInputChange}
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

                      <div className="d-grid">
                        <Button
                          type="submit"
                          variant="primary"
                          size="lg"
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
                              Updating...
                            </>
                          ) : (
                            "Update Profile"
                          )}
                        </Button>
                      </div>
                    </Form>
                  </div>
                </Tab>

                <Tab eventKey="nutrition" title="Nutrition Targets">
                  <div className="p-3">
                    <Card className="bg-light border-0">
                      <Card.Body>
                        <h5>Your Current Nutrition Targets</h5>
                        {user.profile?.dailyCalories ? (
                          <Row className="text-center">
                            <Col md={3} className="mb-3">
                              <div className="h4 text-primary">
                                {user.profile.dailyCalories}
                              </div>
                              <small className="text-muted">
                                Daily Calories
                              </small>
                            </Col>
                            <Col md={3} className="mb-3">
                              <div className="h4 text-success">
                                {user.profile.protein}g
                              </div>
                              <small className="text-muted">Protein</small>
                            </Col>
                            <Col md={3} className="mb-3">
                              <div className="h4 text-info">
                                {user.profile.carbs}g
                              </div>
                              <small className="text-muted">Carbs</small>
                            </Col>
                            <Col md={3} className="mb-3">
                              <div className="h4 text-warning">
                                {user.profile.fats}g
                              </div>
                              <small className="text-muted">Fats</small>
                            </Col>
                          </Row>
                        ) : (
                          <div className="text-center py-4">
                            <p className="text-muted">
                              No nutrition targets set yet.
                            </p>
                            <Button variant="primary" href="/dashboard">
                              Set Up Targets
                            </Button>
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  </div>
                </Tab>

                <Tab eventKey="preferences" title="Dietary Preferences">
                  <div className="p-3">
                    <h5>Allergies</h5>
                    <div className="mb-4">
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
                          checked={formData.allergies?.includes(
                            allergy.toLowerCase()
                          )}
                          onChange={(e) => handleArrayChange(e, "allergies")}
                          className="mb-2"
                        />
                      ))}
                    </div>

                    <h5>Dietary Restrictions</h5>
                    <div className="mb-4">
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
                          value={restriction.toLowerCase().replace(" ", "_")}
                          checked={formData.restrictions?.includes(
                            restriction.toLowerCase().replace(" ", "_")
                          )}
                          onChange={(e) => handleArrayChange(e, "restrictions")}
                          className="mb-2"
                        />
                      ))}
                    </div>
                  </div>
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
