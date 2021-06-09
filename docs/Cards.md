# Cards
*Development of ERC-721 and storing cards NFT’s data on blockchain*

*Description*: This contract is the deck of cards for Gwent

**Dev doc**: Each token ID refers to the one card image
co

## Table of contents:
- [Variables](#variables)
- [Functions:](#functions)
  - [`constructor()` (public) ](#cards-constructor--)
  - [`createCardImage(string _name, uint256 _strength, enum Cards.CardImageTypes _cardType)` (external) ](#cards-createcardimage-string-uint256-enum-cards-cardimagetypes-)
  - [`changeCardImageName(uint256 _cardImageId, string _newName)` (external) ](#cards-changecardimagename-uint256-string-)
  - [`changeCardImageStrength(uint256 _cardImageId, uint256 _newStrength)` (external) ](#cards-changecardimagestrength-uint256-uint256-)
  - [`changeCardImageType(uint256 _cardImageId, enum Cards.CardImageTypes _newCardType)` (external) ](#cards-changecardimagetype-uint256-enum-cards-cardimagetypes-)
  - [`mintCard(address _player, string _tokenURI, uint256 _cardImageId)` (external) ](#cards-mintcard-address-string-uint256-)
  - [`getCardImageDataByTokenId(uint256 _tokenId) → string name, uint256 strength, enum Cards.CardImageTypes cardType` (external) ](#cards-getcardimagedatabytokenid-uint256-)
  - [`getCardImage(uint256 _cardImageId) → string name, uint256 strength, enum Cards.CardImageTypes cardType` (external) ](#cards-getcardimage-uint256-)
- [Events:](#events)

## Variables <a name="variables"></a>
- `mapping(uint256 => uint256) card`
- `struct Cards.CardImageData[] cardsImages`

## Functions <a name="functions"></a>

### `constructor()` (public) <a name="cards-constructor--"></a>

*Description*: / @notice Contract constructor

### `createCardImage(string _name, uint256 _strength, enum Cards.CardImageTypes _cardType)` (external) <a name="cards-createcardimage-string-uint256-enum-cards-cardimagetypes-"></a>

*Description*: / @notice Creats card image for Gwent


#### Params
 - `_name`: The name of the card shows what character is on it

 - `_strength`: The strength of the card shows how many points the card gives when used during the battle

 - `_cardType`: Сard type describes where on the battlefield the card will stand

### `changeCardImageName(uint256 _cardImageId, string _newName)` (external) <a name="cards-changecardimagename-uint256-string-"></a>

*Description*: Changes the name of the card


#### Params
 - `_cardImageId`: Card image index

 - `_newName`: New card name

### `changeCardImageStrength(uint256 _cardImageId, uint256 _newStrength)` (external) <a name="cards-changecardimagestrength-uint256-uint256-"></a>

*Description*: Changes the strength of the card  


#### Params
 - `_cardImageId`: Card image index

 - `_newStrength`: New card strength

### `changeCardImageType(uint256 _cardImageId, enum Cards.CardImageTypes _newCardType)` (external) <a name="cards-changecardimagetype-uint256-enum-cards-cardimagetypes-"></a>

*Description*: Changes the type of the card  


#### Params
 - `_cardImageId`: Card image index

 - `_newCardType`: New card type

### `mintCard(address _player, string _tokenURI, uint256 _cardImageId)` (external) <a name="cards-mintcard-address-string-uint256-"></a>

*Description*: Assigning a token to a user and binding it to a card image  


#### Params
 - `_player`: Player address

 - `_tokenURI`: URI for the token

 - `_cardImageId`: Card image index

### `getCardImageDataByTokenId(uint256 _tokenId) → string name, uint256 strength, enum Cards.CardImageTypes cardType` (external) <a name="cards-getcardimagedatabytokenid-uint256-"></a>

*Description*: Getting the properties of a card image by token ID. The card image includes an idea of the card in terms of its characteristics, as a character in the game  


#### Params
 - `_tokenId`: ID of NFT (ERC721)
#### Returns
 - name The name of the card shows what character is on it

 - strength The strength of the card shows how many points the card gives when used during the battle

 - cardType Сard type describes where on the battlefield the card will stand


### `getCardImage(uint256 _cardImageId) → string name, uint256 strength, enum Cards.CardImageTypes cardType` (external) <a name="cards-getcardimage-uint256-"></a>

*Description*: Getting the properties of a card image. The card image includes an idea of the card in terms of its characteristics, as a character in the game

#### Returns
 - name The name of the card shows what character is on it

 - strength The strength of the card shows how many points the card gives when used during the battle

 - cardType Сard type describes where on the battlefield the card will stand
## Events <a name="events"></a>
### event `NewCardImageCreated(uint256 _cardImageId, string _name, uint256 _strength, enum Cards.CardImageTypes _cardType)` <a name="cards-newcardimagecreated-uint256-string-uint256-enum-cards-cardimagetypes-"></a>


### event `NewCardCreated(uint256 _tokenId, address _player)` <a name="cards-newcardcreated-uint256-address-"></a>


### event `ChangedCardImageName(string _name, uint256 _cardImageId)` <a name="cards-changedcardimagename-string-uint256-"></a>


### event `ChangedCardImageStrength(uint256 _strength, uint256 _cardImageId)` <a name="cards-changedcardimagestrength-uint256-uint256-"></a>


### event `ChangedCardImageType(enum Cards.CardImageTypes _cardType, uint256 _cardImageId)` <a name="cards-changedcardimagetype-enum-cards-cardimagetypes-uint256-"></a>


