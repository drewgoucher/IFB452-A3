// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Minimal interface to interact with external Mint (NFT) contract
interface IProductNFT {
    function ownerOf(uint256 tokenId) external view returns (address);
    function transferFrom(address from, address to, uint256 tokenId) external;
}
contract SaleContract {
    address public nftAddress;     // Address of the external NFT contract

    IProductNFT public nft;        // Reference to the external NFT contract

    // Struct to define a sale
    struct Sale {
        string productName;     // Name of product
        address seller;         // Address of the seller
        uint256 price;          // Price of the product
        bool isActive;          // Indicates if the listing is active
    }

    // Mapping to store product sale information based on sale ID
    mapping(uint256 => Sale) public sales;

    // Event triggered when a new sale listing is created
    event SaleListed(uint256 tokenId, string productName, address seller, uint256 price);

    // Event triggered when a new sale/transfer is completed
    event ProductTransfer(uint256 tokenId, string productName, address seller, address buyer, uint256 price);

    // Contructor to set NFT contract address
    constructor(address _nftAddress) {
        nftAddress = _nftAddress;
        nft = IProductNFT(nftAddress);
    }

    // Modifier to only allow current owner of the NFT
    modifier onlyOwner(uint256 tokenId) {
        require(nft.ownerOf(tokenId) == msg.sender, "Caller is not the NFT owner");
        _;
    }

    // Modifier to allow only the seller of the token to complete the transfer
    modifier onlySeller(uint256 tokenId) {
        require(sales[tokenId].seller == msg.sender, "Caller is not the seller");
        _;
    }

    // Function to list a product for sale
    function sale(uint256 tokenId, string memory _productName, uint256 price) public onlyOwner(tokenId) {
        sales[tokenId] = Sale(_productName, msg.sender, price, true);
        emit SaleListed(tokenId, _productName, msg.sender, price);
    }

    // Function to transfer the product to a buyer and finalise the sale
    function transfer(uint256 tokenId, address buyer) public onlySeller(tokenId) {
        Sale storage s = sales[tokenId];

        // Ensure the product is actively listed for sale
        require(s.isActive, "Sale is not active");
        require(buyer != address(0), "Invalid buyer");

        // Transfer the NFT from seller to buyer
        nft.transferFrom(msg.sender, buyer, tokenId);

        // Mark the listing as inactive
        s.isActive = false;

        emit ProductTransfer(tokenId, s.productName, msg.sender, buyer, s.price);
    }
}