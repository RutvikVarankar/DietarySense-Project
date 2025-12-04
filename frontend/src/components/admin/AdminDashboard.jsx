import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
  Spinner,
  Badge,
} from "react-bootstrap";
import AnalyticsCharts from "./AnalyticsCharts";
import { useAuth } from "../../context/AuthContext";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch dashboard stats
      const statsResponse = await fetch(
        "http://localhost:5000/api/admin/dashboard",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!statsResponse.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const statsData = await statsResponse.json();
      setStats(statsData.data);


    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="my-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading admin dashboard...</p>
      </Container>
    );
  }

  return (
    <Container className="my-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="bg-dark text-white rounded p-4">
            <h1 className="h2 mb-2">⚙️ Admin Dashboard</h1>
            <p className="mb-0 opacity-75">
              Welcome back, {user?.name}. Manage your DietarySense platform.
            </p>
          </div>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      {stats && (
        <Row className="mb-4">
          <Col xl={3} md={6} className="mb-3">
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="text-center">
                <div className="text-primary mb-2">
                  <i className="fas fa-users fa-2x"></i>
                </div>
                <Card.Title className="h3">
                  {stats.totals?.users || 0}
                </Card.Title>
                <Card.Text className="text-muted">Total Users</Card.Text>
                <Badge bg="success">+{stats.growth?.newUsers || 0} new</Badge>
              </Card.Body>
            </Card>
          </Col>

          <Col xl={3} md={6} className="mb-3">
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="text-center">
                <div className="text-success mb-2">
                  <i className="fas fa-utensils fa-2x"></i>
                </div>
                <Card.Title className="h3">
                  {stats.totals?.recipes || 0}
                </Card.Title>
                <Card.Text className="text-muted">Total Recipes</Card.Text>
                <Badge bg="warning">
                  {stats.totals?.pendingRecipes || 0} pending
                </Badge>
              </Card.Body>
            </Card>
          </Col>

          <Col xl={3} md={6} className="mb-3">
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="text-center">
                <div className="text-info mb-2">
                  <i className="fas fa-calendar-alt fa-2x"></i>
                </div>
                <Card.Title className="h3">
                  {stats.totals?.mealPlans || 0}
                </Card.Title>
                <Card.Text className="text-muted">Meal Plans</Card.Text>
                <Badge bg="info">Active</Badge>
              </Card.Body>
            </Card>
          </Col>


        </Row>
      )}

      <Row>
        {/* Analytics Charts */}
        <Col lg={8}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white">
              <h5 className="mb-0">📊 Platform Analytics</h5>
            </Card.Header>
            <Card.Body>
              <AnalyticsCharts />
            </Card.Body>
          </Card>


        </Col>

        {/* Quick Actions & System Status */}
        <Col lg={4}>
          {/* Quick Actions */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Quick Actions</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Button variant="primary" href="/admin/users">
                  <i className="fas fa-users me-2"></i>
                  Manage Users
                </Button>
                <Button variant="success" href="/admin/recipes">
                  <i className="fas fa-utensils me-2"></i>
                  Manage Recipes
                </Button>
                <Button variant="info" href="/admin/meal-plans">
                  <i className="fas fa-calendar-alt me-2"></i>
                  View Meal Plans
                </Button>
                <Button variant="warning">
                  <i className="fas fa-cog me-2"></i>
                  System Settings
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* System Status */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white">
              <h5 className="mb-0">System Status</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span>API Server</span>
                <Badge bg="success">Online</Badge>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span>Database</span>
                <Badge bg="success">Connected</Badge>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span>Storage</span>
                <Badge bg="warning">65% Used</Badge>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span>Uptime</span>
                <Badge bg="info">99.8%</Badge>
              </div>
            </Card.Body>
          </Card>

          {/* Dietary Preferences Distribution */}
          {stats?.dietaryStats && (
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white">
                <h5 className="mb-0">Dietary Preferences</h5>
              </Card.Header>
              <Card.Body>
                {stats.dietaryStats.map((stat) => (
                  <div
                    key={stat._id}
                    className="d-flex justify-content-between align-items-center mb-2"
                  >
                    <span className="text-capitalize">
                      {stat._id || "Not Specified"}
                    </span>
                    <Badge bg="primary">{stat.count} users</Badge>
                  </div>
                ))}
              </Card.Body>
            </Card>
          )}


        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;
