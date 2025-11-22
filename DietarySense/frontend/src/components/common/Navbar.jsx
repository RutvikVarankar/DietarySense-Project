import React from "react";
import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { useAuth } from "../../context/AuthContext";

const NavigationBar = () => {
  const { user, logout } = useAuth();

  return (
    <Navbar expand="lg" className="dietarysense-navbar sticky-top">
      <Container>
        <Navbar.Brand href="/" className="fw-bold text-white">
          🥗 DietarySense
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <LinkContainer to="/dashboard">
              <Nav.Link className="text-white">📊 Dashboard</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/meal-planner">
              <Nav.Link className="text-white">📋 Meal Planner</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/recipes">
              <Nav.Link className="text-white">🍳 Recipes</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/grocery-list">
              <Nav.Link className="text-white">🛒 Grocery List</Nav.Link>
            </LinkContainer>

            {/* Admin Links */}
            {user?.role === "admin" && (
              <NavDropdown
                title="⚙️ Admin"
                id="admin-nav-dropdown"
                className="text-white"
              >
                <LinkContainer to="/admin">
                  <NavDropdown.Item>Dashboard</NavDropdown.Item>
                </LinkContainer>
                <LinkContainer to="/admin/users">
                  <NavDropdown.Item>User Management</NavDropdown.Item>
                </LinkContainer>
                <LinkContainer to="/admin/recipes">
                  <NavDropdown.Item>Recipe Management</NavDropdown.Item>
                </LinkContainer>
              </NavDropdown>
            )}
          </Nav>

          <Nav>
            <NavDropdown
              title={<span className="text-white">👤 {user?.name}</span>}
              id="user-nav-dropdown"
              align="end"
            >
              <LinkContainer to="/dashboard">
                <NavDropdown.Item>My Profile</NavDropdown.Item>
              </LinkContainer>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={logout}>🚪 Logout</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;
