// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IControlContract {
    function onMint(uint256 tokenId, address owner) external;
}

contract SimpleMint {
    uint256 public tokenCounter;
    address public manufacturer;
    address public controlContract;

    struct ProductMetadata {
        string brand;
        string serialNumber;
        string productType;
        string material;
    }

    mapping(uint256 => ProductMetadata) public tokenMetadata;
    mapping(uint256 => address) public tokenOwner;
    mapping(address => bool) public approvedOperators;

    event Minted(uint256 tokenId, address owner);

    constructor() {
        manufacturer = msg.sender;
        tokenCounter = 0;
    }

    // Setter to set control contract address once
    function setControlContract(address _controlContract) public {
        require(msg.sender == manufacturer, "Only manufacturer can set");
        require(controlContract == address(0), "Control contract already set");
        controlContract = _controlContract;
    }

    function approveOperator(address operator) public {
        require(msg.sender == manufacturer, "Only manufacturer can approve");
        approvedOperators[operator] = true;
    }

    function mint(
        string memory brand,
        string memory serialNumber,
        string memory productType,
        string memory material
    ) public {
        require(msg.sender == manufacturer, "Only manufacturer can mint");

        tokenCounter++;
        uint256 tokenId = tokenCounter;

        tokenMetadata[tokenId] = ProductMetadata(brand, serialNumber, productType, material);
        tokenOwner[tokenId] = msg.sender;

        emit Minted(tokenId, msg.sender);

        // Only call onMint if controlContract is set
        if (controlContract != address(0)) {
            IControlContract(controlContract).onMint(tokenId, msg.sender);
        }
    }

    function transferFrom(address from, address to, uint256 tokenId) public {
        require(tokenOwner[tokenId] == from, "Not owner");
        require(msg.sender == from || approvedOperators[msg.sender], "Not authorised");

        tokenOwner[tokenId] = to;
    }

    function ownerOf(uint256 tokenId) public view returns (address) {
        require(tokenId > 0 && tokenId <= tokenCounter, "Token does not exist");
        return tokenOwner[tokenId];
    }

    function getMetadata(uint256 tokenId) public view returns (string memory, string memory, string memory, string memory) {
        ProductMetadata memory data = tokenMetadata[tokenId];
        return (data.brand, data.serialNumber, data.productType, data.material);
    }

}
