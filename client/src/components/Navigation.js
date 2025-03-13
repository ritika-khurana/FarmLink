import React from "react";
import { Navbar, Nav, Container } from "react-bootstrap";

const Navigation = ({ account, role, activeTab, setActiveTab }) => {
  return (
    <Navbar bg="success" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand href="#home">FarmLink</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link 
              href="#farmer" 
              active={activeTab === "farmer"}
              onClick={() => setActiveTab("farmer")}
            >
              Farmers
            </Nav.Link>
            <Nav.Link 
              href="#distributor" 
              active={activeTab === "distributor"}
              onClick={() => setActiveTab("distributor")}
            >
              Distributors
            </Nav.Link>
            <Nav.Link 
              href="#retailer" 
              active={activeTab === "retailer"}
              onClick={() => setActiveTab("retailer")}
            >
              Retailers
            </Nav.Link>
            <Nav.Link 
              href="#consumer" 
              active={activeTab === "consumer"}
              onClick={() => setActiveTab("consumer")}
            >
              Consumers
            </Nav.Link>
            <Nav.Link 
              href="#track" 
              active={activeTab === "track"}
              onClick={() => setActiveTab("track")}
            >
              Track Product
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;