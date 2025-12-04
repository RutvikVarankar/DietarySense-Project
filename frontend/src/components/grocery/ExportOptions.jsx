import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Alert,
} from "react-bootstrap";
import jsPDF from "jspdf";

const ExportOptions = ({ groceryItems, onBack }) => {
  const [exportFormat, setExportFormat] = useState("pdf");
  const [includePurchased, setIncludePurchased] = useState(false);
  const [groupByCategory, setGroupByCategory] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState("");

  const filteredItems = includePurchased
    ? groceryItems
    : groceryItems.filter((item) => !item.purchased);

  const getItemsByCategory = () => {
    const grouped = {};
    filteredItems.forEach((item) => {
      if (!grouped[item.category]) {
        grouped[item.category] = [];
      }
      grouped[item.category].push(item);
    });
    return grouped;
  };

  const generateTextExport = () => {
    let text = "GROCERY LIST\n";
    text += "=".repeat(50) + "\n\n";

    if (groupByCategory) {
      const itemsByCategory = getItemsByCategory();
      Object.keys(itemsByCategory).forEach((category) => {
        text += `${category.toUpperCase()}:\n`;
        text += "-".repeat(30) + "\n";
        itemsByCategory[category].forEach((item) => {
          const status = item.purchased ? "✓ " : "";
          text += `${status}${item.name} - ${item.quantity} ${item.unit}\n`;
        });
        text += "\n";
      });
    } else {
      filteredItems.forEach((item) => {
        const status = item.purchased ? "✓ " : "";
        text += `${status}${item.name} - ${item.quantity} ${item.unit}\n`;
      });
    }

    text += `\nTotal items: ${filteredItems.length}`;
    text += `\nGenerated on: ${new Date().toLocaleDateString()}`;

    return text;
  };

  const generateCSV = () => {
    let csv = "Item,Quantity,Unit,Category,Purchased\n";
    filteredItems.forEach((item) => {
      csv += `"${item.name}",${item.quantity},${item.unit},${item.category},${
        item.purchased ? "Yes" : "No"
      }\n`;
    });
    return csv;
  };

  const handleExport = async () => {
    if (filteredItems.length === 0) {
      alert("No items to export");
      return;
    }

    setExporting(true);

    try {
      // Simulate export process
      await new Promise((resolve) => setTimeout(resolve, 1500));

      let content, mimeType, filename;

      switch (exportFormat) {
        case "text":
          content = generateTextExport();
          mimeType = "text/plain";
          filename = "grocery-list.txt";
          break;
        case "csv":
          content = generateCSV();
          mimeType = "text/csv";
          filename = "grocery-list.csv";
          break;
        case "pdf":
          // Generate PDF using jsPDF
          const doc = new jsPDF();
          doc.setFontSize(20);
          doc.text("Grocery List", 20, 30);

          let yPosition = 50;
          doc.setFontSize(12);
          doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, yPosition);
          yPosition += 20;

          if (groupByCategory) {
            const itemsByCategory = getItemsByCategory();
            Object.keys(itemsByCategory).forEach((category) => {
              if (yPosition > 250) {
                doc.addPage();
                yPosition = 20;
              }
              doc.setFontSize(14);
              doc.text(`${category.toUpperCase()}:`, 20, yPosition);
              yPosition += 10;
              doc.setFontSize(10);
              itemsByCategory[category].forEach((item) => {
                const status = item.purchased ? "✓ " : "";
                const text = `${status}${item.name} - ${item.quantity} ${item.unit}`;
                doc.text(text, 30, yPosition);
                yPosition += 8;
              });
              yPosition += 10;
            });
          } else {
            filteredItems.forEach((item) => {
              if (yPosition > 270) {
                doc.addPage();
                yPosition = 20;
              }
              const status = item.purchased ? "✓ " : "";
              const text = `${status}${item.name} - ${item.quantity} ${item.unit}`;
              doc.text(text, 20, yPosition);
              yPosition += 8;
            });
          }

          doc.save("grocery-list.pdf");
          setExportSuccess(`Grocery list exported successfully as grocery-list.pdf`);
          setTimeout(() => setExportSuccess(""), 3000);
          return;
        default:
          return;
      }

      // Create and download file
      const blob = new Blob([content], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setExportSuccess(`Grocery list exported successfully as ${filename}`);

      // Auto-hide success message after 3 seconds
      setTimeout(() => setExportSuccess(""), 3000);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const handlePrint = () => {
    const printContent = generateTextExport();
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Grocery List</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #28a745; }
            .category { font-weight: bold; margin-top: 15px; }
            .item { margin-left: 20px; }
            .purchased { text-decoration: line-through; color: #6c757d; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>Grocery List</h1>
          <div class="no-print">
            <p><em>Printing your grocery list...</em></p>
          </div>
          <pre>${printContent}</pre>
          <div class="no-print">
            <br>
            <button onclick="window.print()">Print</button>
            <button onclick="window.close()">Close</button>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => window.close(), 1000);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const getExportStats = () => {
    const total = filteredItems.length;
    const purchased = filteredItems.filter((item) => item.purchased).length;
    const remaining = total - purchased;

    return { total, purchased, remaining };
  };

  const stats = getExportStats();

  return (
    <Container className="my-4">
      <Row className="justify-content-center">
        <Col lg={8}>
          <Card className="border-0 shadow">
            <Card.Header className="bg-success text-white py-3">
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="mb-0">Export Grocery List</h4>
                <Button variant="outline-light" size="sm" onClick={onBack}>
                  ← Back to List
                </Button>
              </div>
            </Card.Header>

            <Card.Body className="p-4">
              {/* Success Alert */}
              {exportSuccess && (
                <Alert variant="success" className="mb-4">
                  {exportSuccess}
                </Alert>
              )}

              {/* Export Stats */}
              <Card className="bg-light border-0 mb-4">
                <Card.Body>
                  <Row className="text-center">
                    <Col xs={4}>
                      <div className="h5 text-primary mb-1">{stats.total}</div>
                      <small className="text-muted">Total Items</small>
                    </Col>
                    <Col xs={4}>
                      <div className="h5 text-success mb-1">
                        {stats.purchased}
                      </div>
                      <small className="text-muted">Purchased</small>
                    </Col>
                    <Col xs={4}>
                      <div className="h5 text-warning mb-1">
                        {stats.remaining}
                      </div>
                      <small className="text-muted">Remaining</small>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Export Options */}
              <Row>
                <Col md={6}>
                  <Card className="border-0 bg-light mb-4">
                    <Card.Body>
                      <h6 className="mb-3">Export Format</h6>

                      <Form.Group className="mb-3">
                        {["pdf", "text", "csv"].map((format) => (
                          <Form.Check
                            key={format}
                            type="radio"
                            name="exportFormat"
                            id={`format-${format}`}
                            label={format.toUpperCase()}
                            value={format}
                            checked={exportFormat === format}
                            onChange={(e) => setExportFormat(e.target.value)}
                            className="mb-2"
                          />
                        ))}
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Check
                          type="checkbox"
                          id="include-purchased"
                          label="Include purchased items"
                          checked={includePurchased}
                          onChange={(e) =>
                            setIncludePurchased(e.target.checked)
                          }
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Check
                          type="checkbox"
                          id="group-by-category"
                          label="Group by category"
                          checked={groupByCategory}
                          onChange={(e) => setGroupByCategory(e.target.checked)}
                        />
                      </Form.Group>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6}>
                  <Card className="border-0 bg-light mb-4">
                    <Card.Body>
                      <h6 className="mb-3">Preview</h6>
                      <div
                        className="bg-white rounded p-3 small"
                        style={{
                          maxHeight: "200px",
                          overflowY: "auto",
                          fontFamily: "monospace",
                        }}
                      >
                        {generateTextExport()}
                      </div>
                    </Card.Body>
                  </Card>

                  {/* Quick Actions */}
                  <Card className="border-0 bg-light">
                    <Card.Body>
                      <h6 className="mb-3">Quick Actions</h6>
                      <div className="d-grid gap-2">
                        <Button
                          variant="success"
                          onClick={handleExport}
                          disabled={exporting || filteredItems.length === 0}
                        >
                          {exporting
                            ? "Exporting..."
                            : `Export as ${exportFormat.toUpperCase()}`}
                        </Button>

                        <Button
                          variant="outline-primary"
                          onClick={handlePrint}
                          disabled={filteredItems.length === 0}
                        >
                          <i className="fas fa-print me-2"></i>
                          Print List
                        </Button>

                        <Button
                          variant="outline-info"
                          onClick={() => {
                            navigator.clipboard.writeText(generateTextExport());
                            alert("Grocery list copied to clipboard!");
                          }}
                          disabled={filteredItems.length === 0}
                        >
                          <i className="fas fa-copy me-2"></i>
                          Copy to Clipboard
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* Format Descriptions */}
              <Card className="border-0 bg-light mt-4">
                <Card.Body>
                  <h6 className="mb-3">Format Information</h6>
                  <Row>
                    <Col md={4}>
                      <div className="text-center">
                        <div className="h4 text-danger">📄</div>
                        <h6>PDF</h6>
                        <small className="text-muted">
                          Best for printing and sharing. Professional format
                          with proper layout.
                        </small>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="text-center">
                        <div className="h4 text-primary">📝</div>
                        <h6>Text</h6>
                        <small className="text-muted">
                          Simple text format. Easy to read and edit in any text
                          editor.
                        </small>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="text-center">
                        <div className="h4 text-success">📊</div>
                        <h6>CSV</h6>
                        <small className="text-muted">
                          Spreadsheet format. Import into Excel, Google Sheets,
                          or other apps.
                        </small>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ExportOptions;
