import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Form,
  Badge,
  Alert,
  Spinner,
  Modal,
  Tabs,
  Tab,
} from "react-bootstrap";

const RecipeManagement = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRecipes, setSelectedRecipes] = useState([]);
  const [showActionModal, setShowActionModal] = useState(false);
  const [modalAction, setModalAction] = useState("");
  const [recipeToAction, setRecipeToAction] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/admin/recipes", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch recipes");
      }

      const data = await response.json();
      setRecipes(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch =
      recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "pending" && !recipe.isApproved) ||
      (statusFilter === "approved" && recipe.isApproved);

    return matchesSearch && matchesStatus;
  });

  const pendingRecipes = recipes.filter((recipe) => !recipe.isApproved);
  const approvedRecipes = recipes.filter((recipe) => recipe.isApproved);

  const handleRecipeAction = (recipe, action) => {
    setRecipeToAction(recipe);
    setModalAction(action);
    setShowActionModal(true);
  };

  const confirmRecipeAction = async () => {
    if (!recipeToAction) return;

    try {
      let endpoint = "";
      let method = "PUT";
      let body = null;

      switch (modalAction) {
        case "approve":
          endpoint = `approve`;
          break;
        case "reject":
          endpoint = `reject`;
          body = JSON.stringify({ reason: rejectionReason });
          break;
        case "delete":
          endpoint = "";
          method = "DELETE";
          break;
        default:
          return;
      }

      const response = await fetch(
        `http://localhost:5000/api/admin/recipes/${recipeToAction._id}/${endpoint}`,
        {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          ...(body && { body }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to ${modalAction} recipe`);
      }

      // Update local state
      if (modalAction === "delete") {
        setRecipes((prev) => prev.filter((r) => r._id !== recipeToAction._id));
      } else {
        const updatedRecipe = await response.json();
        setRecipes((prev) =>
          prev.map((r) =>
            r._id === recipeToAction._id ? updatedRecipe.data : r
          )
        );
      }

      setShowActionModal(false);
      setRecipeToAction(null);
      setRejectionReason("");
    } catch (err) {
      setError(err.message);
    }
  };

  const getStatusVariant = (recipe) => {
    if (!recipe.isApproved) return "warning";
    return recipe.rejectionReason ? "danger" : "success";
  };

  const getStatusText = (recipe) => {
    if (!recipe.isApproved) return "Pending Review";
    return recipe.rejectionReason ? "Rejected" : "Approved";
  };

  const getDifficultyVariant = (difficulty) => {
    const variants = {
      easy: "success",
      medium: "warning",
      hard: "danger",
    };
    return variants[difficulty] || "secondary";
  };

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const RecipeTable = ({ recipes: tableRecipes, showActions = true }) => (
    <div className="table-responsive">
      <Table hover className="mb-0">
        <thead className="bg-light">
          <tr>
            <th>Recipe</th>
            <th>Nutrition</th>
            <th>Time</th>
            <th>Difficulty</th>
            <th>Author</th>
            <th>Status</th>
            {showActions && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {tableRecipes.map((recipe) => (
            <tr key={recipe._id}>
              <td>
                <div>
                  <div className="fw-medium">{recipe.title}</div>
                  {recipe.description && (
                    <small
                      className="text-muted"
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {recipe.description}
                    </small>
                  )}
                  <div className="mt-1">
                    {recipe.dietaryTags?.slice(0, 3).map((tag) => (
                      <Badge
                        key={tag}
                        bg="outline-primary"
                        text="dark"
                        className="me-1 mb-1"
                        style={{ fontSize: "0.7rem" }}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </td>
              <td>
                <div className="small">
                  <div>
                    Calories: <strong>{recipe.nutrition.calories}</strong>
                  </div>
                  <div>
                    Protein: <strong>{recipe.nutrition.protein}g</strong>
                  </div>
                  <div>
                    Carbs: <strong>{recipe.nutrition.carbs}g</strong>
                  </div>
                </div>
              </td>
              <td>
                <div className="small">
                  <div>Prep: {formatTime(recipe.prepTime)}</div>
                  <div>Cook: {formatTime(recipe.cookTime)}</div>
                </div>
              </td>
              <td>
                <Badge bg={getDifficultyVariant(recipe.difficulty)}>
                  {recipe.difficulty}
                </Badge>
              </td>
              <td>
                <div className="small">
                  <div>{recipe.createdBy?.name || "Unknown"}</div>
                  <div className="text-muted">{recipe.createdBy?.email}</div>
                </div>
              </td>
              <td>
                <Badge bg={getStatusVariant(recipe)}>
                  {getStatusText(recipe)}
                </Badge>
                {recipe.rejectionReason && (
                  <div
                    className="small text-muted mt-1"
                    title={recipe.rejectionReason}
                  >
                    {recipe.rejectionReason.substring(0, 50)}...
                  </div>
                )}
              </td>
              {showActions && (
                <td>
                  <div className="d-flex gap-1">
                    <Button variant="outline-primary" size="sm">
                      <i className="fas fa-eye"></i>
                    </Button>
                    <Button
                      variant="outline-success"
                      size="sm"
                      onClick={() => handleRecipeAction(recipe, "approve")}
                      disabled={recipe.isApproved}
                    >
                      <i className="fas fa-check"></i>
                    </Button>
                    <Button
                      variant="outline-warning"
                      size="sm"
                      onClick={() => handleRecipeAction(recipe, "reject")}
                      disabled={!recipe.isApproved}
                    >
                      <i className="fas fa-times"></i>
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleRecipeAction(recipe, "delete")}
                    >
                      <i className="fas fa-trash"></i>
                    </Button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </Table>

      {tableRecipes.length === 0 && (
        <div className="text-center py-5 text-muted">
          <i className="fas fa-utensils fa-3x mb-3"></i>
          <p>No recipes found</p>
        </div>
      )}
    </div>
  );

  return (
    <Container className="my-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="bg-dark text-white rounded p-4">
            <h1 className="h2 mb-2">🍳 Recipe Management</h1>
            <p className="mb-0 opacity-75">
              Review, approve, and manage user-submitted recipes
            </p>
          </div>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Controls */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={6}>
              <Form.Control
                type="text"
                placeholder="Search recipes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Col>
            <Col md={3}>
              <Form.Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Recipes</option>
                <option value="pending">Pending Review</option>
                <option value="approved">Approved</option>
              </Form.Select>
            </Col>
            <Col md={3} className="d-flex gap-2">
              <Button variant="primary" className="ms-auto">
                <i className="fas fa-plus me-2"></i>
                Add Recipe
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Recipes Tabs */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-0 p-0">
          <Tabs defaultActiveKey="all" className="px-3 pt-3">
            <Tab eventKey="all" title={`All Recipes (${recipes.length})`}>
              <Card.Body className="p-0">
                {loading ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2">Loading recipes...</p>
                  </div>
                ) : (
                  <RecipeTable recipes={filteredRecipes} />
                )}
              </Card.Body>
            </Tab>
            <Tab
              eventKey="pending"
              title={`Pending Review (${pendingRecipes.length})`}
            >
              <Card.Body className="p-0">
                <RecipeTable recipes={pendingRecipes} />
              </Card.Body>
            </Tab>
            <Tab
              eventKey="approved"
              title={`Approved (${approvedRecipes.length})`}
            >
              <Card.Body className="p-0">
                <RecipeTable recipes={approvedRecipes} showActions={false} />
              </Card.Body>
            </Tab>
          </Tabs>
        </Card.Header>
      </Card>

      {/* Action Modal */}
      <Modal show={showActionModal} onHide={() => setShowActionModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalAction === "approve" && "Approve Recipe"}
            {modalAction === "reject" && "Reject Recipe"}
            {modalAction === "delete" && "Delete Recipe"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {recipeToAction && (
            <div>
              <p>
                {modalAction === "approve" &&
                  `Are you sure you want to approve "${recipeToAction.title}"?`}
                {modalAction === "reject" &&
                  `Are you sure you want to reject "${recipeToAction.title}"?`}
                {modalAction === "delete" &&
                  `Are you sure you want to permanently delete "${recipeToAction.title}"?`}
              </p>

              {modalAction === "reject" && (
                <Form.Group className="mt-3">
                  <Form.Label>Rejection Reason</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Please provide a reason for rejection..."
                    required
                  />
                </Form.Group>
              )}

              {(modalAction === "delete" || modalAction === "reject") && (
                <Alert variant="warning" className="mt-3">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {modalAction === "delete"
                    ? "This action cannot be undone. The recipe will be permanently deleted."
                    : "The author will be notified about the rejection reason."}
                </Alert>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowActionModal(false)}>
            Cancel
          </Button>
          <Button
            variant={
              modalAction === "approve"
                ? "success"
                : modalAction === "reject"
                ? "warning"
                : "danger"
            }
            onClick={confirmRecipeAction}
            disabled={modalAction === "reject" && !rejectionReason.trim()}
          >
            {modalAction === "approve" && "Approve Recipe"}
            {modalAction === "reject" && "Reject Recipe"}
            {modalAction === "delete" && "Delete Recipe"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default RecipeManagement;
