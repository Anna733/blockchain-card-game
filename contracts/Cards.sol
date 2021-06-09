// contracts/Cards.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title Development of ERC-721 and storing cards NFT’s data on blockchain
/// @author Anna Shramova, anna.nexus.2002@gmail.com
/// @notice This contract is the deck of cards for Gwent
/// @dev Each token ID refers to the one card image
contract Cards is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    enum CardImageTypes {CloseCombat, LongRange, Siege}

    struct CardImageData {
        string name;
        uint256 strength;
        CardImageTypes cardType;
    }

    /// @notice token Id -> card image Id
    mapping(uint256 => uint256) public card;
    /// @notice Stores created card images. The card image includes an idea of the card in terms of its characteristics, as a character in the game
    CardImageData[] public cardsImages;
    ///@notice Stores created card images names
    mapping(string => bool) public cardsImagesNames;

    event NewCardImageCreated(uint256 indexed _cardImageId, string _name, uint256 _strength, CardImageTypes _cardType);
    event NewCardCreated(uint256 indexed _tokenId, address indexed _player);
    event ChangedCardImageName(string _name, uint256 indexed _cardImageId);
    event ChangedCardImageStrength(uint256 indexed _strength, uint256 indexed _cardImageId);
    event ChangedCardImageType(CardImageTypes indexed _cardType, uint256 indexed _cardImageId);

    /// @notice Contract constructor
    constructor() public ERC721("Card", "CRD") {}

    /// @notice Creats card image for Gwent card
    /// @param _name The name of the card shows what character is on it
    /// @param _strength The strength of the card shows how many points the card gives when used during the battle
    /// @param _cardType Сard type describes where on the battlefield the card will stand
    function createCardImage(
        string calldata _name,
        uint256 _strength,
        CardImageTypes _cardType
    ) external onlyOwner {
        require(keccak256(abi.encodePacked(_name)) != keccak256(abi.encodePacked("")), "Empty name");
        require(!cardsImagesNames[_name], "Existing name");
        uint256 _cardImageId = cardsImages.length;
        cardsImages.push(CardImageData({name: _name, strength: _strength, cardType: _cardType}));
        cardsImagesNames[_name] = true;
        emit NewCardImageCreated(_cardImageId, _name, _strength, _cardType);
    }

    /// @notice Changes the name of the card
    /// @param _cardImageId Card image index
    /// @param _newName New card name
    function changeCardImageName(uint256 _cardImageId, string calldata _newName) external onlyOwner {
        require(keccak256(abi.encodePacked(_newName)) != keccak256(abi.encodePacked("")), "Empty name");
        require(!cardsImagesNames[_newName], "Existing name");
        cardsImages[_cardImageId].name = _newName;
        emit ChangedCardImageName(_newName, _cardImageId);
    }

    /// @notice Changes the strength of the card
    /// @param _cardImageId Card image index
    /// @param _newStrength New card strength
    function changeCardImageStrength(uint256 _cardImageId, uint256 _newStrength) external onlyOwner {
        cardsImages[_cardImageId].strength = _newStrength;
        emit ChangedCardImageStrength(_newStrength, _cardImageId);
    }

    /// @notice Changes the type of the card
    /// @param _cardImageId Card image index
    /// @param _newCardType New card type
    function changeCardImageType(uint256 _cardImageId, CardImageTypes _newCardType) external onlyOwner {
        cardsImages[_cardImageId].cardType = _newCardType;
        emit ChangedCardImageType(_newCardType, _cardImageId);
    }

    /// @notice Assigning a token to a user and binding it to a card image
    /// @param _player Player address
    /// @param _tokenURI URI for the token
    /// @param _cardImageId Card image index
    function mintCard(
        address _player,
        string memory _tokenURI,
        uint256 _cardImageId
    ) external onlyOwner {
        _tokenIds.increment();
        require(_cardImageId < cardsImages.length, "Non-existent card image id");
        uint256 _tokenId = _tokenIds.current();
        _mint(_player, _tokenId);
        _setTokenURI(_tokenId, _tokenURI);
        card[_tokenId] = _cardImageId;

        emit NewCardCreated(_tokenId, _player);
    }

    /// @notice Getting the properties of a card image by token ID. The card image includes an idea of the card in terms of its characteristics, as a character in the game
    /// @return name The name of the card shows what character is on it
    /// @return strength The strength of the card shows how many points the card gives when used during the battle
    /// @return cardType Сard type describes where on the battlefield the card will stand
    /// @param _tokenId ID of NFT (ERC721)

    function getCardImageDataByTokenId(uint256 _tokenId)
        external
        view
        returns (
            string memory name,
            uint256 strength,
            CardImageTypes cardType
        )
    {
        uint256 cardImageId = card[_tokenId];
        name = cardsImages[cardImageId].name;
        strength = cardsImages[cardImageId].strength;
        cardType = cardsImages[cardImageId].cardType;
    }

    /// @notice Getting the properties of a card image. The card image includes an idea of the card in terms of its characteristics, as a character in the game
    /// @return name The name of the card shows what character is on it
    /// @return strength The strength of the card shows how many points the card gives when used during the battle
    /// @return cardType Сard type describes where on the battlefield the card will stand
    function getCardImage(uint256 _cardImageId)
        external
        view
        returns (
            string memory name,
            uint256 strength,
            CardImageTypes cardType
        )
    {
        name = cardsImages[_cardImageId].name;
        strength = cardsImages[_cardImageId].strength;
        cardType = cardsImages[_cardImageId].cardType;
    }
}
