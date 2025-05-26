// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Interface to interact with external Mint contract
interface ISimpleMint {
    function ownerOf(uint256 tokenId) external view returns (address);
    function transferFrom(address from, address to, uint256 tokenId) external;
}

// Interface to interact with external control contract
interface IControl {
    function transferOwnership(uint256 tokenId, address newOwner) external;
}

// Sale contract handles product listings and sales of NFTs
contract SaleContract {
    address public manufacturer;    // Manufaturer address
    ISimpleMint public mint;        // Reference to Mint contract
    IControl public control;        // Reference to Control contract

    // Struct to define a sale
    struct Sale {
        string productName;
        uint256 price;
        bool isActive;
        address seller;         
    }

    // Mapping from token ID to sale info
    mapping(uint256 => Sale) public sales;

    // Events
    event ProductListed(uint256 tokenId, string productName, address seller, uint256 price);
    event ProductTransferred(uint256 tokenId, string productName, address from, address to, uint256 price);

    // Modifier to allow only the seller of the token to complete the transfer
    modifier onlySeller(uint256 tokenId) {
        require(sales[tokenId].seller == msg.sender, "Caller is not the seller");
        _;
    }

    // Sets up the mint and control contracts and stores the manufacturer's address
    constructor(address _mintAddress, address _controlAddress) {
        manufacturer = msg.sender;
        mint = ISimpleMint(_mintAddress);
        control = IControl(_controlAddress);
    }

    // Function to list a token for sale
    function sale(uint256 tokenId, string memory productName, uint256 price) public {
        require(mint.ownerOf(tokenId) == msg.sender, "Not owner");
        require(price > 0, "Invalid price");

        sales[tokenId] = Sale(productName, price, true, msg.sender);

        emit ProductListed(tokenId, productName, msg.sender, price);
    }

    // Function to transfer the product to a buyer and finalise (deactivate) the sale
    function saleTransfer(uint256 tokenId, address buyer) public onlySeller(tokenId) {
        Sale storage s = sales[tokenId];

        // Ensure the product is actively listed for sale
        require(s.isActive, "Sale is not active");
        require(buyer != address(0), "Invalid buyer");

        // Transfer the NFT from seller to buyer
        mint.transferFrom(msg.sender, buyer, tokenId);
        control.transferOwnership(tokenId, buyer);

        // Mark the listing as inactive
        s.isActive = false;

        emit ProductTransferred(tokenId, s.productName, msg.sender, buyer, s.price);
    }

    // Directly tranfer token to a recipient without requiring it to be listed for sale
    function directTransfer(uint256 tokenId, address recipient) public {
        require(mint.ownerOf(tokenId) == msg.sender, "Caller is not the owner");

        string memory productName = sales[tokenId].productName;

        // Transfer the NFT
        mint.transferFrom(msg.sender, recipient, tokenId);
        control.transferOwnership(tokenId, recipient);

        emit ProductTransferred(tokenId, productName, msg.sender, recipient, 0); // price is 0 for direct transfers
    } 
}
