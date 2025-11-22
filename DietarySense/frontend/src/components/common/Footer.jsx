import React from "react";
import { Container, Row, Col } from "react-bootstrap";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark text-light mt-5 py-4">
      <Container>
        <Row>
          <Col md={6}>
            <h5 className="mb-3">🥗 DietarySense</h5>
            <p className="text-muted mb-0">
              Personalized dietary restriction meal planner for healthier
              living.
            </p>
          </Col>
          <Col md={6} className="text-md-end">
            <p className="text-muted mb-0">
              &copy; {currentYear} DietarySense. All rights reserved.
            </p>
            <small className="text-muted">
              Made with ❤️ for healthier eating habits
            </small>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
