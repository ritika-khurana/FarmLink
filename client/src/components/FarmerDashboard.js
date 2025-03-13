import React, { useState, useEffect } from "react";
import { Card, Form, Button, Table, Badge } from "react-bootstrap";

const FarmerDashboard = ({ web3, accounts, contract }) => {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    productName: "",
    farmName: "",
    farmInfo: "",
    latitude: "",
    longitude: ""
  });
  
  useEffect(() => {
    loadFarmerProducts();
  }, []);
  
  const loadFarmerProducts = async () => {
    try {
      const productCount = await contract.methods.productCount().call();
      const farmerProducts = [];
      
      for (let i = 1; i <= productCount; i++) {
        const productDetails = await contract.methods.fetchProductDetails(i).call();
        
        if (productDetails.farmerID.toLowerCase() === accounts[0].toLowerCase()) {
          farmerProducts.push({
            id: i,
            name: productDetails.name,
            farmName: productDetails.farmName,
            state: parseInt(productDetails.state)
          });
        }
      }
      
      setProducts(farmerProducts);
    } catch (error) {
      console.error("Error loading farmer products:", error);
    }
  };
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await contract.methods.harvestItem(
        formData.productName,
        formData.farmName,
        formData.farmInfo,
        formData.latitude,
        formData.longitude
      ).send({ from: accounts[0] });
      
      // Reset form
      setFormData({
        productName: "",
        farmName: "",
        farmInfo: "",
        latitude: "",
        longitude: ""
      });
      
      // Reload products
      loadFarmerProducts();
      
      alert("Product harvested successfully!");
    } catch (error) {
      console.error("Error harvesting product:", error);
      alert("Error harvesting product. See console for details.");
    }
  };
  
  const processItem = async (id) => {
    try {
      await contract.methods.processItem(id).send({ from: accounts[0] });
      loadFarmerProducts();
      alert("Product processed successfully!");
    } catch (error) {
      console.error("Error processing product:", error);
      alert("Error processing product. See console for details.");
    }
  };
  
  const packItem = async (id) => {
    try {
      await contract.methods.packItem(id).send({ from: accounts[0] });
      loadFarmerProducts();
      alert("Product packed successfully!");
    } catch (error) {
      console.error("Error packing product:", error);
      alert("Error packing product. See console for details.");
    }
  };
  
  const sellItem = async (id) => {
    const price = prompt("Enter price in wei:", "1000000000000000000");
    if (!price) return;
    
    try {
      await contract.methods.sellItem(id, price).send({ from: accounts[0] });
      loadFarmerProducts();
      alert("Product set for sale successfully!");
    } catch (error) {
      console.error("Error selling product:", error);
      alert("Error selling product. See console for details.");
    }
  };
  
  const getStateText = (state) => {
    const states = [
      "Harvested",
      "Processed",
      "Packed",
      "For Sale",
      "Sold",
      "Shipped",
      "Received"
    ];
    
    return states[state] || "Unknown";
  };
  
  const getStateVariant = (state) => {
    const variants = [
      "secondary",
      "info",
      "warning",
      "danger",
      "success",
      "primary",
      "dark"
    ];
    
    return variants[state] || "secondary";
  };
  
  const renderActionButton = (product) => {
    switch (product.state) {
      case 0: // Harvested
        return (
          <Button variant="primary" size="sm" onClick={() => processItem(product.id)}>
            Process
          </Button>
        );
      case 1: // Processed
        return (
          <Button variant="primary" size="sm" onClick={() => packItem(product.id)}>
            Pack
          </Button>
        );
      case 2: // Packed
        return (
          <Button variant="primary" size="sm" onClick={() => sellItem(product.id)}>
            Sell
          </Button>
        );
      default:
        return null;
    }
  };
  
  return (
    <>
      <h2 className="mt-4">Farmers Dashboard</h2>
      
      <Card className="mb-4">
        <Card.Header as="h5" className="bg-success text-white">
          Register New Product
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Product Name</Form.Label>
              <Form.Control
                type="text"
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Farm Name</Form.Label>
              <Form.Control
                type="text"
                name="farmName"
                value={formData.farmName}
                onChange={handleChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Farm Information</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="farmInfo"
                value={formData.farmInfo}
                onChange={handleChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Latitude</Form.Label>
              <Form.Control
                type="text"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Longitude</Form.Label>
              <Form.Control
                type="text"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                required
              />
            </Form.Group>
            
            <Button variant="success" type="submit">
              Harvest Product
            </Button>
          </Form>
        </Card.Body>
      </Card>
      
      <Card>
        <Card.Header as="h5" className="bg-success text-white">
          Your Products
        </Card.Header>
        <Card.Body>
          {products.length === 0 ? (
            <p>No products found. Harvest a new product to get started.</p>
          ) : (
            <Table striped responsive>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Farm</th>
                  <th>State</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.id}</td>
                    <td>{product.name}</td>
                    <td>{product.farmName}</td>
                    <td>
                      <Badge bg={getStateVariant(product.state)}>
                        {getStateText(product.state)}
                      </Badge>
                    </td>
                    <td>{renderActionButton(product)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </>
  );
};

export default FarmerDashboard;