import React, { useState } from "react";
import { Card, Badge, Button, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const RecipeCard = ({ recipe }) => {
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/recipes/${recipe._id}`);
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: "success",
      medium: "warning",
      hard: "danger",
    };
    return colors[difficulty] || "secondary";
  };

  const getDietaryTagColor = (tag) => {
    const colors = {
      vegetarian: "success",
      vegan: "primary",
      "gluten-free": "info",
      "dairy-free": "warning",
      "nut-free": "danger",
      "low-carb": "secondary",
      "high-protein": "dark",
    };
    return colors[tag] || "outline-secondary";
  };

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={i} className="text-warning">
          ⭐
        </span>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <span key="half" className="text-warning">
          ⭐
        </span>
      );
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="text-muted">
          ⭐
        </span>
      );
    }

    return stars;
  };

  return (
    <Card
      className="h-100 border-0 shadow-sm recipe-card"
      style={{ cursor: "pointer" }}
      onClick={handleCardClick}
    >
      {/* Recipe Image */}
      <div
        className="position-relative"
        style={{ height: "200px", overflow: "hidden" }}
      >
        {recipe.image && !imageError ? (
          <Card.Img
            variant="top"
            src={recipe.image}
            alt={recipe.title}
            style={{
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.3s ease",
            }}
            onError={() => setImageError(true)}
            className="recipe-image"
          />
        ) : (
          <div className="d-flex align-items-center justify-content-center h-100 bg-light">
            <i className="fas fa-utensils fa-3x text-muted"></i>
          </div>
        )}

        {/* Difficulty Badge */}
        <Badge
          bg={getDifficultyColor(recipe.difficulty)}
          className="position-absolute top-0 end-0 m-2"
        >
          {recipe.difficulty}
        </Badge>

        {/* Rating Badge */}
        {recipe.averageRating > 0 && (
          <Badge bg="dark" className="position-absolute top-0 start-0 m-2">
            ⭐ {recipe.averageRating}
          </Badge>
        )}
      </div>

      <Card.Body className="d-flex flex-column">
        {/* Recipe Title */}
        <Card.Title
          className="h6 flex-grow-1"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {recipe.title}
        </Card.Title>

        {/* Description */}
        {recipe.description && (
          <Card.Text
            className="text-muted small mb-2"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {recipe.description}
          </Card.Text>
        )}

        {/* Dietary Tags */}
        <div className="mb-3">
          {recipe.dietaryTags?.slice(0, 3).map((tag) => (
            <Badge
              key={tag}
              bg={getDietaryTagColor(tag)}
              text={
                getDietaryTagColor(tag).includes("outline") ? "dark" : "white"
              }
              className="me-1 mb-1"
              style={{ fontSize: "0.65rem" }}
            >
              {tag}
            </Badge>
          ))}
          {recipe.dietaryTags?.length > 3 && (
            <Badge
              bg="outline-secondary"
              text="dark"
              style={{ fontSize: "0.65rem" }}
            >
              +{recipe.dietaryTags.length - 3}
            </Badge>
          )}
        </div>

        {/* Recipe Meta Information */}
        <Row className="text-center small text-muted mb-3">
          <Col xs={4}>
            <div className="fw-bold text-primary">
              {recipe.nutrition.calories}
            </div>
            <div>cal</div>
          </Col>
          <Col xs={4}>
            <div className="fw-bold">{formatTime(recipe.prepTime)}</div>
            <div>prep</div>
          </Col>
          <Col xs={4}>
            <div className="fw-bold">{formatTime(recipe.cookTime)}</div>
            <div>cook</div>
          </Col>
        </Row>

        {/* Nutrition Info */}
        <div className="bg-light rounded p-2 mb-3">
          <Row className="text-center small">
            <Col xs={3}>
              <div className="fw-bold text-success">
                {recipe.nutrition.protein}g
              </div>
              <div className="text-muted">protein</div>
            </Col>
            <Col xs={3}>
              <div className="fw-bold text-info">{recipe.nutrition.carbs}g</div>
              <div className="text-muted">carbs</div>
            </Col>
            <Col xs={3}>
              <div className="fw-bold text-warning">
                {recipe.nutrition.fats}g
              </div>
              <div className="text-muted">fats</div>
            </Col>
            <Col xs={3}>
              <div className="fw-bold text-secondary">{recipe.servings}</div>
              <div className="text-muted">servings</div>
            </Col>
          </Row>
        </div>

        {/* Rating and Actions */}
        <div className="d-flex justify-content-between align-items-center mt-auto">
          <div>
            {recipe.averageRating > 0 ? (
              <div className="d-flex align-items-center">
                <div className="me-1">{renderStars(recipe.averageRating)}</div>
                <small className="text-muted">({recipe.ratingCount})</small>
              </div>
            ) : (
              <small className="text-muted">No ratings yet</small>
            )}
          </div>

          <Button
            variant="outline-primary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
          >
            View
          </Button>
        </div>
      </Card.Body>

      <style jsx>{`
        .recipe-card {
          transition: all 0.3s ease;
        }
        .recipe-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
        }
        .recipe-card:hover .recipe-image {
          transform: scale(1.05);
        }
      `}</style>
    </Card>
  );
};

export default RecipeCard;
