import React, { useState, useEffect } from "react";
import { Card, Row, Col, Form, Button, Spinner, Alert } from "react-bootstrap";

const AnalyticsCharts = () => {
  const [timeRange, setTimeRange] = useState("week");
  const [chartData, setChartData] = useState(null);
  const [totals, setTotals] = useState(null);
  const [distributions, setDistributions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }

      const response = await fetch(
        `http://localhost:5000/api/admin/analytics?timeRange=${timeRange}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
          `Server error: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || "Failed to fetch analytics data");
      }

      const data = result.data;

      setChartData({
        userGrowth: data.charts.userGrowth,
        recipeSubmissions: data.charts.recipeSubmissions,
        mealPlansCreated: data.charts.mealPlansCreated,
        activeUsers: data.charts.activeUsers,
        labels: data.labels,
        engagement: data.engagement,
        performance: data.performance,
        targets: data.targets,
      });

      setTotals(data.totals);
      setDistributions(data.distributions);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching analytics data:", err);
    } finally {
      setLoading(false);
    }
  };

  const SimpleBarChart = ({ data, title, color, height = 120 }) => {
    if (!data || !chartData) return null;

    const maxValue = Math.max(...data) || 1; // Avoid division by zero

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
                {chartData.labels?.[index] || index + 1}
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
    // Process data if it's in array format (from aggregation)
    let processedData = data;
    if (Array.isArray(data)) {
      processedData = data.reduce((acc, item) => {
        const key = item._id || item.name || "Unknown";
        acc[key] = item.count || item.value || 1;
        return acc;
      }, {});
    }

    if (!processedData || Object.keys(processedData).length === 0) {
      return (
        <div className="text-center">
          <h6 className="text-muted mb-3">{title}</h6>
          <div className="text-muted small">No data available</div>
        </div>
      );
    }

    const entries = Object.entries(processedData);
    const total = entries.reduce((sum, [, value]) => sum + value, 0);

    // Generate conic-gradient based on data proportions
    const gradientStops = [];
    let cumulativePercent = 0;

    entries.forEach(([key, value], index) => {
      const percentage = (value / total) * 100;
      const color = colors[index % colors.length];
      gradientStops.push(`${color} ${cumulativePercent}% ${cumulativePercent + percentage}%`);
      cumulativePercent += percentage;
    });

    return (
      <div className="text-center">
        <h6 className="text-muted mb-3">{title}</h6>
        <div
          className="position-relative d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
          style={{
            width: "120px",
            height: "120px",
            background: `conic-gradient(${gradientStops.join(", ")})`,
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
          {entries.map(([key, value]) => (
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
                value={totals?.users?.toLocaleString() || "0"}
                label="Total Users"
                change={null}
                color="white"
              />
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="border-0 bg-success text-white">
            <Card.Body className="text-center">
              <ProgressMetric
                value={totals?.recipes?.toLocaleString() || "0"}
                label="Recipes"
                change={null}
                color="white"
              />
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="border-0 bg-info text-white">
            <Card.Body className="text-center">
              <ProgressMetric
                value={totals?.mealPlans?.toLocaleString() || "0"}
                label="Meal Plans"
                change={null}
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


        </Col>

        {/* Distribution Charts */}
        <Col lg={4}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white">
              <h6 className="mb-0">User Distribution</h6>
            </Card.Header>
            <Card.Body>
              <DoughnutChart
                data={distributions?.userDistribution || {}}
                title="User Distribution"
                colors={[
                  "#28a745",
                  "#6c757d",
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
                data={distributions?.dietary || []}
                title="Diet Types"
                colors={[
                  "#28a745",
                  "#20c997",
                  "#fd7e14",
                  "#6c757d",
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
                data={distributions?.recipeStatus || []}
                title="Recipe Status"
                colors={[
                  "#28a745",
                  "#ffc107",
                  "#dc3545",
                ]}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Additional Stats */}
      <Row className="mt-4">
        <Col md={12}>
          <Card className="border-0 bg-light">
            <Card.Body>
              <h6 className="mb-3">🎯 Goals & Targets</h6>
              <div className="row text-center">
                <div className="col-4 mb-2">
                  <div className="h5 mb-1">{chartData.targets?.users?.toLocaleString() || "0"}</div>
                  <small className="text-muted">Target Users</small>
                </div>
                <div className="col-4 mb-2">
                  <div className="h5 mb-1">{chartData.targets?.recipes?.toLocaleString() || "0"}</div>
                  <small className="text-muted">Target Recipes</small>
                </div>
                <div className="col-4 mb-2">
                  <div className="h5 mb-1">{chartData.targets?.satisfaction || "0%"}</div>
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
