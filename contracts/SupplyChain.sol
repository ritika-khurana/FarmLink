// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SupplyChain {
    // Define roles
    enum Role { Farmer, Distributor, Retailer, Consumer }
    
    // State variables for product
    enum State { Harvested, Processed, Packed, ForSale, Sold, Shipped, Received }
    
    // Product struct
    struct Product {
        uint id;
        string name;
        uint price;
        State state;
        address payable farmerID;
        address distributorID;
        address retailerID;
        address consumerID;
        string farmName;
        string farmInfo;
        string latitude;
        string longitude;
    }
    
    // Mappings
    mapping (uint => Product) public products;
    mapping (address => Role) public roles;
    
    // Events
    event Harvested(uint productID);
    event Processed(uint productID);
    event Packed(uint productID);
    event ForSale(uint productID, uint price);
    event Sold(uint productID);
    event Shipped(uint productID);
    event Received(uint productID);
    
    // Product counter
    uint public productCount = 0;
    
    // Owner
    address public owner;
    
    constructor() {
        owner = msg.sender;
    }
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }
    
    modifier onlyFarmer() {
        require(roles[msg.sender] == Role.Farmer, "Not a farmer");
        _;
    }
    
    modifier onlyDistributor() {
        require(roles[msg.sender] == Role.Distributor, "Not a distributor");
        _;
    }
    
    modifier onlyRetailer() {
        require(roles[msg.sender] == Role.Retailer, "Not a retailer");
        _;
    }
    
    modifier onlyConsumer() {
        require(roles[msg.sender] == Role.Consumer, "Not a consumer");
        _;
    }
    
    // Role management
    function addFarmer(address _address) public onlyOwner {
        roles[_address] = Role.Farmer;
    }
    
    function addDistributor(address _address) public onlyOwner {
        roles[_address] = Role.Distributor;
    }
    
    function addRetailer(address _address) public onlyOwner {
        roles[_address] = Role.Retailer;
    }
    
    function addConsumer(address _address) public onlyOwner {
        roles[_address] = Role.Consumer;
    }
    
    // Product functions
    function harvestItem(
        string memory _name,
        string memory _farmName,
        string memory _farmInfo,
        string memory _latitude,
        string memory _longitude
    ) public onlyFarmer {
        productCount++;
        products[productCount] = Product({
            id: productCount,
            name: _name,
            price: 0,
            state: State.Harvested,
            farmerID: payable(msg.sender),
            distributorID: address(0),
            retailerID: address(0),
            consumerID: address(0),
            farmName: _farmName,
            farmInfo: _farmInfo,
            latitude: _latitude,
            longitude: _longitude
        });
        
        emit Harvested(productCount);
    }
    
    function processItem(uint _productId) public onlyFarmer {
        require(products[_productId].state == State.Harvested, "Product not harvested");
        require(products[_productId].farmerID == msg.sender, "Not the farmer of this product");
        
        products[_productId].state = State.Processed;
        emit Processed(_productId);
    }
    
    function packItem(uint _productId) public onlyFarmer {
        require(products[_productId].state == State.Processed, "Product not processed");
        require(products[_productId].farmerID == msg.sender, "Not the farmer of this product");
        
        products[_productId].state = State.Packed;
        emit Packed(_productId);
    }
    
    function sellItem(uint _productId, uint _price) public onlyFarmer {
        require(products[_productId].state == State.Packed, "Product not packed");
        require(products[_productId].farmerID == msg.sender, "Not the farmer of this product");
        
        products[_productId].state = State.ForSale;
        products[_productId].price = _price;
        emit ForSale(_productId, _price);
    }
    
    function buyItem(uint _productId) public payable onlyDistributor {
        require(products[_productId].state == State.ForSale, "Product not for sale");
        require(msg.value >= products[_productId].price, "Insufficient funds");
        
        address payable farmerAddress = products[_productId].farmerID;
        farmerAddress.transfer(msg.value);
        
        products[_productId].distributorID = msg.sender;
        products[_productId].state = State.Sold;
        emit Sold(_productId);
    }
    
    function shipItem(uint _productId) public onlyDistributor {
        require(products[_productId].state == State.Sold, "Product not sold");
        require(products[_productId].distributorID == msg.sender, "Not the distributor of this product");
        
        products[_productId].state = State.Shipped;
        emit Shipped(_productId);
    }
    
    function receiveItem(uint _productId) public onlyRetailer {
        require(products[_productId].state == State.Shipped, "Product not shipped");
        
        products[_productId].retailerID = msg.sender;
        products[_productId].state = State.Received;
        emit Received(_productId);
    }
    
    function purchaseItem(uint _productId) public onlyConsumer {
        require(products[_productId].state == State.Received, "Product not received");
        
        products[_productId].consumerID = msg.sender;
    }
    
    function fetchProductState(uint _productId) public view returns (uint) {
        return uint(products[_productId].state);
    }
    
    function fetchProductDetails(uint _productId) public view returns (
        string memory name,
        uint price,
        address farmerID,
        address distributorID,
        address retailerID,
        address consumerID,
        string memory farmName,
        string memory farmInfo,
        string memory latitude,
        string memory longitude,
        uint state
    ) {
        Product memory product = products[_productId];
        
        return (
            product.name,
            product.price,
            product.farmerID,
            product.distributorID,
            product.retailerID,
            product.consumerID,
            product.farmName,
            product.farmInfo,
            product.latitude,
            product.longitude,
            uint(product.state)
        );
    }
}