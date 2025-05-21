// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ProductNFT is ERC721, Ownable {
    // Struct to store product metadata
    struct Product {
        string brand;           // Brand of the luxury good
        string serialNumber;    // Unique serial number
        string materialDetails; // Material details for traceability
    }

    // Mapping from token ID to product metadata
    mapping(uint256 => Product) public products;

    // Counter for generating unique token IDs
    uint256 private _tokenIdCounter;

    // Event triggered when a new NFT is minted
    event ProductMinted(uint256 tokenId, string brand, string serialNumber, string materialDetails, address manufacturer);

    // Constructor to initialize the ERC721 token with name and symbol
    constructor() ERC721("LuxuryProductNFT", "LPNFT") Ownable(msg.sender) {
        _tokenIdCounter = 1; // Start token IDs from 1
    }

    // Function to mint a new NFT, restricted to the contract owner (manufacturer)
    function mint(
        address to,
        string memory brand,
        string memory serialNumber,
        string memory materialDetails
    ) public onlyOwner returns (uint256) {
        require(bytes(brand).length > 0, "Brand cannot be empty");
        require(bytes(serialNumber).length > 0, "Serial number cannot be empty");
        require(bytes(materialDetails).length > 0, "Material details cannot be empty");

        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter += 1;

        // Mint the NFT to the specified address
        _mint(to, tokenId);

        // Store product metadata
        products[tokenId] = Product(brand, serialNumber, materialDetails);

        emit ProductMinted(tokenId, brand, serialNumber, materialDetails, to);

        return tokenId;
    }

    // Function to retrieve product metadata for a given token ID
    function getProduct(uint256 tokenId) public view returns (string memory brand, string memory serialNumber, string memory materialDetails) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        Product memory product = products[tokenId];
        return (product.brand, product.serialNumber, product.materialDetails);
    }
}