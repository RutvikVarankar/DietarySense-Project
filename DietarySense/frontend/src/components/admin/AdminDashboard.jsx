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
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost:5000/api/admin/dashboard",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const data = await response.json();
      setStats(data.data);

      // Mock recent activity - replace with actual API
      setRecentActivity([
        {
          id: 1,
          type: "user",
          action: "registered",
          name: "John Doe",
          time: "2 minutes ago",
        },
        {
          id: 2,
          type: "recipe",
          action: "submitted",
          name: "Vegetable Curry",
          time: "15 minutes ago",
        },
        {
          id: 3,
          type: "recipe",
          action: "approved",
          name: "Greek Salad",
          time: "1 hour ago",
        },
        {
          id: 4,
          type: "user",
          action: "updated_profile",
          name: "Sarah Wilson",
          time: "2 hours ago",
        },
        {
          id: 5,
          type: "meal_plan",
          action: "created",
          name: "7-Day Plan",
          time: "3 hours ago",
        },
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    const icons = {
      user: "👤",
      recipe: "🍳",
      meal_plan: "📋",
    };
    return icons[type] || "📝";
  };

  const getActivityVariant = (action) => {
    const variants = {
      registered: "success",
      submitted: "warning",
      approved: "success",
      updated_profile: "info",
      created: "primary",
    };
    return variants[action] || "secondary";
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

          <Col xl={3} md={6} className="mb-3">
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="text-center">
                <div className="text-warning mb-2">
                  <i className="fas fa-chart-line fa-2x"></i>
                </div>
                <Card.Title className="h3">85%</Card.Title>
                <Card.Text className="text-muted">Engagement Rate</Card.Text>
                <Badge bg="success">+5.2%</Badge>
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

          {/* Recent Activity */}
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recent Activity</h5>
              <Button variant="outline-primary" size="sm">
                View All
              </Button>
            </Card.Header>
            <Card.Body className="p-0">
              {recentActivity.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <i className="fas fa-history fa-2x mb-2"></i>
                  <p>No recent activity</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="list-group-item d-flex align-items-center border-0 px-3 py-2"
                    >
                      <div className="me-3 fs-5">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="fw-medium">{activity.name}</span>
                          <Badge
                            bg={getActivityVariant(activity.action)}
                            className="text-capitalize"
                          >
                            {activity.action.replace("_", " ")}
                          </Badge>
                        </div>
                        <small className="text-muted">{activity.time}</small>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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

          {/* Quick Stats */}
          <Card className="border-0 shadow-sm mt-4 bg-light">
            <Card.Body>
              <h6 className="mb-3">🚀 Quick Stats</h6>
              <div className="row text-center">
                <div className="col-6 mb-2">
                  <div className="h5 text-primary mb-1">42</div>
                  <small className="text-muted">Active Today</small>
                </div>
                <div className="col-6 mb-2">
                  <div className="h5 text-success mb-1">156</div>
                  <small className="text-muted">This Week</small>
                </div>
                <div className="col-6">
                  <div className="h5 text-info mb-1">89%</div>
                  <small className="text-muted">Satisfaction</small>
                </div>
                <div className="col-6">
                  <div className="h5 text-warning mb-1">2.3k</div>
                  <small className="text-muted">Total Visits</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;
