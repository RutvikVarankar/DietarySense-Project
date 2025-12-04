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
import { spoonacularAPI } from "../../services/api";

const SpoonacularRecipeDetail = () => {
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
      console.log('Fetching recipe with ID:', id);
      const response = await spoonacularAPI.getRecipe(id);
      console.log('API Response:', response);

      // Handle the backend response structure: { success: true, data: recipeData, source: 'spoonacular' }
      if (response.data && response.data.success && response.data.data) {
        console.log('Setting recipe data from response.data.data:', response.data.data);
        setRecipe(response.data.data);
      } else if (response.data && response.data.success === false && response.data.note) {
        // Handle sample recipe case
        console.log('Sample recipe detected, setting data:', response.data.data);
        setRecipe(response.data.data);
      } else {
        // Fallback for direct API response
        console.log('Using fallback, setting response.data:', response.data);
        setRecipe(response.data);
      }
    } catch (err) {
      console.error('Recipe fetch error:', err);
      console.error('Error response:', err.response);
      setError(err.response?.data?.message || err.message || "Failed to fetch recipe details");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToMealPlan = () => {
    // Implement add to meal plan functionality
    alert("Add to meal plan functionality coming soon!");
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert("Please select a rating");
      return;
    }

    setSubmitting(true);
    try {
      // For Spoonacular recipes, we might want to store ratings locally
      // This would require a backend endpoint to save user ratings for external recipes
      alert("Rating submitted successfully!");
      setRating(0);
      setComment("");
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

  // Extract nutrition information from Spoonacular data
  const extractNutrition = (recipe) => {
    const nutrition = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
    };

    if (recipe.nutrition && recipe.nutrition.nutrients) {
      recipe.nutrition.nutrients.forEach((nutrient) => {
        switch (nutrient.name.toLowerCase()) {
          case "calories":
            nutrition.calories = Math.round(nutrient.amount);
            break;
          case "protein":
            nutrition.protein = Math.round(nutrient.amount);
            break;
          case "carbohydrates":
            nutrition.carbs = Math.round(nutrient.amount);
            break;
          case "fat":
            nutrition.fats = Math.round(nutrient.amount);
            break;
          case "fiber":
            nutrition.fiber = Math.round(nutrient.amount);
            break;
          case "sugar":
            nutrition.sugar = Math.round(nutrient.amount);
            break;
          case "sodium":
            nutrition.sodium = Math.round(nutrient.amount);
            break;
          default:
            break;
        }
      });
    }

    return nutrition;
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

  const nutrition = extractNutrition(recipe);

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

                    {recipe.summary && (
                      <p className="text-muted mb-3" dangerouslySetInnerHTML={{ __html: recipe.summary }} />
                    )}

                    {/* Dietary Tags */}
                    <div className="mb-3">
                      {recipe.diets?.map((diet) => (
                        <Badge
                          key={diet}
                          bg="outline-primary"
                          text="dark"
                          className="me-1 mb-1"
                        >
                          {diet}
                        </Badge>
                      ))}
                      {recipe.vegetarian && (
                        <Badge bg="outline-success" text="dark" className="me-1 mb-1">
                          Vegetarian
                        </Badge>
                      )}
                      {recipe.vegan && (
                        <Badge bg="outline-success" text="dark" className="me-1 mb-1">
                          Vegan
                        </Badge>
                      )}
                      {recipe.glutenFree && (
                        <Badge bg="outline-info" text="dark" className="me-1 mb-1">
                          Gluten Free
                        </Badge>
                      )}
                      {recipe.dairyFree && (
                        <Badge bg="outline-warning" text="dark" className="me-1 mb-1">
                          Dairy Free
                        </Badge>
                      )}
                    </div>

                    {/* Recipe Meta */}
                    <div className="row text-center mb-3">
                      <div className="col-4">
                        <div className="h5 text-primary mb-1">
                          {nutrition.calories || 'N/A'}
                        </div>
                        <small className="text-muted">Calories</small>
                      </div>
                      <div className="col-4">
                        <div className="h5 mb-1">
                          {formatTime(recipe.readyInMinutes)}
                        </div>
                        <small className="text-muted">Total Time</small>
                      </div>
                      <div className="col-4">
                        <div className="h5 mb-1">
                          {recipe.servings}
                        </div>
                        <small className="text-muted">Servings</small>
                      </div>
                    </div>

                    {/* Nutrition Info */}
                    <div className="bg-light rounded p-3 mb-3">
                      <h6 className="mb-2">Nutrition per Serving</h6>
                      <Row className="text-center">
                        <Col xs={3}>
                          <div className="fw-bold text-success">
                            {nutrition.protein}g
                          </div>
                          <small>Protein</small>
                        </Col>
                        <Col xs={3}>
                          <div className="fw-bold text-info">
                            {nutrition.carbs}g
                          </div>
                          <small>Carbs</small>
                        </Col>
                        <Col xs={3}>
                          <div className="fw-bold text-warning">
                            {nutrition.fats}g
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

                  <div className="mt-auto">
                    <div className="d-grid gap-2">
                      <Button variant="primary" onClick={handleAddToMealPlan}>
                        <i className="fas fa-plus me-2"></i>
                        Add to Meal Plan
                      </Button>
                      <Button variant="outline-success">
                        <i className="fas fa-shopping-cart me-2"></i>
                        Add to Grocery List
                      </Button>
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
                  {recipe.analyzedInstructions && recipe.analyzedInstructions.length > 0 ? (
                    <ol className="list-group list-group-numbered">
                      {recipe.analyzedInstructions[0].steps.map((step, index) => (
                        <li key={index} className="list-group-item border-0 px-0">
                          {step.step}
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted">No detailed instructions available</p>
                      {recipe.instructions && (
                        <div dangerouslySetInnerHTML={{ __html: recipe.instructions }} />
                      )}
                    </div>
                  )}
                </Tab>

                <Tab eventKey="ingredients" title="Ingredients">
                  <ListGroup variant="flush">
                    {recipe.extendedIngredients?.map((ingredient, index) => (
                      <ListGroup.Item
                        key={index}
                        className="d-flex justify-content-between align-items-center border-0 px-0"
                      >
                        <div>
                          <span className="fw-medium">{ingredient.original}</span>
                          {ingredient.aisle && (
                            <Badge bg="outline-secondary" className="ms-2">
                              {ingredient.aisle}
                            </Badge>
                          )}
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
                            {nutrition.calories}
                          </span>
                        </ListGroup.Item>
                        <ListGroup.Item className="d-flex justify-content-between border-0 px-0">
                          <span>Protein</span>
                          <span className="fw-bold text-success">
                            {nutrition.protein}g
                          </span>
                        </ListGroup.Item>
                        <ListGroup.Item className="d-flex justify-content-between border-0 px-0">
                          <span>Carbohydrates</span>
                          <span className="fw-bold text-info">
                            {nutrition.carbs}g
                          </span>
                        </ListGroup.Item>
                        <ListGroup.Item className="d-flex justify-content-between border-0 px-0">
                          <span>Fats</span>
                          <span className="fw-bold text-warning">
                            {nutrition.fats}g
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
                            {nutrition.fiber}g
                          </span>
                        </ListGroup.Item>
                        <ListGroup.Item className="d-flex justify-content-between border-0 px-0">
                          <span>Sugar</span>
                          <span className="fw-bold">
                            {nutrition.sugar}g
                          </span>
                        </ListGroup.Item>
                        <ListGroup.Item className="d-flex justify-content-between border-0 px-0">
                          <span>Sodium</span>
                          <span className="fw-bold">
                            {nutrition.sodium}mg
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
              <div className="text-center mb-3">
                <p className="text-muted">Rating system coming soon for external recipes</p>
              </div>

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
                <Button variant="outline-primary">
                  <i className="fas fa-print me-2"></i>
                  Print Recipe
                </Button>
                <Button variant="outline-success">
                  <i className="fas fa-share-alt me-2"></i>
                  Share Recipe
                </Button>
                <Button variant="outline-info">
                  <i className="fas fa-bookmark me-2"></i>
                  Save to Favorites
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* Recipe Source */}
          <Card className="border-0 shadow-sm mt-4 bg-light">
            <Card.Body>
              <h6 className="mb-2">📖 Recipe Source</h6>
              <p className="small text-muted mb-2">
                This recipe is provided by Spoonacular API
              </p>
              {recipe.sourceUrl && (
                <Button
                  variant="outline-primary"
                  size="sm"
                  href={recipe.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Original Recipe
                </Button>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SpoonacularRecipeDetail;
