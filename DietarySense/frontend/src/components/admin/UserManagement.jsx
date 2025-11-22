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
  InputGroup,
} from "react-bootstrap";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/admin/users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUserSelect = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUsers(filteredUsers.map((user) => user._id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    setActionLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/users/${userToDelete._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      setUsers((prev) => prev.filter((user) => user._id !== userToDelete._id));
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusVariant = (user) => {
    if (!user.isActive) return "danger";
    if (user.lastLogin) {
      const lastLogin = new Date(user.lastLogin);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return lastLogin < thirtyDaysAgo ? "warning" : "success";
    }
    return "secondary";
  };

  const getStatusText = (user) => {
    if (!user.isActive) return "Inactive";
    if (user.lastLogin) {
      const lastLogin = new Date(user.lastLogin);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return lastLogin < thirtyDaysAgo ? "Inactive" : "Active";
    }
    return "Never Logged In";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString();
  };

  const getDietaryPreference = (user) => {
    return user.profile?.dietaryPreference || "Not set";
  };

  return (
    <Container className="my-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="bg-dark text-white rounded p-4">
            <h1 className="h2 mb-2">👥 User Management</h1>
            <p className="mb-0 opacity-75">
              Manage user accounts and monitor activity
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
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button variant="outline-secondary">
                  <i className="fas fa-search"></i>
                </Button>
              </InputGroup>
            </Col>
            <Col md={6} className="d-flex gap-2">
              <Button variant="outline-primary">
                <i className="fas fa-download me-2"></i>
                Export
              </Button>
              <Button
                variant="outline-danger"
                disabled={selectedUsers.length === 0}
              >
                <i className="fas fa-trash me-2"></i>
                Bulk Delete ({selectedUsers.length})
              </Button>
              <Button variant="primary" className="ms-auto">
                <i className="fas fa-plus me-2"></i>
                Add User
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Users Table */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white">
          <h5 className="mb-0">Users ({filteredUsers.length})</h5>
        </Card.Header>

        {loading ? (
          <Card.Body className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Loading users...</p>
          </Card.Body>
        ) : (
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th>
                    <Form.Check
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={
                        selectedUsers.length === filteredUsers.length &&
                        filteredUsers.length > 0
                      }
                    />
                  </th>
                  <th>User</th>
                  <th>Dietary Preference</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <Form.Check
                        type="checkbox"
                        checked={selectedUsers.includes(user._id)}
                        onChange={() => handleUserSelect(user._id)}
                      />
                    </td>
                    <td>
                      <div>
                        <div className="fw-medium">{user.name}</div>
                        <small className="text-muted">{user.email}</small>
                        <div>
                          <Badge
                            bg={user.role === "admin" ? "danger" : "secondary"}
                            className="me-1"
                          >
                            {user.role}
                          </Badge>
                        </div>
                      </div>
                    </td>
                    <td>
                      <Badge bg="outline-primary" text="dark">
                        {getDietaryPreference(user)}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg={getStatusVariant(user)}>
                        {getStatusText(user)}
                      </Badge>
                    </td>
                    <td>
                      <small className="text-muted">
                        {formatDate(user.lastLogin)}
                      </small>
                    </td>
                    <td>
                      <small className="text-muted">
                        {formatDate(user.createdAt)}
                      </small>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <Button variant="outline-primary" size="sm">
                          <i className="fas fa-edit"></i>
                        </Button>
                        <Button
                          variant="outline-info"
                          size="sm"
                          title="View Profile"
                        >
                          <i className="fas fa-eye"></i>
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteUser(user)}
                          disabled={user.role === "admin"}
                        >
                          <i className="fas fa-trash"></i>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            {filteredUsers.length === 0 && (
              <div className="text-center py-5 text-muted">
                <i className="fas fa-users fa-3x mb-3"></i>
                <p>No users found</p>
                {searchTerm && (
                  <Button
                    variant="outline-primary"
                    onClick={() => setSearchTerm("")}
                  >
                    Clear Search
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {userToDelete && (
            <div>
              <p>Are you sure you want to delete the following user?</p>
              <div className="bg-light p-3 rounded">
                <strong>{userToDelete.name}</strong>
                <br />
                <small className="text-muted">{userToDelete.email}</small>
              </div>
              <Alert variant="warning" className="mt-3">
                <i className="fas fa-exclamation-triangle me-2"></i>
                This action cannot be undone. All user data including recipes
                and meal plans will be permanently deleted.
              </Alert>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteModal(false)}
            disabled={actionLoading}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={confirmDeleteUser}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Deleting...
              </>
            ) : (
              "Delete User"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UserManagement;
