import React from "react";
import { Card, Form, Button, Badge, Accordion } from "react-bootstrap";

const RecipeFilters = ({ filters, onFilterChange, onClearFilters }) => {
  const dietaryOptions = [
    { value: "vegetarian", label: "Vegetarian" },
    { value: "vegan", label: "Vegan" },
    { value: "gluten-free", label: "Gluten-Free" },
    { value: "dairy-free", label: "Dairy-Free" },
    { value: "nut-free", label: "Nut-Free" },
    { value: "low-carb", label: "Low-Carb" },
    { value: "high-protein", label: "High-Protein" },
  ];

  const difficultyOptions = [
    { value: "easy", label: "Easy" },
    { value: "medium", label: "Medium" },
    { value: "hard", label: "Hard" },
  ];

  const timeRanges = [
    { value: "15", label: "≤ 15 min" },
    { value: "30", label: "≤ 30 min" },
    { value: "45", label: "≤ 45 min" },
    { value: "60", label: "≤ 60 min" },
  ];

  const calorieRanges = [
    { value: "200", label: "≤ 200 cal" },
    { value: "400", label: "≤ 400 cal" },
    { value: "600", label: "≤ 600 cal" },
    { value: "800", label: "≤ 800 cal" },
  ];

  const handleDietaryTagToggle = (tag) => {
    const newTags = filters.dietaryTags.includes(tag)
      ? filters.dietaryTags.filter((t) => t !== tag)
      : [...filters.dietaryTags, tag];

    onFilterChange({ dietaryTags: newTags });
  };

  const hasActiveFilters = () => {
    return (
      filters.dietaryTags.length > 0 ||
      filters.maxPrepTime ||
      filters.maxCookTime ||
      filters.difficulty ||
      filters.maxCalories
    );
  };

  return (
    <Card className="border-0 shadow-sm">
      <Card.Header className="bg-white d-flex justify-content-between align-items-center">
        <h6 className="mb-0">Filters</h6>
        {hasActiveFilters() && (
          <Button variant="outline-danger" size="sm" onClick={onClearFilters}>
            Clear
          </Button>
        )}
      </Card.Header>

      <Card.Body>
        <Accordion defaultActiveKey={["0", "1", "2", "3"]} alwaysOpen>
          {/* Dietary Preferences */}
          <Accordion.Item eventKey="0">
            <Accordion.Header>Dietary Preferences</Accordion.Header>
            <Accordion.Body>
              <div className="d-flex flex-wrap gap-1">
                {dietaryOptions.map((option) => (
                  <Badge
                    key={option.value}
                    bg={
                      filters.dietaryTags.includes(option.value)
                        ? "primary"
                        : "outline-primary"
                    }
                    text={
                      filters.dietaryTags.includes(option.value)
                        ? "white"
                        : "dark"
                    }
                    style={{ cursor: "pointer" }}
                    onClick={() => handleDietaryTagToggle(option.value)}
                    className="p-2 mb-1"
                  >
                    {option.label}
                  </Badge>
                ))}
              </div>
            </Accordion.Body>
          </Accordion.Item>

          {/* Preparation Time */}
          <Accordion.Item eventKey="1">
            <Accordion.Header>Preparation Time</Accordion.Header>
            <Accordion.Body>
              <Form.Group>
                <Form.Label className="small">Max Prep Time</Form.Label>
                <Form.Select
                  value={filters.maxPrepTime}
                  onChange={(e) =>
                    onFilterChange({ maxPrepTime: e.target.value })
                  }
                  size="sm"
                >
                  <option value="">Any time</option>
                  {timeRanges.map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mt-2">
                <Form.Label className="small">Max Cook Time</Form.Label>
                <Form.Select
                  value={filters.maxCookTime}
                  onChange={(e) =>
                    onFilterChange({ maxCookTime: e.target.value })
                  }
                  size="sm"
                >
                  <option value="">Any time</option>
                  {timeRanges.map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Accordion.Body>
          </Accordion.Item>

          {/* Nutrition */}
          <Accordion.Item eventKey="2">
            <Accordion.Header>Nutrition</Accordion.Header>
            <Accordion.Body>
              <Form.Group>
                <Form.Label className="small">Max Calories</Form.Label>
                <Form.Select
                  value={filters.maxCalories}
                  onChange={(e) =>
                    onFilterChange({ maxCalories: e.target.value })
                  }
                  size="sm"
                >
                  <option value="">Any calories</option>
                  {calorieRanges.map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Accordion.Body>
          </Accordion.Item>

          {/* Difficulty */}
          <Accordion.Item eventKey="3">
            <Accordion.Header>Difficulty</Accordion.Header>
            <Accordion.Body>
              <div className="d-flex flex-column gap-2">
                {difficultyOptions.map((option) => (
                  <Form.Check
                    key={option.value}
                    type="radio"
                    name="difficulty"
                    id={`difficulty-${option.value}`}
                    label={option.label}
                    value={option.value}
                    checked={filters.difficulty === option.value}
                    onChange={(e) =>
                      onFilterChange({ difficulty: e.target.value })
                    }
                  />
                ))}
                <Form.Check
                  type="radio"
                  name="difficulty"
                  id="difficulty-any"
                  label="Any difficulty"
                  value=""
                  checked={!filters.difficulty}
                  onChange={(e) =>
                    onFilterChange({ difficulty: e.target.value })
                  }
                />
              </div>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>

        {/* Active Filters Summary */}
        {hasActiveFilters() && (
          <div className="mt-3 pt-3 border-top">
            <h6 className="small text-muted mb-2">Active Filters:</h6>
            <div className="d-flex flex-wrap gap-1">
              {filters.dietaryTags.map((tag) => (
                <Badge key={tag} bg="primary" className="small">
                  {dietaryOptions.find((opt) => opt.value === tag)?.label}
                  <button
                    className="btn-close btn-close-white ms-1"
                    style={{ fontSize: "0.6rem" }}
                    onClick={() => handleDietaryTagToggle(tag)}
                  ></button>
                </Badge>
              ))}

              {filters.maxPrepTime && (
                <Badge bg="info" className="small">
                  Prep: ≤{filters.maxPrepTime}m
                  <button
                    className="btn-close btn-close-white ms-1"
                    style={{ fontSize: "0.6rem" }}
                    onClick={() => onFilterChange({ maxPrepTime: "" })}
                  ></button>
                </Badge>
              )}

              {filters.maxCookTime && (
                <Badge bg="info" className="small">
                  Cook: ≤{filters.maxCookTime}m
                  <button
                    className="btn-close btn-close-white ms-1"
                    style={{ fontSize: "0.6rem" }}
                    onClick={() => onFilterChange({ maxCookTime: "" })}
                  ></button>
                </Badge>
              )}

              {filters.difficulty && (
                <Badge bg="warning" className="small">
                  {filters.difficulty}
                  <button
                    className="btn-close btn-close-white ms-1"
                    style={{ fontSize: "0.6rem" }}
                    onClick={() => onFilterChange({ difficulty: "" })}
                  ></button>
                </Badge>
              )}

              {filters.maxCalories && (
                <Badge bg="success" className="small">
                  ≤{filters.maxCalories} cal
                  <button
                    className="btn-close btn-close-white ms-1"
                    style={{ fontSize: "0.6rem" }}
                    onClick={() => onFilterChange({ maxCalories: "" })}
                  ></button>
                </Badge>
              )}
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default RecipeFilters;
