import React from "react";
import { Container, Row, Col, Card, Button, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: "🍎",
      title: "Personalized Nutrition",
      description:
        "Get customized meal plans based on your dietary restrictions and health goals.",
      color: "primary",
    },
    {
      icon: "📊",
      title: "Progress Tracking",
      description:
        "Monitor your nutrition intake and track your health journey with detailed analytics.",
      color: "success",
    },
    {
      icon: "🛒",
      title: "Smart Grocery Lists",
      description:
        "Automatically generate shopping lists from your meal plans.",
      color: "info",
    },
    {
      icon: "👥",
      title: "Community Recipes",
      description:
        "Discover and share recipes with our growing community of health-conscious users.",
      color: "warning",
    },
  ];

  const stats = [
    { number: "10,000+", label: "Healthy Recipes" },
    { number: "50,000+", label: "Happy Users" },
    { number: "95%", label: "Success Rate" },
    { number: "24/7", label: "Support" },
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="bg-primary text-white py-5">
        <Container>
          <Row className="align-items-center min-vh-50">
            <Col lg={6}>
              <h1 className="display-4 fw-bold mb-4">
                Eat Smart, Live Better with{" "}
                <span className="text-warning">DietarySense</span>
              </h1>
              <p className="lead mb-4">
                Your personalized dietary companion for managing restrictions,
                achieving goals, and enjoying delicious, healthy meals tailored
                just for you.
              </p>
              <div className="d-flex gap-3 flex-wrap">
                {user ? (
                  <Button
                    as={Link}
                    to="/dashboard"
                    variant="warning"
                    size="lg"
                    className="px-4"
                  >
                    Go to Dashboard
                  </Button>
                ) : (
                  <>
                    <Button
                      as={Link}
                      to="/register"
                      variant="warning"
                      size="lg"
                      className="px-4"
                    >
                      Get Started Free
                    </Button>
                    <Button
                      as={Link}
                      to="/login"
                      variant="outline-light"
                      size="lg"
                      className="px-4"
                    >
                      Sign In
                    </Button>
                  </>
                )}
                <Button variant="outline-light" size="lg" className="px-4">
                  Learn More
                </Button>
              </div>
            </Col>
            <Col lg={6} className="text-center">
              <div className="position-relative">
                <div
                  className="bg-warning rounded-circle d-inline-flex align-items-center justify-content-center mb-4"
                  style={{ width: "300px", height: "300px" }}
                >
                  <span className="display-1">🥗</span>
                </div>
                <Badge
                  bg="success"
                  className="position-absolute top-0 start-0 fs-6"
                >
                  🏆 #1 Rated
                </Badge>
                <Badge bg="info" className="position-absolute top-0 end-0 fs-6">
                  🌱 Vegan Friendly
                </Badge>
                <Badge
                  bg="danger"
                  className="position-absolute bottom-0 start-0 fs-6"
                >
                  🚀 Easy to Use
                </Badge>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Stats Section */}
      <section className="py-5 bg-light">
        <Container>
          <Row className="text-center">
            {stats.map((stat, index) => (
              <Col key={index} lg={3} md={6} className="mb-4">
                <div className="h2 text-primary fw-bold">{stat.number}</div>
                <div className="text-muted">{stat.label}</div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-5">
        <Container>
          <Row className="text-center mb-5">
            <Col>
              <h2 className="display-5 fw-bold mb-3">
                Why Choose DietarySense?
              </h2>
              <p className="lead text-muted">
                Comprehensive tools to support your health and dietary journey
              </p>
            </Col>
          </Row>
          <Row>
            {features.map((feature, index) => (
              <Col key={index} lg={6} className="mb-4">
                <Card className="border-0 shadow-sm h-100 feature-card">
                  <Card.Body className="p-4">
                    <div
                      className={`text-${feature.color} mb-3`}
                      style={{ fontSize: "3rem" }}
                    >
                      {feature.icon}
                    </div>
                    <Card.Title className="h4 mb-3">{feature.title}</Card.Title>
                    <Card.Text className="text-muted">
                      {feature.description}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-5 bg-dark text-white">
        <Container>
          <Row className="text-center">
            <Col lg={8} className="mx-auto">
              <h2 className="display-6 fw-bold mb-3">
                Ready to Transform Your Eating Habits?
              </h2>
              <p className="lead mb-4">
                Join thousands of users who have achieved their health goals
                with DietarySense
              </p>
              {!user && (
                <Button
                  as={Link}
                  to="/register"
                  variant="warning"
                  size="lg"
                  className="px-5"
                >
                  Start Your Journey Today
                </Button>
              )}
            </Col>
          </Row>
        </Container>
      </section>

      <style jsx>{`
        .min-vh-50 {
          min-height: 50vh;
        }
        .feature-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1) !important;
        }
      `}</style>
    </div>
  );
};

export default Home;
