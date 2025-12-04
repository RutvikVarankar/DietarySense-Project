import React, { useState } from "react";
import { Container, Row, Col, Card, Nav } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import AdminDashboard from "../components/admin/AdminDashboard";
import UserManagement from "../components/admin/UserManagement";
import RecipeManagement from "../components/admin/RecipeManagement";

const Admin = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Redirect non-admin users
  if (user?.role !== "admin") {
    return (
      <Container className="my-5 text-center">
        <Card className="border-0 shadow-sm">
          <Card.Body className="py-5">
            <i className="fas fa-lock fa-3x text-muted mb-3"></i>
            <h3 className="text-muted">Access Denied</h3>
            <p className="text-muted">
              You don't have permission to access the admin panel.
            </p>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <AdminDashboard />;
      case "users":
        return <UserManagement />;
      case "recipes":
        return <RecipeManagement />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <Container fluid className="my-4">
      <Row>
        {/* Sidebar */}
        <Col lg={2} className="mb-4">
          <Card
            className="border-0 shadow-sm sticky-top"
            style={{ top: "100px" }}
          >
            <Card.Header className="bg-dark text-white">
              <h6 className="mb-0">Admin Panel</h6>
            </Card.Header>
            <Card.Body className="p-0">
              <Nav variant="pills" className="flex-column">
                <Nav.Item>
                  <Nav.Link
                    active={activeTab === "dashboard"}
                    onClick={() => setActiveTab("dashboard")}
                    className="border-0 rounded-0"
                  >
                    <i className="fas fa-tachometer-alt me-2"></i>
                    Dashboard
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link
                    active={activeTab === "users"}
                    onClick={() => setActiveTab("users")}
                    className="border-0 rounded-0"
                  >
                    <i className="fas fa-users me-2"></i>
                    User Management
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link
                    active={activeTab === "recipes"}
                    onClick={() => setActiveTab("recipes")}
                    className="border-0 rounded-0"
                  >
                    <i className="fas fa-utensils me-2"></i>
                    Recipe Management
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link
                    active={activeTab === "analytics"}
                    onClick={() => setActiveTab("analytics")}
                    className="border-0 rounded-0"
                  >
                    <i className="fas fa-chart-bar me-2"></i>
                    Analytics
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link
                    active={activeTab === "settings"}
                    onClick={() => setActiveTab("settings")}
                    className="border-0 rounded-0"
                  >
                    <i className="fas fa-cog me-2"></i>
                    Settings
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Card.Body>
          </Card>
        </Col>

        {/* Main Content */}
        <Col lg={10}>{renderContent()}</Col>
      </Row>
    </Container>
  );
};

export default Admin;
