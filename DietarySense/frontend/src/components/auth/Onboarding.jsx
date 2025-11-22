import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  ProgressBar,
  Alert,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    // Step 1: Basic Information
    age: "",
    gender: "",
    height: "",
    weight: "",

    // Step 2: Goals & Preferences
    goal: "",
    activityLevel: "",
    dietaryPreference: "",
    allergies: [],
    restrictions: [],

    // Step 3: Calculated Results
    calculatedData: null,
  });

  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
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

  const calculateCalories = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/users/calculate-calories",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            age: parseInt(formData.age),
            gender: formData.gender,
            height: parseInt(formData.height),
            weight: parseInt(formData.weight),
            goal: formData.goal,
            activityLevel: formData.activityLevel,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to calculate calories");
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      throw new Error("Error calculating nutritional needs");
    }
  };

  const handleNext = async () => {
    if (step === 2) {
      // Validate step 2 before proceeding to results
      if (
        !formData.goal ||
        !formData.activityLevel ||
        !formData.dietaryPreference
      ) {
        setError("Please fill in all required fields");
        return;
      }

      setLoading(true);
      try {
        const calculatedData = await calculateCalories();
        setFormData((prev) => ({ ...prev, calculatedData }));
        setStep(3);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    } else {
      // Validate current step
      if (
        step === 1 &&
        (!formData.age ||
          !formData.gender ||
          !formData.height ||
          !formData.weight)
      ) {
        setError("Please fill in all required fields");
        return;
      }
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    setStep(step - 1);
    setError("");
  };

  const handleComplete = async () => {
    setLoading(true);
    setError("");

    try {
      await updateProfile({
        age: parseInt(formData.age),
        gender: formData.gender,
        height: parseInt(formData.height),
        weight: parseInt(formData.weight),
        goal: formData.goal,
        activityLevel: formData.activityLevel,
        dietaryPreference: formData.dietaryPreference,
        allergies: formData.allergies,
        restrictions: formData.restrictions,
        dailyCalories: formData.calculatedData.dailyCalories,
        protein: formData.calculatedData.protein,
        carbs: formData.calculatedData.carbs,
        fats: formData.calculatedData.fats,
      });

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <>
      <h3 className="text-center mb-4">Personal Information</h3>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Age *</Form.Label>
            <Form.Control
              type="number"
              name="age"
              value={formData.age}
              onChange={handleInputChange}
              placeholder="Enter your age"
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
              onChange={handleInputChange}
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
              onChange={handleInputChange}
              placeholder="Enter height in cm"
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
              onChange={handleInputChange}
              placeholder="Enter weight in kg"
              min="20"
              max="300"
              required
            />
          </Form.Group>
        </Col>
      </Row>
    </>
  );

  const renderStep2 = () => (
    <>
      <h3 className="text-center mb-4">Goals & Preferences</h3>
      <Form.Group className="mb-3">
        <Form.Label>Primary Goal *</Form.Label>
        <Form.Select
          name="goal"
          value={formData.goal}
          onChange={handleInputChange}
          required
        >
          <option value="">Select your goal</option>
          <option value="weight_loss">Weight Loss</option>
          <option value="maintenance">Maintain Weight</option>
          <option value="muscle_gain">Muscle Gain</option>
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Activity Level *</Form.Label>
        <Form.Select
          name="activityLevel"
          value={formData.activityLevel}
          onChange={handleInputChange}
          required
        >
          <option value="">Select activity level</option>
          <option value="sedentary">Sedentary (little or no exercise)</option>
          <option value="light">Light (exercise 1-3 times/week)</option>
          <option value="moderate">Moderate (exercise 3-5 times/week)</option>
          <option value="active">Active (exercise 6-7 times/week)</option>
          <option value="very_active">
            Very Active (physical job or 2x training)
          </option>
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Dietary Preference *</Form.Label>
        <Form.Select
          name="dietaryPreference"
          value={formData.dietaryPreference}
          onChange={handleInputChange}
          required
        >
          <option value="">Select dietary preference</option>
          <option value="vegetarian">Vegetarian</option>
          <option value="non-vegetarian">Non-Vegetarian</option>
          <option value="vegan">Vegan</option>
          <option value="gluten-free">Gluten-Free</option>
          <option value="none">No Preference</option>
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Allergies (Select all that apply)</Form.Label>
        <div>
          {["Dairy", "Nuts", "Gluten", "Shellfish", "Eggs", "Soy"].map(
            (allergy) => (
              <Form.Check
                key={allergy}
                type="checkbox"
                id={`allergy-${allergy}`}
                label={allergy}
                value={allergy.toLowerCase()}
                checked={formData.allergies.includes(allergy.toLowerCase())}
                onChange={(e) => handleArrayChange(e, "allergies")}
                className="mb-2"
              />
            )
          )}
        </div>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Dietary Restrictions (Select all that apply)</Form.Label>
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
              value={restriction.toLowerCase().replace(" ", "_")}
              checked={formData.restrictions.includes(
                restriction.toLowerCase().replace(" ", "_")
              )}
              onChange={(e) => handleArrayChange(e, "restrictions")}
              className="mb-2"
            />
          ))}
        </div>
      </Form.Group>
    </>
  );

  const renderStep3 = () => {
    if (!formData.calculatedData) return null;

    return (
      <>
        <h3 className="text-center mb-4">Your Nutrition Plan</h3>
        <Alert variant="success" className="text-center">
          <h5>Based on your profile, we recommend:</h5>
        </Alert>

        <Row className="text-center mb-4">
          <Col md={3} className="mb-3">
            <div className="bg-primary text-white rounded p-3">
              <h4 className="mb-1">{formData.calculatedData.dailyCalories}</h4>
              <small>Calories/day</small>
            </div>
          </Col>
          <Col md={3} className="mb-3">
            <div className="bg-success text-white rounded p-3">
              <h4 className="mb-1">{formData.calculatedData.protein}g</h4>
              <small>Protein</small>
            </div>
          </Col>
          <Col md={3} className="mb-3">
            <div className="bg-info text-white rounded p-3">
              <h4 className="mb-1">{formData.calculatedData.carbs}g</h4>
              <small>Carbs</small>
            </div>
          </Col>
          <Col md={3} className="mb-3">
            <div className="bg-warning text-white rounded p-3">
              <h4 className="mb-1">{formData.calculatedData.fats}g</h4>
              <small>Fats</small>
            </div>
          </Col>
        </Row>

        <Alert variant="info">
          <p className="mb-0">
            <strong>Your BMI:</strong> {formData.calculatedData.bmi} (
            {formData.calculatedData.bmi < 18.5
              ? "Underweight"
              : formData.calculatedData.bmi < 25
              ? "Normal"
              : formData.calculatedData.bmi < 30
              ? "Overweight"
              : "Obese"}
            )
          </p>
          <p className="mb-0 mt-2">
            You can always adjust these targets in your profile settings later.
          </p>
        </Alert>
      </>
    );
  };

  return (
    <Container className="my-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow border-0">
            <Card.Header className="bg-primary text-white py-3">
              <h2 className="text-center mb-0">Complete Your Profile</h2>
            </Card.Header>
            <Card.Body className="p-4">
              <ProgressBar
                now={(step / 3) * 100}
                className="mb-4"
                variant="primary"
              />
              <div className="text-center mb-3">
                <small className="text-muted">Step {step} of 3</small>
              </div>

              {error && (
                <Alert variant="danger" className="mb-3">
                  {error}
                </Alert>
              )}

              <Form>
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}

                <div className="d-flex justify-content-between mt-4">
                  <Button
                    variant="outline-secondary"
                    disabled={step === 1 || loading}
                    onClick={handlePrevious}
                  >
                    Previous
                  </Button>

                  {step < 3 ? (
                    <Button
                      variant="primary"
                      onClick={handleNext}
                      disabled={loading}
                    >
                      {loading ? "Calculating..." : "Next"}
                    </Button>
                  ) : (
                    <Button
                      variant="success"
                      onClick={handleComplete}
                      disabled={loading}
                    >
                      {loading
                        ? "Saving..."
                        : "Complete Setup & Start Planning"}
                    </Button>
                  )}
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Onboarding;
