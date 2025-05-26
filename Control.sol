// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Interface to interact with the Mint Contract
interface ISimpleMint {
    function ownerOf(uint256 tokenID) external view returns (address);
}

// Control contract manages product verification, tracking and ownership history
contract ControlContract {
    ISimpleMint public mintContract;    // Reference to mint contract
    address public manufacturer;        // Manufacturer who deploys this contract
    address public saleContract;        // Sale contract address

    // Struct representing a registered product
    struct Product {
        uint256 tokenID;
        string qrCode;
        bool verified;
        address currentOwner;
        address[] history;
    }

    // Maps token ID to product data
    mapping(uint256 => Product) public products;
    
    // Maps authorised verifiers who can verify products
    mapping(address => bool) public authorisedVerifiers;

    // Array of all registered token IDs
    uint256[] public tokenIds;

    // Events
    event ProductRegistered(uint256 tokenId, string qrCode, address owner);
    event ProductVerified(uint256 tokenId, address verifier);
    event OwnershipTransferred(uint256 tokenId, address from, address to);

    // Modifier to restrict functions to manufacturer only
    modifier onlyManufacturer() {
        require(msg.sender == manufacturer, "Only manufacturer can call");
        _;
    }

    // Modifier to restrict functions to authorised verifiers only
    modifier onlyVerifier() {
        require(authorisedVerifiers[msg.sender], "Not authorised to verify");
        _;
    }

    // Modifier to restrict access to sale contract
    modifier onlySaleContract() {
    require(msg.sender == saleContract, "Only SaleContract can call this");
    _;
    }

    // Sets the manufacturer and links to the mint contract
    constructor(address _mintAddress) {
        manufacturer = msg.sender;
        mintContract = ISimpleMint(_mintAddress);
    }

    // Sets sale contract address (can only be completed by the manufacturer)
    function setSaleContract(address _saleContract) external onlyManufacturer {
        saleContract = _saleContract;
    }

    // Register a product with its token ID and QR code (can only be done by manufacturer)
    function register(uint256 tokenId, string memory qrCode) public onlyManufacturer {
        address currentOwner = mintContract.ownerOf(tokenId);
        require(products[tokenId].tokenID == 0, "Already registered");

        // Create a new product record
        products[tokenId] = Product({
            tokenID: tokenId,
            qrCode: qrCode,
            verified: false,
            currentOwner: currentOwner,
            history: new address[](1)
        });
        
        // Add current owner to ownership history
        products[tokenId].history[0] = currentOwner;

        // Track the registered token ID
        tokenIds.push(tokenId); 

        emit ProductRegistered(tokenId, qrCode, currentOwner);
    }

    // Verifies a registered product (only verifier can call)
    function verify(uint256 tokenId) public onlyVerifier {
        require(products[tokenId].tokenID != 0, "Product not registered");
        products[tokenId].verified = true;
        emit ProductVerified(tokenId, msg.sender);
    }

    // Returns the ownership hisotry of a given product
    function getHistory(uint256 tokenId) public view returns (address[] memory) {
        require(products[tokenId].tokenID != 0, "Product not registered");
        return products[tokenId].history;
    }

    // Transfers ownership of a product (can only call in sale contract)
    function transferOwnership(uint256 tokenId, address newOwner) external onlySaleContract {
        require(products[tokenId].tokenID != 0, "Product not registered");

        address oldOwner = products[tokenId].currentOwner;

        // Update the current owner and push new owner to history
        products[tokenId].currentOwner = newOwner;
        products[tokenId].history.push(newOwner);

        emit OwnershipTransferred(tokenId, oldOwner, newOwner);
    }

    // Adds a new authorised verifier (can only be completed by the manufacturer)
    function addVerifier(address verifier) public onlyManufacturer {
        authorisedVerifiers[verifier] = true;
    }

    // Returns a list of token IDs currently owned by a given address
    function getOwnedTokenIds(address owner) external view returns (uint256[] memory) {
        uint256 count = 0;

        // Loop to count how many tokens the owner has
        for (uint256 i = 0; i < tokenIds.length; i++) {
            if (products[tokenIds[i]].currentOwner == owner) {
                count++;
            }
        }

        // Create array
        uint256[] memory result = new uint256[](count);
        uint256 index = 0;

        // Populate the result array
        for (uint256 i = 0; i < tokenIds.length; i++) {
            if (products[tokenIds[i]].currentOwner == owner) {
                result[index] = tokenIds[i];
                index++;
            }
        }

        return result;
    }
}
