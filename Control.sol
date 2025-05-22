// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ISimpleMint {
    function ownerOf(uint256 tokenID) external view returns (address);
}

contract ControlContract {
    ISimpleMint public mintContract;
    address public manufacturer;

    struct Product {
        uint256 tokenID;
        string qrCode;
        bool verified;
        address currentOwner;
        address[] history;
    }

    mapping(uint256 => Product) public products;
    mapping(address => bool) public authorisedVerifiers;

    event ProductRegistered(uint256 tokenId, string qrCode, address owner);
    event ProductVerified(uint256 tokenId, address verifier);
    event OwnershipTransferred(uint256 tokenId, address from, address to);

    modifier onlyManufacturer() {
        require(msg.sender == manufacturer, "Only manufacturer can call");
        _;
    }

    modifier onlyVerifier() {
        require(authorisedVerifiers[msg.sender], "Not authorised to verify");
        _;
    }

    constructor(address _mintAddress) {
        manufacturer = msg.sender;
        mintContract = ISimpleMint(_mintAddress);
    }

    // Called by SimpleMint when a new token is minted
    function onMint(uint256 tokenId, address owner) external {
        require(msg.sender == address(mintContract), "Only mint contract can call");
        require(products[tokenId].tokenID == 0, "Already registered");

        // Store the product
        products[tokenId] = Product({
            tokenID: tokenId,
            qrCode: "",
            verified: false,
            currentOwner: owner,
            history: new address[](1)
        });
        products[tokenId].history[0] = owner;

        emit ProductRegistered(tokenId, "", owner);
    }

    function register(uint256 tokenId, string memory qrCode) public onlyManufacturer {
        address currentOwner = mintContract.ownerOf(tokenId);
        require(products[tokenId].tokenID == 0, "Already registered");

        // Store the product
        products[tokenId] = Product({
            tokenID: tokenId,
            qrCode: qrCode,
            verified: false,
            currentOwner: currentOwner,
            history: new address[](1)
        });
        products[tokenId].history[0] = currentOwner;

        emit ProductRegistered(tokenId, qrCode, currentOwner);
    }

    function verify(uint256 tokenId) public onlyVerifier {
        require(products[tokenId].tokenID != 0, "Product not registered");

        products[tokenId].verified = true;
        emit ProductVerified(tokenId, msg.sender);
    }

    function getHistory(uint256 tokenId) public view returns (address[] memory) {
        require(products[tokenId].tokenID != 0, "Product not registered");
        return products[tokenId].history;
    }

    function transferOwnership(uint256 tokenId, address newOwner) public {
        require(products[tokenId].currentOwner == msg.sender, "Not current owner");

        products[tokenId].currentOwner = newOwner;
        products[tokenId].history.push(newOwner);

        emit OwnershipTransferred(tokenId, msg.sender, newOwner);
    }

    function addVerifier(address verifier) public onlyManufacturer {
        authorisedVerifiers[verifier] = true;
    }
}