import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Button,
  Alert,
  Spinner,
  Form,
  Tab,
  Tabs,
  ListGroup,
} from "react-bootstrap";

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRecipe();
  }, [id]);

  const fetchRecipe = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/recipes/${id}`);

      if (!response.ok) {
        throw new Error("Recipe not found");
      }

      const data = await response.json();
      setRecipe(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };





  const handlePrintRecipe = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/recipes/${id}/pdf`);

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${recipe.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error("Failed to download PDF");
      }
    } catch (err) {
      alert("Error downloading PDF: " + err.message);
    }
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert("Please select a rating");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/recipes/${id}/ratings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ rating, comment }),
        }
      );

      if (response.ok) {
        alert("Rating submitted successfully!");
        setRating(0);
        setComment("");
        fetchRecipe(); // Refresh recipe data
      } else {
        throw new Error("Failed to submit rating");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: "success",
      medium: "warning",
      hard: "danger",
    };
    return colors[difficulty] || "secondary";
  };

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours} hours ${mins} minutes` : `${hours} hours`;
  };

  const renderStars = (rating, interactive = false, onStarClick = null) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={i <= rating ? "text-warning" : "text-muted"}
          style={{
            cursor: interactive ? "pointer" : "default",
            fontSize: interactive ? "1.5rem" : "1rem",
          }}
          onClick={() => interactive && onStarClick && onStarClick(i)}
        >
          ⭐
        </span>
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <Container className="my-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading recipe...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-5">
        <Alert variant="danger">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
          <Button variant="primary" onClick={() => navigate("/recipes")}>
            Back to Recipes
          </Button>
        </Alert>
      </Container>
    );
  }

  if (!recipe) {
    return (
      <Container className="my-5 text-center">
        <Alert variant="warning">Recipe not found</Alert>
        <Button variant="primary" onClick={() => navigate("/recipes")}>
          Back to Recipes
        </Button>
      </Container>
    );
  }

  return (
    <Container className="my-4">
      {/* Back Button */}
      <Button
        variant="outline-primary"
        onClick={() => navigate("/recipes")}
        className="mb-3"
      >
        ← Back to Recipes
      </Button>

      <Row>
        {/* Recipe Image and Basic Info */}
        <Col lg={8}>
          <Card className="border-0 shadow-sm mb-4">
            <Row className="g-0">
              <Col md={6}>
                {recipe.image ? (
                  <img
                    src={recipe.image}
                    alt={recipe.title}
                    className="img-fluid rounded-start"
                    style={{
                      height: "300px",
                      width: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    className="d-flex align-items-center justify-content-center h-100 bg-light rounded-start"
                    style={{ height: "300px" }}
                  >
                    <i className="fas fa-utensils fa-3x text-muted"></i>
                  </div>
                )}
              </Col>
              <Col md={6}>
                <Card.Body className="h-100 d-flex flex-column">
                  <div>
                    <h1 className="h3 mb-2">{recipe.title}</h1>

                    {recipe.description && (
                      <p className="text-muted mb-3">{recipe.description}</p>
                    )}

                    {/* Dietary Tags */}
                    <div className="mb-3">
                      {recipe.dietaryTags?.map((tag) => (
                        <Badge
                          key={tag}
                          bg="outline-primary"
                          text="dark"
                          className="me-1 mb-1"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Recipe Meta */}
                    <div className="row text-center mb-3">
                      <div className="col-4">
                        <div className="h5 text-primary mb-1">
                          {recipe.nutrition.calories}
                        </div>
                        <small className="text-muted">Calories</small>
                      </div>
                      <div className="col-4">
                        <div className="h5 mb-1">
                          {formatTime(recipe.prepTime)}
                        </div>
                        <small className="text-muted">Prep Time</small>
                      </div>
                      <div className="col-4">
                        <Badge bg={getDifficultyColor(recipe.difficulty)}>
                          {recipe.difficulty}
                        </Badge>
                        <div className="mt-1">
                          <small className="text-muted">Difficulty</small>
                        </div>
                      </div>
                    </div>

                    {/* Nutrition Info */}
                    <div className="bg-light rounded p-3 mb-3">
                      <h6 className="mb-2">Nutrition per Serving</h6>
                      <Row className="text-center">
                        <Col xs={3}>
                          <div className="fw-bold text-success">
                            {recipe.nutrition.protein}g
                          </div>
                          <small>Protein</small>
                        </Col>
                        <Col xs={3}>
                          <div className="fw-bold text-info">
                            {recipe.nutrition.carbs}g
                          </div>
                          <small>Carbs</small>
                        </Col>
                        <Col xs={3}>
                          <div className="fw-bold text-warning">
                            {recipe.nutrition.fats}g
                          </div>
                          <small>Fats</small>
                        </Col>
                        <Col xs={3}>
                          <div className="fw-bold text-secondary">
                            {recipe.servings}
                          </div>
                          <small>Servings</small>
                        </Col>
                      </Row>
                    </div>
                  </div>


                </Card.Body>
              </Col>
            </Row>
          </Card>

          {/* Recipe Content Tabs */}
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <Tabs defaultActiveKey="instructions" className="mb-3">
                <Tab eventKey="instructions" title="Instructions">
                  <ol className="list-group list-group-numbered">
                    {recipe.instructions?.map((instruction, index) => (
                      <li key={index} className="list-group-item border-0 px-0">
                        {instruction.text.replace(/0$/, '')}
                        {instruction.duration && (
                          <Badge bg="light" text="dark" className="ms-2">
                            {instruction.duration}m
                          </Badge>
                        )}
                      </li>
                    ))}
                  </ol>
                </Tab>

                <Tab eventKey="ingredients" title="Ingredients">
                  <ListGroup variant="flush">
                    {recipe.ingredients?.map((ingredient, index) => (
                      <ListGroup.Item
                        key={index}
                        className="d-flex justify-content-between align-items-center border-0 px-0"
                      >
                        <div>
                          <span className="fw-medium">{ingredient.name}</span>
                          {ingredient.category && (
                            <Badge bg="outline-secondary" className="ms-2">
                              {ingredient.category}
                            </Badge>
                          )}
                        </div>
                        <div>
                          <span className="fw-bold">
                            {ingredient.quantity} {ingredient.unit}
                          </span>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </Tab>

                <Tab eventKey="nutrition" title="Detailed Nutrition">
                  <Row>
                    <Col md={6}>
                      <h6>Macronutrients</h6>
                      <ListGroup variant="flush">
                        <ListGroup.Item className="d-flex justify-content-between border-0 px-0">
                          <span>Calories</span>
                          <span className="fw-bold">
                            {recipe.nutrition.calories}
                          </span>
                        </ListGroup.Item>
                        <ListGroup.Item className="d-flex justify-content-between border-0 px-0">
                          <span>Protein</span>
                          <span className="fw-bold text-success">
                            {recipe.nutrition.protein}g
                          </span>
                        </ListGroup.Item>
                        <ListGroup.Item className="d-flex justify-content-between border-0 px-0">
                          <span>Carbohydrates</span>
                          <span className="fw-bold text-info">
                            {recipe.nutrition.carbs}g
                          </span>
                        </ListGroup.Item>
                        <ListGroup.Item className="d-flex justify-content-between border-0 px-0">
                          <span>Fats</span>
                          <span className="fw-bold text-warning">
                            {recipe.nutrition.fats}g
                          </span>
                        </ListGroup.Item>
                      </ListGroup>
                    </Col>
                    <Col md={6}>
                      <h6>Additional Info</h6>
                      <ListGroup variant="flush">
                        <ListGroup.Item className="d-flex justify-content-between border-0 px-0">
                          <span>Fiber</span>
                          <span className="fw-bold">
                            {recipe.nutrition.fiber || 0}g
                          </span>
                        </ListGroup.Item>
                        <ListGroup.Item className="d-flex justify-content-between border-0 px-0">
                          <span>Sugar</span>
                          <span className="fw-bold">
                            {recipe.nutrition.sugar || 0}g
                          </span>
                        </ListGroup.Item>
                        <ListGroup.Item className="d-flex justify-content-between border-0 px-0">
                          <span>Sodium</span>
                          <span className="fw-bold">
                            {recipe.nutrition.sodium || 0}mg
                          </span>
                        </ListGroup.Item>
                      </ListGroup>
                    </Col>
                  </Row>
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>

        {/* Sidebar */}
        <Col lg={4}>
          {/* Rating and Reviews */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white">
              <h6 className="mb-0">Ratings & Reviews</h6>
            </Card.Header>
            <Card.Body>
              {recipe.averageRating > 0 ? (
                <div className="text-center mb-3">
                  <div className="h2 text-warning mb-1">
                    {recipe.averageRating}
                  </div>
                  <div className="mb-2">
                    {renderStars(recipe.averageRating)}
                  </div>
                  <small className="text-muted">
                    Based on {recipe.ratingCount} reviews
                  </small>
                </div>
              ) : (
                <div className="text-center mb-3">
                  <p className="text-muted">No ratings yet</p>
                </div>
              )}

              {/* Add Rating Form */}
              <Form onSubmit={handleSubmitRating}>
                <Form.Group className="mb-3">
                  <Form.Label>Your Rating</Form.Label>
                  <div className="text-center">
                    {renderStars(rating, true, setRating)}
                  </div>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Your Review (Optional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience with this recipe..."
                  />
                </Form.Group>

                <Button
                  type="submit"
                  variant="warning"
                  disabled={submitting || rating === 0}
                  className="w-100"
                >
                  {submitting ? "Submitting..." : "Submit Review"}
                </Button>
              </Form>
            </Card.Body>
          </Card>

          {/* Quick Actions */}
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white">
              <h6 className="mb-0">Quick Actions</h6>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Button variant="outline-primary" onClick={handlePrintRecipe}>
                  <i className="fas fa-print me-2"></i>
                  Print Recipe
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* Cook's Notes */}
          <Card className="border-0 shadow-sm mt-4 bg-light">
            <Card.Body>
              <h6 className="mb-2">👨‍🍳 Cook's Tips</h6>
              <p className="small text-muted mb-0">
                • Make sure all ingredients are at room temperature for best
                results
                <br />
                • Don't overcook the vegetables to preserve nutrients
                <br />• Adjust seasoning according to your taste preferences
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default RecipeDetail;
