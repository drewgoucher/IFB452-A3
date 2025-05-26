// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Interface for external control contract that listens to minting events
interface IControlContract {
    function onMint(uint256 tokenId, address owner) external;
}

// Main contract for minting and managing product tokens
contract SimpleMint {
    uint256 public tokenCounter;        // Counter for minted token IDs
    address public manufacturer;        // Contract deployer (manufacturer) address
    address public controlContract;     // External control contract address
    address public saleContract;        // External sale contract address

    // Struct to hold metadata of each token
    struct ProductMetadata {
        string brand;
        string serialNumber;
        string productType;
        string material;
    }

    // Mapping from token ID to metadata
    mapping(uint256 => ProductMetadata) public tokenMetadata;

    // Mapping from token ID to owner
    mapping(uint256 => address) public tokenOwner;

    // Event emitted when new token is minted
    event Minted(uint256 tokenId, address owner);

    // Sets the manufacturer to the deployer and initialises token counter
    constructor() {
        manufacturer = msg.sender;
        tokenCounter = 0;
    }

    // Sets control contract address
    function setControlContract(address _controlContract) public {
        require(msg.sender == manufacturer, "Only manufacturer can set");
        require(controlContract == address(0), "Control contract already set");
        controlContract = _controlContract;
    }

    // Sets sale contract address
    function setSaleContract(address _saleContract) public {
        require(msg.sender == manufacturer, "Only manufacturer can set");
        require(saleContract == address(0), "Sale contract already set");
        saleContract = _saleContract;
    }

    // Function to mint a new token with metadata
    function mint(
        string memory brand,
        string memory serialNumber,
        string memory productType,
        string memory material
    ) public {
        require(msg.sender == manufacturer, "Only manufacturer can mint");

        tokenCounter++;
        uint256 tokenId = tokenCounter;

        // Store metadata and assign ownership
        tokenMetadata[tokenId] = ProductMetadata(brand, serialNumber, productType, material);
        tokenOwner[tokenId] = msg.sender;

        // Emit event for off-chain tracking
        emit Minted(tokenId, msg.sender);
    }

    // Transfers a token from one address to another (only callable by sale contract)
    function transferFrom(address from, address to, uint256 tokenId) external {
        require(msg.sender == saleContract, "Only SaleContract can transfer");
        require(tokenOwner[tokenId] == from, "Not the token owner");

        tokenOwner[tokenId] = to;       // Update ownership
    }

    // Returns the current owner of a token
    function ownerOf(uint256 tokenId) public view returns (address) {
        require(tokenId > 0 && tokenId <= tokenCounter, "Token does not exist");
        return tokenOwner[tokenId];
    }

    // Returns a token's metadata
    function getMetadata(uint256 tokenId) public view returns (string memory, string memory, string memory, string memory) {
        ProductMetadata memory data = tokenMetadata[tokenId];
        return (data.brand, data.serialNumber, data.productType, data.material);
    }
}
