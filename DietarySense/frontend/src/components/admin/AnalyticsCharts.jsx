import React, { useState, useEffect } from "react";
import { Card, Row, Col, Form, Button } from "react-bootstrap";

const AnalyticsCharts = () => {
  const [timeRange, setTimeRange] = useState("week");
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    // Mock data - replace with actual API calls
    const mockData = {
      week: {
        userGrowth: [45, 52, 48, 65, 72, 68, 80],
        recipeSubmissions: [12, 18, 15, 22, 25, 20, 28],
        mealPlansCreated: [8, 12, 10, 15, 18, 16, 22],
        activeUsers: [120, 135, 128, 142, 155, 148, 165],
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      },
      month: {
        userGrowth: [
          150, 180, 220, 250, 280, 320, 350, 380, 420, 450, 480, 520,
        ],
        recipeSubmissions: [45, 52, 60, 68, 75, 82, 88, 95, 102, 110, 118, 125],
        mealPlansCreated: [30, 35, 42, 48, 55, 60, 65, 72, 78, 85, 92, 98],
        activeUsers: [
          450, 480, 520, 550, 580, 620, 650, 680, 720, 750, 780, 820,
        ],
        labels: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ],
      },
    };

    setChartData(mockData[timeRange]);
  }, [timeRange]);

  const SimpleBarChart = ({ data, title, color, height = 120 }) => {
    if (!data) return null;

    const maxValue = Math.max(...data);

    return (
      <div className="mb-4">
        <h6 className="text-muted mb-2">{title}</h6>
        <div
          className="d-flex align-items-end"
          style={{ height: `${height}px` }}
        >
          {data.map((value, index) => (
            <div
              key={index}
              className="d-flex flex-column align-items-center me-1"
              style={{ flex: 1 }}
            >
              <div
                className="rounded"
                style={{
                  backgroundColor: color,
                  height: `${(value / maxValue) * 100}px`,
                  width: "12px",
                  opacity: 0.8,
                }}
                title={`${value}`}
              />
              <small className="text-muted mt-1" style={{ fontSize: "0.6rem" }}>
                {chartData.labels[index]}
              </small>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const ProgressMetric = ({ value, label, change, color = "primary" }) => (
    <div className="text-center">
      <div className={`h4 text-${color} mb-1`}>{value}</div>
      <div className="small text-muted">{label}</div>
      {change && (
        <div className={`small ${change > 0 ? "text-success" : "text-danger"}`}>
          {change > 0 ? "↗" : "↘"} {Math.abs(change)}%
        </div>
      )}
    </div>
  );

  const DoughnutChart = ({ data, title, colors }) => {
    if (!data) return null;

    const total = Object.values(data).reduce((sum, value) => sum + value, 0);

    return (
      <div className="text-center">
        <h6 className="text-muted mb-3">{title}</h6>
        <div
          className="position-relative d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
          style={{
            width: "120px",
            height: "120px",
            background: `conic-gradient(${colors.join(", ")})`,
          }}
        >
          <div
            className="bg-white rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: "80px", height: "80px" }}
          >
            <span className="fw-bold text-dark">{total}</span>
          </div>
        </div>
        <div className="small">
          {Object.entries(data).map(([key, value], index) => (
            <div
              key={key}
              className="d-flex justify-content-between align-items-center mb-1"
            >
              <span className="text-capitalize">{key}</span>
              <span className="fw-medium">{value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (!chartData) {
    return <div>Loading analytics...</div>;
  }

  return (
    <div>
      {/* Controls */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="mb-0">Platform Analytics</h5>
        <Form.Select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          style={{ width: "auto" }}
        >
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
        </Form.Select>
      </div>

      {/* Key Metrics */}
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="border-0 bg-primary text-white">
            <Card.Body className="text-center">
              <ProgressMetric
                value="1,254"
                label="Total Users"
                change={12.5}
                color="white"
              />
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="border-0 bg-success text-white">
            <Card.Body className="text-center">
              <ProgressMetric
                value="568"
                label="Recipes"
                change={8.2}
                color="white"
              />
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="border-0 bg-info text-white">
            <Card.Body className="text-center">
              <ProgressMetric
                value="892"
                label="Meal Plans"
                change={15.7}
                color="white"
              />
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="border-0 bg-warning text-white">
            <Card.Body className="text-center">
              <ProgressMetric
                value="78%"
                label="Engagement"
                change={3.2}
                color="white"
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* Growth Charts */}
        <Col lg={8}>
          <Card className="border-0 bg-light mb-4">
            <Card.Body>
              <Row>
                <Col md={6}>
                  <SimpleBarChart
                    data={chartData.userGrowth}
                    title="User Growth"
                    color="#007bff"
                    height={150}
                  />
                </Col>
                <Col md={6}>
                  <SimpleBarChart
                    data={chartData.recipeSubmissions}
                    title="Recipe Submissions"
                    color="#28a745"
                    height={150}
                  />
                </Col>
                <Col md={6}>
                  <SimpleBarChart
                    data={chartData.mealPlansCreated}
                    title="Meal Plans Created"
                    color="#17a2b8"
                    height={150}
                  />
                </Col>
                <Col md={6}>
                  <SimpleBarChart
                    data={chartData.activeUsers}
                    title="Active Users"
                    color="#ffc107"
                    height={150}
                  />
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Engagement Metrics */}
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white">
              <h6 className="mb-0">Engagement Metrics</h6>
            </Card.Header>
            <Card.Body>
              <Row className="text-center">
                <Col xs={6} md={3} className="mb-3">
                  <ProgressMetric
                    value="42%"
                    label="Daily Active"
                    change={2.1}
                  />
                </Col>
                <Col xs={6} md={3} className="mb-3">
                  <ProgressMetric
                    value="3.2"
                    label="Avg. Sessions"
                    change={0.5}
                  />
                </Col>
                <Col xs={6} md={3} className="mb-3">
                  <ProgressMetric
                    value="8.5m"
                    label="Avg. Duration"
                    change={1.2}
                  />
                </Col>
                <Col xs={6} md={3} className="mb-3">
                  <ProgressMetric
                    value="2.1%"
                    label="Bounce Rate"
                    change={-0.3}
                  />
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        {/* Distribution Charts */}
        <Col lg={4}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white">
              <h6 className="mb-0">User Distribution</h6>
            </Card.Header>
            <Card.Body>
              <DoughnutChart
                data={{
                  Active: 854,
                  Inactive: 320,
                  New: 80,
                }}
                title="User Status"
                colors={[
                  "#28a745 0% 70%",
                  "#ffc107 70% 90%",
                  "#17a2b8 90% 100%",
                ]}
              />
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white">
              <h6 className="mb-0">Dietary Preferences</h6>
            </Card.Header>
            <Card.Body>
              <DoughnutChart
                data={{
                  Vegetarian: 45,
                  Vegan: 25,
                  "Gluten-Free": 15,
                  "No Preference": 15,
                }}
                title="Diet Types"
                colors={[
                  "#28a745 0% 45%",
                  "#20c997 45% 70%",
                  "#fd7e14 70% 85%",
                  "#6c757d 85% 100%",
                ]}
              />
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white">
              <h6 className="mb-0">Recipe Status</h6>
            </Card.Header>
            <Card.Body>
              <DoughnutChart
                data={{
                  Approved: 420,
                  Pending: 85,
                  Rejected: 63,
                }}
                title="Recipe Status"
                colors={[
                  "#28a745 0% 74%",
                  "#ffc107 74% 89%",
                  "#dc3545 89% 100%",
                ]}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Additional Stats */}
      <Row className="mt-4">
        <Col md={6}>
          <Card className="border-0 bg-light">
            <Card.Body>
              <h6 className="mb-3">📈 Performance Highlights</h6>
              <div className="row text-center">
                <div className="col-4 mb-2">
                  <div className="h5 text-success mb-1">+28%</div>
                  <small className="text-muted">User Growth</small>
                </div>
                <div className="col-4 mb-2">
                  <div className="h5 text-primary mb-1">+15%</div>
                  <small className="text-muted">Engagement</small>
                </div>
                <div className="col-4 mb-2">
                  <div className="h5 text-warning mb-1">+42%</div>
                  <small className="text-muted">Content</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="border-0 bg-light">
            <Card.Body>
              <h6 className="mb-3">🎯 Goals & Targets</h6>
              <div className="row text-center">
                <div className="col-4 mb-2">
                  <div className="h5 mb-1">2,000</div>
                  <small className="text-muted">Target Users</small>
                </div>
                <div className="col-4 mb-2">
                  <div className="h5 mb-1">1,000</div>
                  <small className="text-muted">Target Recipes</small>
                </div>
                <div className="col-4 mb-2">
                  <div className="h5 mb-1">85%</div>
                  <small className="text-muted">Satisfaction</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AnalyticsCharts;
