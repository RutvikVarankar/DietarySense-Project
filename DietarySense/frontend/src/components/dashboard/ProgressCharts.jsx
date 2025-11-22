import React, { useState, useEffect } from "react";
import { Card, Form, Row, Col } from "react-bootstrap";

const ProgressCharts = () => {
  const [timeRange, setTimeRange] = useState("week");
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockData = {
      week: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        calories: [1800, 1950, 2100, 1850, 2200, 1900, 1750],
        protein: [120, 135, 140, 125, 150, 130, 115],
        carbs: [200, 220, 240, 210, 250, 215, 190],
        fats: [60, 65, 70, 62, 75, 63, 58],
      },
      month: {
        labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
        calories: [1950, 2050, 1900, 2100],
        protein: [130, 140, 125, 145],
        carbs: [220, 235, 210, 240],
        fats: [65, 68, 62, 70],
      },
    };

    setChartData(mockData[timeRange]);
  }, [timeRange]);

  const SimpleBarChart = ({ data, target, title, color }) => {
    if (!data) return null;

    const maxValue = Math.max(...data, target);

    return (
      <div className="mb-4">
        <h6 className="text-muted mb-2">{title}</h6>
        <div className="d-flex align-items-end" style={{ height: "120px" }}>
          {data.map((value, index) => (
            <div
              key={index}
              className="d-flex flex-column align-items-center me-2"
              style={{ flex: 1 }}
            >
              <div
                className="rounded"
                style={{
                  backgroundColor: color,
                  height: `${(value / maxValue) * 100}px`,
                  width: "20px",
                  opacity: value > target ? 0.8 : 0.6,
                }}
              />
              <small className="text-muted mt-1">
                {chartData.labels[index]}
              </small>
            </div>
          ))}
        </div>
        <div className="mt-2 text-center">
          <small className="text-muted">
            Target: <strong>{target}</strong> | Avg:{" "}
            <strong>
              {Math.round(data.reduce((a, b) => a + b, 0) / data.length)}
            </strong>
          </small>
        </div>
      </div>
    );
  };

  const ProgressCircle = ({ percentage, label, color }) => (
    <div className="text-center">
      <div
        className="position-relative d-inline-flex align-items-center justify-content-center rounded-circle mb-2"
        style={{
          width: "80px",
          height: "80px",
          background: `conic-gradient(${color} ${
            percentage * 3.6
          }deg, #e9ecef 0deg)`,
        }}
      >
        <div
          className="bg-white rounded-circle d-flex align-items-center justify-content-center"
          style={{ width: "60px", height: "60px" }}
        >
          <span className="fw-bold" style={{ color }}>
            {percentage}%
          </span>
        </div>
      </div>
      <div className="small text-muted">{label}</div>
    </div>
  );

  if (!chartData) {
    return <div>Loading chart data...</div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="mb-0">Progress Overview</h6>
        <Form.Select
          size="sm"
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          style={{ width: "auto" }}
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </Form.Select>
      </div>

      {/* Progress Circles */}
      <Row className="text-center mb-4">
        <Col xs={6} className="mb-3">
          <ProgressCircle
            percentage={85}
            label="Calorie Goal"
            color="#007bff"
          />
        </Col>
        <Col xs={6} className="mb-3">
          <ProgressCircle
            percentage={92}
            label="Protein Goal"
            color="#28a745"
          />
        </Col>
        <Col xs={6}>
          <ProgressCircle percentage={78} label="Workouts" color="#6f42c1" />
        </Col>
        <Col xs={6}>
          <ProgressCircle
            percentage={65}
            label="Water Intake"
            color="#17a2b8"
          />
        </Col>
      </Row>

      {/* Bar Charts */}
      <SimpleBarChart
        data={chartData.calories}
        target={2000}
        title="Daily Calories"
        color="#007bff"
      />

      <SimpleBarChart
        data={chartData.protein}
        target={150}
        title="Protein (g)"
        color="#28a745"
      />

      {/* Weekly Summary */}
      <div className="bg-light rounded p-3 mt-3">
        <h6 className="text-muted mb-2">This Week's Summary</h6>
        <Row className="text-center">
          <Col xs={6} className="mb-2">
            <div className="small text-muted">Avg. Calories</div>
            <div className="fw-bold">
              {Math.round(
                chartData.calories.reduce((a, b) => a + b, 0) /
                  chartData.calories.length
              )}
            </div>
          </Col>
          <Col xs={6} className="mb-2">
            <div className="small text-muted">Goal Days</div>
            <div className="fw-bold">5/7</div>
          </Col>
          <Col xs={6}>
            <div className="small text-muted">Weight Change</div>
            <div className="fw-bold text-success">-0.8kg</div>
          </Col>
          <Col xs={6}>
            <div className="small text-muted">Consistency</div>
            <div className="fw-bold">85%</div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default ProgressCharts;
