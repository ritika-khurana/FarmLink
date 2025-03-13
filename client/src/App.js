import React, { useState, useEffect } from "react";
import { Container, Alert, Row, Col } from "react-bootstrap";
import getWeb3 from "./utils/getWeb3";
import SupplyChainContract from "./contracts/SupplyChain.json";
import Navigation from "./components/Navigation";
import FarmerDashboard from "./components/FarmerDashboard";
import DistributorDashboard from "./components/DistributorDashboard";
import RetailerDashboard from "./components/RetailerDashboard";
import ConsumerDashboard from "./components/ConsumerDashboard";
import TrackProduct from "./components/TrackProduct";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [contract, setContract] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [activeTab, setActiveTab] = useState("track");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        // Get network provider and web3 instance
        const web3 = await getWeb3();
        
        // Get user accounts
        const accounts = await web3.eth.getAccounts();
        
        // Get contract instance
        const networkId = await web3.eth.net.getId();
        const deployedNetwork = SupplyChainContract.networks[networkId];
        
        if (!deployedNetwork) {
          throw new Error("Contract not deployed to detected network.");
        }
        
        const instance = new web3.eth.Contract(
          SupplyChainContract.abi,
          deployedNetwork.address
        );
        
        setWeb3(web3);
        setAccounts(accounts);
        setContract(instance);
        
        // Get user role
        const roleId = await instance.methods.roles(accounts[0]).call();
        setUserRole(parseInt(roleId));
        
        // Set active tab based on role
        if (parseInt(roleId) === 0) setActiveTab("farmer");
        else if (parseInt(roleId) === 1) setActiveTab("distributor");
        else if (parseInt(roleId) === 2) setActiveTab("retailer");
        else if (parseInt(roleId) === 3) setActiveTab("consumer");
        else setActiveTab("track");
        
        setLoading(false);
      } catch (error) {
        console.error("Error initializing app:", error);
        setError(error.message);
        setLoading(false);
      }
    };
    
    init();
  }, []);

  if (loading) {
    return (
      <Container className="mt-5">
        <Alert variant="info">Loading application...</Alert>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          Error: {error}
          <br />
          Please make sure you have MetaMask installed and connected to the correct network.
        </Alert>
      </Container>
    );
  }

  const renderDashboard = () => {
    switch (activeTab) {
      case "farmer":
        return <FarmerDashboard web3={web3} accounts={accounts} contract={contract} />;
      case "distributor":
        return <DistributorDashboard web3={web3} accounts={accounts} contract={contract} />;
      case "retailer":
        return <RetailerDashboard web3={web3} accounts={accounts} contract={contract} />;
      case "consumer":
        return <ConsumerDashboard web3={web3} accounts={accounts} contract={contract} />;
      default:
        return <TrackProduct web3={web3} accounts={accounts} contract={contract} />;
    }
  };

  return (
    <div className="App">
      <Navigation 
        account={accounts[0]} 
        role={userRole} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />
      
      <Container className="mt-4">
        <Row>
          <Col>
            <Alert variant="info">
              Your Account: {accounts[0]}
              <br />
              Role: {userRole === 0 ? "Farmer" : 
                    userRole === 1 ? "Distributor" : 
                    userRole === 2 ? "Retailer" : 
                    userRole === 3 ? "Consumer" : "No Role Assigned"}
            </Alert>
          </Col>
        </Row>
        
        {renderDashboard()}
      </Container>
      
      <footer className="bg-dark text-white mt-5 py-3">
        <Container className="text-center">
          <p className="mb-0">FarmLink © 2025 - Agricultural Supply Chain on Blockchain</p>
        </Container>
      </footer>
    </div>
  );
}

export default App;