// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleMint {
    uint256 public tokenCounter;
    address public manufacturer;

    struct ProductMetadata {
        string brand;
        string serialNumber;
        string productType;
        string material;
    }

    mapping(uint256 => ProductMetadata) public tokenMetadata;
    mapping(uint256 => address) public tokenOwner;

    event Minted(uint256 tokenId, address owner);

    constructor() {
        manufacturer = msg.sender;
        tokenCounter = 0;
    }

    function mint(
        string memory brand,
        string memory serialNumber,
        string memory productType,
        string memory material
    ) public {
        require(msg.sender == manufacturer, "Only manufacturer can mint");

        uint256 tokenId = tokenCounter + 1;
        tokenMetadata[tokenId] = ProductMetadata(brand, serialNumber, productType, material);
        tokenOwner[tokenId] = msg.sender;

        emit Minted(tokenId, msg.sender);
        tokenCounter++;
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
