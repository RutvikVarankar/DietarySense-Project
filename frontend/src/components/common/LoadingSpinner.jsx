import React from "react";
import { Spinner, Container } from "react-bootstrap";

const LoadingSpinner = ({
  size = "lg",
  variant = "primary",
  text = "Loading...",
  centered = true,
  overlay = false,
  fullScreen = false,
}) => {
  const spinnerContent = (
    <div
      className={`d-flex flex-column align-items-center ${
        centered ? "justify-content-center" : ""
      }`}
      style={fullScreen ? { minHeight: "100vh" } : {}}
    >
      <Spinner
        animation="border"
        variant={variant}
        size={size}
        role="status"
        style={{
          width: size === "lg" ? "3rem" : size === "sm" ? "1rem" : "2rem",
          height: size === "lg" ? "3rem" : size === "sm" ? "1rem" : "2rem",
        }}
      />
      {text && (
        <div className="mt-3">
          <span className={`text-${variant} fw-medium`}>{text}</span>
        </div>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div
        className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 9999,
          backdropFilter: "blur(4px)",
        }}
      >
        <div className="bg-white rounded p-4 shadow-lg">{spinnerContent}</div>
      </div>
    );
  }

  if (centered || fullScreen) {
    return (
      <Container fluid={fullScreen} className={fullScreen ? "p-0" : ""}>
        {spinnerContent}
      </Container>
    );
  }

  return spinnerContent;
};

// Specific loading components for common use cases
export const PageLoader = ({ message = "Loading page content..." }) => (
  <LoadingSpinner
    size="lg"
    variant="primary"
    text={message}
    centered={true}
    fullScreen={false}
  />
);

export const ContentLoader = ({ message = "Loading content..." }) => (
  <LoadingSpinner
    size="md"
    variant="secondary"
    text={message}
    centered={false}
    fullScreen={false}
  />
);

export const ButtonLoader = ({ variant = "light", size = "sm" }) => (
  <Spinner
    as="span"
    animation="border"
    size={size}
    variant={variant}
    role="status"
    aria-hidden="true"
    className="me-2"
  />
);

export const OverlayLoader = ({ message = "Processing..." }) => (
  <LoadingSpinner
    size="lg"
    variant="primary"
    text={message}
    centered={true}
    overlay={true}
  />
);

export const InlineLoader = () => (
  <Spinner
    animation="border"
    size="sm"
    variant="primary"
    role="status"
    aria-hidden="true"
    className="me-2"
  />
);

export default LoadingSpinner;
