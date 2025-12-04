import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  Card,
  Badge,
  Spinner,
  Alert,
} from "react-bootstrap";
import api from "../../services/api";

const LogMealModal = ({ show, onHide, onMealLogged }) => {
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [mealType, setMealType] = useState("breakfast");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingRecipes, setFetchingRecipes] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (show) {
      fetchRecipes();
    }
  }, [show]);

  const fetchRecipes = async () => {
    setFetchingRecipes(true);
    try {
      const response = await api.get("/recipes?limit=20");
      setRecipes(response.data.data);
    } catch (error) {
      console.error("Error fetching recipes:", error);
      setError("Failed to load recipes. Please try again.");
    } finally {
      setFetchingRecipes(false);
    }
  };

  const handleLogMeal = async () => {
    if (!selectedRecipe) {
      setError("Please select a recipe to log.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const mealData = {
        mealType,
        recipeId: selectedRecipe._id,
        notes: notes.trim() || undefined,
      };

      await api.post("/nutrition/log-meal", mealData);

      // Reset form
      setSelectedRecipe(null);
      setMealType("breakfast");
      setNotes("");
      setError("");

      // Close modal and refresh dashboard
      onHide();
      onMealLogged();
    } catch (error) {
      console.error("Error logging meal:", error);
      setError(
        error.response?.data?.message || "Failed to log meal. Please try again."
      );
    } finally {
      setLoading(false);
    }
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

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Log New Meal</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        )}

        <Form>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Meal Type</Form.Label>
                <Form.Select
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value)}
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Notes (Optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  placeholder="Any additional notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  maxLength={500}
                />
                <Form.Text className="text-muted">
                  {notes.length}/500 characters
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Select Recipe</Form.Label>
            {fetchingRecipes ? (
              <div className="text-center py-4">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2">Loading recipes...</p>
              </div>
            ) : (
              <Row>
                {recipes.map((recipe) => (
                  <Col md={6} key={recipe._id} className="mb-3">
                    <Card
                      className={`cursor-pointer ${
                        selectedRecipe?._id === recipe._id
                          ? "border-primary"
                          : ""
                      }`}
                      onClick={() => setSelectedRecipe(recipe)}
                      style={{ cursor: "pointer" }}
                    >
                      <Card.Body className="p-3">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h6 className="mb-1">{recipe.title}</h6>
                          {selectedRecipe?._id === recipe._id && (
                            <Badge bg="primary">Selected</Badge>
                          )}
                        </div>
                        <p className="text-muted small mb-2">
                          {recipe.description?.substring(0, 60)}...
                        </p>
                        <div className="d-flex justify-content-between align-items-center">
                          <small className="text-muted">
                            {recipe.nutrition?.calories} cal
                          </small>
                          <Badge bg={getMealTypeBadge(mealType)}>
                            {mealType}
                          </Badge>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleLogMeal}
          disabled={loading || !selectedRecipe}
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
              Logging Meal...
            </>
          ) : (
            "Log Meal"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default LogMealModal;
