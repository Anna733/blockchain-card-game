// SPDX-License-Identifier: None
pragma solidity ^0.6.12;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Cards.sol";

/// @title Implementation of Marketplace for buying and selling cards
/// @author Anna Shramova, anna.nexus.2002@gmail.com
/// @notice Marketplace contract for NFT cards
contract Marketplace is Ownable {
    ///@notice Struct that keeps info about one card sell on marketplace
    struct Ad {
        uint256 cardId;
        uint256 price;
        bool exists;
        address payable wallet;
        address seller;
    }

    ///@notice Number of active ads
    uint256 public numOfAds;

    event SellAd(uint256 indexed _cardId, uint256 indexed _price);
    event Bought(uint256 indexed _cardId, uint256 indexed _price);
    event Canceled(uint256 indexed _cardId);
    event Removed(uint256 indexed _cardId);
    event Edited(uint256 indexed _cardId, uint256 indexed _newPrice);

    ///@notice СardId -> Ad
    mapping(uint256 => Ad) public sellAds;
    ///@notice NFT cards contract
    IERC721 public cards;

    ///@notice Modifier that checks if the card exists
    modifier existingCard(uint256 _cardId) {
        require(sellAds[_cardId].exists == true, "Non-existent card");
        _;
    }

    constructor(address _cards) public {
        cards = IERC721(_cards);
    }

    /// @notice Function to add card on marketplace
    /// @param _cardId is id of card
    /// @param _price is card sale price in Eth
    /// @param _wallet the address to which the money will be sent after the card is sold
    function sell(
        uint256 _cardId,
        uint256 _price,
        address payable _wallet
    ) external {
        require(cards.ownerOf(_cardId) == msg.sender, "Sender must be cardholder");
        require(sellAds[_cardId].exists == false, "Existing card");
        sellAds[_cardId] = Ad({cardId: _cardId, price: _price, exists: true, wallet: _wallet, seller: msg.sender});
        numOfAds++;
        cards.safeTransferFrom(msg.sender, address(this), _cardId);
        emit SellAd(_cardId, _price);
    }

    /// @notice Function to edit your ad which is already on marketplace
    /// @param _cardId is id of card you've put on Marketplace
    /// @param _newPrice is a new(updated) price of card
    function editAd(
        uint256 _cardId,
        uint256 _newPrice,
        address payable _newWallet
    ) external existingCard(_cardId) {
        Ad storage ad = sellAds[_cardId];
        ad.price = _newPrice;
        ad.wallet = _newWallet;

        emit Edited(_cardId, _newPrice);
    }

    /// @notice Function to buy card from Marketplace with Ether
    /// @param _cardId is id of card we want to buy
    /// @param _price is card sale price
    function buyCards(uint256 _cardId, uint256 _price) external payable existingCard(_cardId) {
        require(msg.value >= sellAds[_cardId].price, "Insufficient balance");
        require(_price == sellAds[_cardId].price, "Wrong price");

        removeOrder(_cardId);

        cards.safeTransferFrom(address(this), msg.sender, _cardId);
        uint256 amount = msg.value;
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed.");

        emit Bought(_cardId, _price);
    }

    /// @notice Function to cancel ad on marketplace
    /// @param _cardId is id of card you've posted and want to remove from Marketplace
    function cancel(uint256 _cardId) external {
        require(sellAds[_cardId].exists == true);
        require(sellAds[_cardId].seller == msg.sender);

        removeOrder(_cardId);
        cards.safeTransferFrom(address(this), msg.sender, _cardId);
    }

    /// @notice Removes card from cardsOnSale list
    /// @param _cardId is id of card we want to remove
    function removeOrder(uint256 _cardId) private existingCard(_cardId) {
        sellAds[_cardId].exists = false;
        numOfAds--;
        emit Removed(_cardId);
    }

    /// @notice Getting the properties of an ad
    /// @return price is card sale price in Eth
    /// @return exists is the card available for sale
    /// @return wallet is the address to which money will be sent after token will be sold
    /// @return seller card seller's address
    function getAd(uint256 _cardId)
        external
        view
        returns (
            uint256 price,
            bool exists,
            address payable wallet,
            address seller
        )
    {
        price = sellAds[_cardId].price;
        exists = sellAds[_cardId].exists;
        wallet = sellAds[_cardId].wallet;
        seller = sellAds[_cardId].seller;
    }
}
