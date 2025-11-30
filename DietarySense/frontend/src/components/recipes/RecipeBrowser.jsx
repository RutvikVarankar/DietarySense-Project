import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  InputGroup,
  Button,
  Alert,
  Spinner,
  Pagination,
} from "react-bootstrap";
import RecipeCard from "./RecipeCard";
import RecipeFilters from "./RecipeFilters";

const RecipeBrowser = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    dietaryTags: [],
    maxPrepTime: "",
    maxCookTime: "",
    difficulty: "",
    maxCalories: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    fetchRecipes();
  }, [filters, pagination.page]);

  const fetchRecipes = async () => {
    setLoading(true);
    setError("");

    try {
      // Map local filters to Spoonacular API parameters
      const spoonacularParams = new URLSearchParams();

      // Search query
      if (filters.search) {
        spoonacularParams.append("search", filters.search);
      }

      // Number of results (use pagination limit)
      spoonacularParams.append("number", pagination.limit.toString());

      // Map dietary tags to Spoonacular diet parameter
      // Spoonacular supports: vegetarian, vegan, gluten-free, dairy-free, etc.
      const dietMapping = {
        vegetarian: "vegetarian",
        vegan: "vegan",
        "gluten-free": "gluten-free",
        "dairy-free": "dairy-free",
        "low-carb": "low-carb",
        "high-protein": "high-protein"
      };

      const validDiets = filters.dietaryTags
        .map(tag => dietMapping[tag])
        .filter(Boolean);

      if (validDiets.length > 0) {
        spoonacularParams.append("diet", validDiets.join(","));
      }

      // Map intolerances (nut-free maps to tree-nut-free)
      const intoleranceMapping = {
        "nut-free": "tree-nut-free"
      };

      const validIntolerances = filters.dietaryTags
        .map(tag => intoleranceMapping[tag])
        .filter(Boolean);

      if (validIntolerances.length > 0) {
        spoonacularParams.append("intolerances", validIntolerances.join(","));
      }

      // Combine prep and cook time for maxReadyTime
      const maxTime = Math.max(
        parseInt(filters.maxPrepTime) || 0,
        parseInt(filters.maxCookTime) || 0
      );

      if (maxTime > 0) {
        spoonacularParams.append("maxReadyTime", maxTime.toString());
      }

      // Cuisine mapping (if any dietary tags match cuisine)
      const cuisineMapping = {
        // Add cuisine mappings if needed
      };

      const validCuisines = filters.dietaryTags
        .map(tag => cuisineMapping[tag])
        .filter(Boolean);

      if (validCuisines.length > 0) {
        spoonacularParams.append("cuisine", validCuisines.join(","));
      }

      const response = await fetch(
        `http://localhost:5000/api/spoonacular/recipes?${spoonacularParams}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch recipes from Spoonacular API");
      }

      const data = await response.json();

      if (data.success) {
        setRecipes(data.data);
        // Spoonacular doesn't provide total count/pagination info in the same way
        // We'll use the returned count and assume single page for now
        setPagination((prev) => ({
          ...prev,
          total: data.count,
          pages: 1, // Spoonacular API doesn't support pagination in the same way
        }));
      } else {
        throw new Error(data.message || "Failed to fetch recipes");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setFilters((prev) => ({ ...prev, search: e.target.value }));
  };

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRecipes();
  };

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      dietaryTags: [],
      maxPrepTime: "",
      maxCookTime: "",
      difficulty: "",
      maxCalories: "",
      sortBy: "createdAt",
      sortOrder: "desc",
    });
  };

  return (
    <Container className="my-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="bg-primary text-white rounded p-4">
            <h1 className="h2 mb-2">Recipe Collection</h1>
            <p className="mb-0 opacity-75">
              Discover delicious recipes tailored to your dietary needs
            </p>
          </div>
        </Col>
      </Row>

      <Row>
        {/* Filters Sidebar */}
        <Col lg={3} className="mb-4">
          <RecipeFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={clearFilters}
          />
        </Col>

        {/* Recipes Content */}
        <Col lg={9}>
          {/* Search Bar */}
          <div className="bg-white rounded shadow-sm p-3 mb-4">
            <Form onSubmit={handleSearchSubmit}>
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Search recipes by name or ingredient..."
                  value={filters.search}
                  onChange={handleSearchChange}
                />
                <Button variant="primary" type="submit">
                  <i className="fas fa-search me-1"></i>
                  Search
                </Button>
              </InputGroup>
            </Form>
          </div>

          {/* Results Header */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h5 className="mb-0">
                {pagination.total > 0
                  ? `${pagination.total} recipes found`
                  : "No recipes found"}
              </h5>
              {filters.search && (
                <small className="text-muted">
                  Search results for: "{filters.search}"
                </small>
              )}
            </div>

            <Form.Select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split("-");
                setFilters((prev) => ({ ...prev, sortBy, sortOrder }));
              }}
              style={{ width: "auto" }}
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="nutrition.calories-asc">
                Calories: Low to High
              </option>
              <option value="nutrition.calories-desc">
                Calories: High to Low
              </option>
              <option value="prepTime-asc">Prep Time: Short to Long</option>
              <option value="averageRating-desc">Highest Rated</option>
            </Form.Select>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="danger" className="mb-4">
              {error}
            </Alert>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Loading recipes...</p>
            </div>
          )}

          {/* Recipes Grid */}
          {!loading && (
            <>
              <Row>
                {recipes.map((recipe) => (
                  <Col key={recipe._id} xs={12} sm={6} xl={4} className="mb-4">
                    <RecipeCard recipe={recipe} />
                  </Col>
                ))}
              </Row>

              {/* No Results */}
              {recipes.length === 0 && !loading && (
                <div className="text-center py-5">
                  <i className="fas fa-utensils fa-3x text-muted mb-3"></i>
                  <h5 className="text-muted">No recipes found</h5>
                  <p className="text-muted">
                    Try adjusting your filters or search terms
                  </p>
                  <Button variant="outline-primary" onClick={clearFilters}>
                    Clear All Filters
                  </Button>
                </div>
              )}

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                  <Pagination>
                    <Pagination.Prev
                      disabled={pagination.page === 1}
                      onClick={() => handlePageChange(pagination.page - 1)}
                    />

                    {[...Array(pagination.pages)].map((_, index) => {
                      const page = index + 1;
                      if (
                        page === 1 ||
                        page === pagination.pages ||
                        (page >= pagination.page - 1 &&
                          page <= pagination.page + 1)
                      ) {
                        return (
                          <Pagination.Item
                            key={page}
                            active={page === pagination.page}
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </Pagination.Item>
                        );
                      } else if (
                        page === pagination.page - 2 ||
                        page === pagination.page + 2
                      ) {
                        return <Pagination.Ellipsis key={page} />;
                      }
                      return null;
                    })}

                    <Pagination.Next
                      disabled={pagination.page === pagination.pages}
                      onClick={() => handlePageChange(pagination.page + 1)}
                    />
                  </Pagination>
                </div>
              )}
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default RecipeBrowser;
