import React, { useState, useEffect } from "react";
import { Card, Form, Row, Col, Spinner, Alert } from "react-bootstrap";
import api from "../../services/api";

const ProgressCharts = () => {
  const [timeRange, setTimeRange] = useState("week");
  const [chartData, setChartData] = useState(null);
  const [targets, setTargets] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeeklyProgress = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get("/nutrition/weekly-progress");
        const data = response.data.data;

        setChartData({
          labels: data.labels,
          calories: data.calories,
          protein: data.protein,
          carbs: data.carbs,
          fats: data.fats,
        });

        setTargets(data.targets);
      } catch (error) {
        console.error("Error fetching weekly progress:", error);
        setError("Failed to load progress data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchWeeklyProgress();
  }, [timeRange]);

  const SimpleBarChart = ({ data, target, title, color }) => {
    if (!data || !target) return null;

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
            percentage={Math.min(
              Math.round(
                (chartData.calories.reduce((a, b) => a + b, 0) /
                  chartData.calories.length /
                  (targets?.calories || 2000)) *
                  100
              ),
              100
            )}
            label="Calorie Goal"
            color="#007bff"
          />
        </Col>
        <Col xs={6} className="mb-3">
          <ProgressCircle
            percentage={Math.min(
              Math.round(
                (chartData.protein.reduce((a, b) => a + b, 0) /
                  chartData.protein.length /
                  (targets?.protein || 150)) *
                  100
              ),
              100
            )}
            label="Protein Goal"
            color="#28a745"
          />
        </Col>
      </Row>

      {/* Bar Charts */}
      <SimpleBarChart
        data={chartData.calories}
        target={targets?.calories || 2000}
        title="Daily Calories"
        color="#007bff"
      />

      <SimpleBarChart
        data={chartData.protein}
        target={targets?.protein || 150}
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
            <div className="fw-bold">
              {chartData.calories.filter(cal => cal >= (targets?.calories || 2000)).length}/7
            </div>
          </Col>
          <Col xs={6}>
            <div className="small text-muted">Weight Change</div>
            <div className="fw-bold text-success">N/A</div>
          </Col>
          <Col xs={6}>
            <div className="small text-muted">Consistency</div>
            <div className="fw-bold">
              {Math.round((chartData.calories.filter(cal => cal > 0).length / 7) * 100)}%
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default ProgressCharts;
